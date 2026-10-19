import type { SdkManifest, SdkVersionEntry } from './types';

/** 记住用户上次选择的版本 */
export const SDK_VERSION_STORAGE_KEY = 'easemob-websdk:selected-version';

const MANIFEST_URL = `${import.meta.env.BASE_URL}sdk/websdk/versions.json`;

/**
 * 清单文件缺失时的兜底：只保留项目原本使用的版本，
 * 保证即使忘记执行 `pnpm sdk:sync`，应用也不至于白屏。
 */
const FALLBACK_MANIFEST: SdkManifest = {
  name: 'easemob-websdk',
  default: '4.19.1',
  versions: [
    {
      version: '4.19.1',
      channel: 'stable',
      path: 'sdk/websdk/4.19.1/Easemob-chat.js',
    },
  ],
};

let manifestPromise: Promise<SdkManifest> | null = null;

/** 读取版本清单（只请求一次，结果缓存） */
export function loadManifest(): Promise<SdkManifest> {
  if (!manifestPromise) {
    manifestPromise = fetch(MANIFEST_URL, { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<SdkManifest>;
      })
      .then((manifest) => {
        if (!manifest?.versions?.length) throw new Error('versions 为空');
        return manifest;
      })
      .catch((error) => {
        console.warn('[sdk] 版本清单读取失败，回退到内置默认版本', error);
        return FALLBACK_MANIFEST;
      });
  }
  return manifestPromise;
}

function readStoredVersion(): string | null {
  try {
    return window.localStorage.getItem(SDK_VERSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredVersion(version: string) {
  try {
    window.localStorage.setItem(SDK_VERSION_STORAGE_KEY, version);
  } catch {
    /* 隐私模式下忽略 */
  }
}

/**
 * 版本优先级：URL `?sdk=` > localStorage > 清单默认值。
 * 非法值直接忽略，避免手改 URL 把应用搞崩。
 */
export function resolveSelectedVersion(manifest: SdkManifest): SdkVersionEntry {
  const fromUrl = new URL(window.location.href).searchParams.get('sdk');
  const stored = readStoredVersion();

  const candidates = [
    fromUrl,
    stored,
    manifest.default,
    manifest.versions[0]?.version,
  ];

  const matched = candidates
    .map((candidate) =>
      candidate
        ? manifest.versions.find((item) => item.version === candidate)
        : undefined,
    )
    .find((item): item is SdkVersionEntry => Boolean(item));

  const selected = matched ?? manifest.versions[0];
  if (fromUrl === selected.version) writeStoredVersion(selected.version);
  return selected;
}

/** 切换版本：写入偏好后整页刷新，确保 WebSocket / 全局变量 / 缓存都是干净的 */
export function switchSdkVersion(version: string) {
  writeStoredVersion(version);
  const url = new URL(window.location.href);
  url.searchParams.set('sdk', version);
  url.hash = '';
  window.location.replace(url.toString());
}
