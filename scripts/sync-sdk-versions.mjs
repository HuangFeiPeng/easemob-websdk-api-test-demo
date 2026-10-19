#!/usr/bin/env node
/**
 * 把指定区间内 npm 上发布过的 easemob-websdk 版本，全部下载到
 * public/sdk/websdk/<version>/Easemob-chat.js，并生成 versions.json 清单。
 *
 * 因为 4.x 的产物是自包含的 UMD 单文件（无裸依赖、无 chunk），
 * 所以不需要二次打包，直接原样静态托管即可在运行时按需加载。
 *
 * 内容完全相同的版本（例如 beta 与正式版发布的是同一份产物）会复用同一个文件，
 * 避免重复占用体积；清单里仍保留两个版本号，便于按版本号选择。
 *
 * 用法：
 *   node scripts/sync-sdk-versions.mjs                # 增量同步（已存在则跳过）
 *   node scripts/sync-sdk-versions.mjs --force        # 强制重新下载
 *   node scripts/sync-sdk-versions.mjs --no-prerelease # 不包含 beta/rc
 *   NPM_REGISTRY=https://registry.npmjs.org node scripts/sync-sdk-versions.mjs
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** 读取 `--name=value` 形式的命令行参数 */
function arg(name, fallback) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((item) => item.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
}

const CONFIG = {
  name: 'easemob-websdk',
  /** 区间起点（含），可用 --from=4.19.1 覆盖 */
  from: arg('from', '4.19.1'),
  /** 区间终点（含），可用 --to=4.24.1 覆盖 */
  to: arg('to', '4.24.1'),
  /** 是否包含 beta / rc 等预发布版本（--no-prerelease 关闭） */
  includePrerelease: !process.argv.includes('--no-prerelease'),
  /** 未指定版本时默认加载哪个，可用 --default=4.24.1 覆盖 */
  defaultVersion: arg('default', '4.19.1'),
  /** 主产物文件名（4.x 固定） */
  entryFile: 'Easemob-chat.js',
  registry: process.env.NPM_REGISTRY || 'https://registry.npmmirror.com',
  outDir: path.join(ROOT, 'public/sdk/websdk'),
};

const FORCE = process.argv.includes('--force');

/** @param {string} v */
function parseVersion(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(v);
  if (!m) return null;
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    pre: m[4] || '',
  };
}

function compareVersions(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  for (const key of ['major', 'minor', 'patch']) {
    if (pa[key] !== pb[key]) return pa[key] - pb[key];
  }
  if (pa.pre === pb.pre) return 0;
  if (!pa.pre) return 1; // release > prerelease
  if (!pb.pre) return -1;
  return pa.pre < pb.pre ? -1 : 1;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`GET ${url} -> HTTP ${res.status}`);
  return res.json();
}

async function loadPackument() {
  const registries = [CONFIG.registry, 'https://registry.npmjs.org'].filter(
    (item, index, list) => list.indexOf(item) === index,
  );

  let lastError;
  for (const registry of registries) {
    try {
      console.log(`· 读取 registry: ${registry}`);
      return await fetchJson(`${registry}/${CONFIG.name}`);
    } catch (error) {
      lastError = error;
      console.warn(`  registry 不可用: ${error.message}`);
    }
  }
  throw lastError;
}

function pickVersions(packument) {
  const targetMajor = parseVersion(CONFIG.from).major;
  return Object.keys(packument.versions)
    .filter((version) => parseVersion(version))
    .filter((version) => {
      const parsed = parseVersion(version);
      if (parsed.major !== targetMajor) return false;
      if (parsed.pre && !CONFIG.includePrerelease) return false;
      return (
        compareVersions(version, CONFIG.from) >= 0 &&
        compareVersions(version, CONFIG.to) <= 0
      );
    })
    .sort(compareVersions);
}

async function sha256(file) {
  const buffer = await fs.readFile(file);
  return createHash('sha256').update(buffer).digest('hex');
}

async function fileExists(file) {
  return fs
    .stat(file)
    .then((stat) => stat.size > 1024)
    .catch(() => false);
}

/** 下载并解出指定版本的 UMD 产物到临时目录，返回源文件路径 */
async function extractEntry({ version, tarball }) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'easemob-sdk-'));
  try {
    console.log(`  ↓ ${version} ${tarball}`);
    const res = await fetch(tarball);
    if (!res.ok) throw new Error(`下载失败 HTTP ${res.status}`);
    const tgz = path.join(tmpDir, `${version}.tgz`);
    await fs.writeFile(tgz, Buffer.from(await res.arrayBuffer()));

    execFileSync(
      'tar',
      ['-xzf', tgz, '-C', tmpDir, `package/${CONFIG.entryFile}`],
      { stdio: 'ignore' },
    );

    const source = path.join(tmpDir, 'package', CONFIG.entryFile);
    const content = await fs.readFile(source, 'utf8');
    if (!content.includes('WebIM')) {
      throw new Error('产物内容异常：未找到 WebIM 全局导出，可能不是 UMD 单文件');
    }
    return { source, tmpDir };
  } catch (error) {
    await fs.rm(tmpDir, { recursive: true, force: true });
    throw error;
  }
}

async function main() {
  const packument = await loadPackument();
  const versions = pickVersions(packument);
  if (!versions.length) {
    throw new Error(`没有找到 ${CONFIG.from} ~ ${CONFIG.to} 之间的版本`);
  }

  console.log(
    `· 区间 ${CONFIG.from} ~ ${CONFIG.to}（含预发布：${CONFIG.includePrerelease ? '是' : '否'}）共 ${versions.length} 个版本`,
  );

  /** sha256 -> 第一个使用该产物的版本 */
  const byHash = new Map();
  const entries = [];

  // 先处理正式版，再处理预发布版：产物重复时由正式版持有文件，beta 做别名
  const downloadOrder = [...versions].sort((a, b) => {
    const preA = parseVersion(a).pre ? 1 : 0;
    const preB = parseVersion(b).pre ? 1 : 0;
    return preA - preB || compareVersions(a, b);
  });

  for (const version of downloadOrder) {
    const meta = packument.versions[version];
    const channel = parseVersion(version).pre ? 'beta' : 'stable';
    const targetDir = path.join(CONFIG.outDir, version);
    const targetFile = path.join(targetDir, CONFIG.entryFile);
    const cached = await fileExists(targetFile);

    let tmpDir = null;
    let source = targetFile;
    if (!cached || FORCE) {
      const extracted = await extractEntry({ version, tarball: meta.dist.tarball });
      source = extracted.source;
      tmpDir = extracted.tmpDir;
    } else {
      console.log(`  ↷ ${version} 已存在，跳过下载`);
    }

    try {
      const hash = await sha256(source);
      const duplicate = byHash.get(hash);

      let entryPath;
      if (duplicate) {
        entryPath = duplicate.path;
        console.log(`  = ${version} 与 ${duplicate.version} 产物完全一致，复用同一文件`);
        // 之前可能生成过重复目录，清掉（force 重跑时也清理）
        await fs.rm(targetDir, { recursive: true, force: true });
      } else {
        entryPath = `sdk/websdk/${version}/${CONFIG.entryFile}`;
        if (source !== targetFile) {
          await fs.mkdir(targetDir, { recursive: true });
          await fs.copyFile(source, targetFile);
        }
        byHash.set(hash, { version, path: entryPath });
      }

      const stat = await fs.stat(path.join(ROOT, 'public', entryPath));

      entries.push({
        version,
        channel,
        path: entryPath,
        bytes: stat.size,
        sha256: hash,
        publishedAt: packument.time?.[version] || null,
        ...(duplicate ? { aliasOf: duplicate.version } : {}),
      });
    } finally {
      if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }

  entries.sort((a, b) => compareVersions(a.version, b.version));

  // 默认把已有清单合并进来，便于分批扩展区间；--prune 时严格以本次区间为准
  const manifestFile = path.join(CONFIG.outDir, 'versions.json');
  const kept = PRUNE ? [] : await readExistingEntries(manifestFile, versions);
  const allEntries = [...kept, ...entries].sort((a, b) =>
    compareVersions(a.version, b.version),
  );

  const defaultVersion = allEntries.some(
    (entry) => entry.version === CONFIG.defaultVersion,
  )
    ? CONFIG.defaultVersion
    : allEntries[0]?.version;

  const manifest = {
    name: CONFIG.name,
    generatedAt: new Date().toISOString(),
    range: { from: CONFIG.from, to: CONFIG.to },
    default: defaultVersion,
    versions: allEntries,
  };

  await fs.mkdir(CONFIG.outDir, { recursive: true });
  await fs.writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  if (PRUNE) await pruneUnreferencedDirs(allEntries);

  const uniqueFiles = new Set(allEntries.map((entry) => entry.path));
  const total = allEntries
    .filter((entry) => !entry.aliasOf)
    .reduce((sum, entry) => sum + entry.bytes, 0);

  console.table(
    allEntries.map((entry) => ({
      version: entry.version,
      channel: entry.channel,
      size: `${(entry.bytes / 1024).toFixed(0)} KB`,
      aliasOf: entry.aliasOf || '',
      publishedAt: (entry.publishedAt || '').slice(0, 10),
    })),
  );
  console.log(
    `✓ 清单已写入 ${path.relative(ROOT, manifestFile)}：${allEntries.length} 个版本号 / ${uniqueFiles.size} 份产物 / ${(total / 1024 / 1024).toFixed(1)} MB`,
  );
}

const PRUNE = process.argv.includes('--prune');

/** 读取已有清单里仍然有效的条目（本次区间内的会被覆盖） */
async function readExistingEntries(manifestFile, currentVersions) {
  try {
    const parsed = JSON.parse(await fs.readFile(manifestFile, 'utf8'));
    const kept = [];
    for (const entry of parsed.versions || []) {
      if (!entry?.version || !entry?.path) continue;
      if (currentVersions.includes(entry.version)) continue;
      if (await fileExists(path.join(ROOT, 'public', entry.path))) {
        kept.push(entry);
      } else {
        console.warn(`  ! 丢弃失效条目 ${entry.version}（产物文件不存在）`);
      }
    }
    if (kept.length) {
      console.log(`· 保留已有清单中的 ${kept.length} 个版本`);
    }
    return kept;
  } catch {
    return [];
  }
}

/** 删除清单中不再引用的版本目录 */
async function pruneUnreferencedDirs(entries) {
  const referenced = new Set(
    entries.map((entry) => path.dirname(path.join(ROOT, 'public', entry.path))),
  );
  const dirs = await fs.readdir(CONFIG.outDir, { withFileTypes: true });
  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    const abs = path.join(CONFIG.outDir, dir.name);
    if (!referenced.has(abs)) {
      console.log(`  - 清理未引用目录 ${dir.name}`);
      await fs.rm(abs, { recursive: true, force: true });
    }
  }
}

main().catch((error) => {
  console.error('✗ 同步失败:', error);
  process.exitCode = 1;
});
