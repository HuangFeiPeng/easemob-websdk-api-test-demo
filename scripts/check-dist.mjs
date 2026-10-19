#!/usr/bin/env node
/**
 * 部署前自检：校验 dist 产物完整性，防止「页面能开、切版本 404」这类问题上线。
 *
 * 检查项：
 * 1. index.html 里引用的 /static、/vite.svg 等绝对路径文件是否存在；
 * 2. sdk/websdk/versions.json 是否存在、default 是否合法；
 * 3. 清单里每个版本的产物文件是否存在、大小是否与清单一致；
 * 4. 应用 bundle 里是否误把 SDK 打进去（多版本方案要求 SDK 只走运行时加载）。
 *
 * 用法：node scripts/check-dist.mjs [--dir=dist]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function arg(name, fallback) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((item) => item.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
}

const DIST = path.resolve(ROOT, arg('dir', 'dist'));
const SDK_MARKER = 'init SDK: Conn';

const results = [];
const errors = [];

async function check(label, run) {
  try {
    const detail = (await run()) || '';
    results.push({ 检查项: label, 结果: 'OK', 说明: detail });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    results.push({ 检查项: label, 结果: 'FAIL', 说明: message });
    errors.push(`${label}: ${message}`);
  }
}

async function readText(file, label) {
  const stat = await fs.stat(file).catch(() => null);
  if (!stat?.isFile()) {
    throw new Error(`${label} 不存在：${path.relative(DIST, file)}`);
  }
  return fs.readFile(file, 'utf8');
}

async function main() {
  await check('dist 目录', async () => {
    const stat = await fs.stat(DIST).catch(() => null);
    if (!stat?.isDirectory()) {
      throw new Error(`${DIST} 不存在，请先执行 pnpm build`);
    }
    return path.relative(ROOT, DIST);
  });

  let indexHtml = null;
  await check('index.html', async () => {
    indexHtml = await readText(path.join(DIST, 'index.html'), 'index.html');
    return `${indexHtml.length} 字符`;
  });

  if (indexHtml) {
    await check('index.html 静态资源引用', async () => {
      const refs = new Set(
        [...indexHtml.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map(
          (match) => match[1].split('?')[0],
        ),
      );
      const missing = [];
      for (const ref of refs) {
        if (ref.startsWith('//')) continue;
        const stat = await fs.stat(path.join(DIST, ref)).catch(() => null);
        if (!stat?.isFile()) missing.push(ref);
      }
      if (missing.length) throw new Error(`缺失 ${missing.join(', ')}`);
      return `${refs.size} 个引用全部存在`;
    });
  }

  let sdkManifest = null;
  await check('SDK 版本清单', async () => {
    const raw = await readText(
      path.join(DIST, 'sdk/websdk/versions.json'),
      '版本清单',
    );
    sdkManifest = JSON.parse(raw);
    if (!Array.isArray(sdkManifest.versions) || !sdkManifest.versions.length) {
      throw new Error('versions 为空');
    }
    return `${sdkManifest.versions.length} 个版本号`;
  });

  if (sdkManifest) {
    await check('SDK 默认版本', async () => {
      const hit = sdkManifest.versions.find(
        (item) => item.version === sdkManifest.default,
      );
      if (!hit) {
        throw new Error(`default=${sdkManifest.default} 不在版本清单中`);
      }
      return sdkManifest.default;
    });

    await check('SDK 版本产物', async () => {
      const problems = [];
      for (const item of sdkManifest.versions) {
        const stat = await fs.stat(path.join(DIST, item.path)).catch(() => null);
        if (!stat?.isFile()) {
          problems.push(`${item.version} 文件缺失`);
        } else if (item.bytes && stat.size !== item.bytes) {
          problems.push(
            `${item.version} 大小不一致（${stat.size} != ${item.bytes}）`,
          );
        }
      }
      if (problems.length) throw new Error(problems.join('；'));
      const files = new Set(sdkManifest.versions.map((item) => item.path));
      return `${sdkManifest.versions.length} 个版本号 / ${files.size} 份产物`;
    });
  }

  await check('应用 bundle 未内置 SDK', async () => {
    const dir = path.join(DIST, 'static/js');
    const files = (await fs.readdir(dir).catch(() => [])).filter((name) =>
      name.endsWith('.js'),
    );
    const leaked = [];
    for (const file of files) {
      const content = await fs.readFile(path.join(dir, file), 'utf8');
      if (content.includes(SDK_MARKER)) leaked.push(file);
    }
    if (leaked.length) {
      throw new Error(
        `以下 chunk 含 SDK 代码，检查是否又出现了 value import：${leaked.join(', ')}`,
      );
    }
    return `${files.length} 个 chunk 均无 SDK 代码`;
  });

  console.table(results);
  if (errors.length) {
    console.error(`\n✗ 自检未通过（${errors.length} 项）：`);
    for (const message of errors) console.error(`  - ${message}`);
    process.exitCode = 1;
    return;
  }
  console.log(`\n✓ dist 自检通过：${path.relative(ROOT, DIST)}`);
}

main().catch((error) => {
  console.error('✗ 自检脚本异常：', error);
  process.exitCode = 1;
});
