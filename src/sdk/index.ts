import type { EasemobChatStatic } from 'easemob-websdk';
import type { SdkManifest, SdkVersionEntry } from './types';
import {
  loadManifest,
  resolveSelectedVersion,
  switchSdkVersion,
} from './manifest';
import { getLoadedSdk, loadSdk } from './loader';

export interface SdkRuntime {
  /** 当前生效的版本信息 */
  entry: SdkVersionEntry;
  /** 完整版本清单 */
  manifest: SdkManifest;
  /** 已加载的 SDK 默认导出 */
  sdk: EasemobChatStatic;
}

let runtime: SdkRuntime | null = null;

/**
 * 应用启动前调用：读取清单 → 解析选中的版本 → 注入并等待 SDK 就绪。
 * 只有这一步完成后才会加载 Vue 应用，因此业务模块可以安全地在模块顶层取 SDK。
 */
export async function initSdkRuntime(): Promise<SdkRuntime> {
  const manifest = await loadManifest();
  const entry = resolveSelectedVersion(manifest);
  const sdk = await loadSdk(entry);

  runtime = { entry, manifest, sdk };
  console.info(
    `[sdk] 已加载 easemob-websdk v${entry.version}（${entry.channel}）← ${entry.path}`,
  );
  return runtime;
}

export function getSdkRuntime(): SdkRuntime {
  if (!runtime) {
    throw new Error('SDK 尚未初始化，请先执行 initSdkRuntime()');
  }
  return runtime;
}

/** 等价于 `import EC from 'easemob-websdk'`，但指向当前选中的版本 */
export function getWebSdk(): EasemobChatStatic {
  return getSdkRuntime().sdk;
}

export function getSdkVersion(): string {
  return runtime?.entry.version ?? 'unknown';
}

export function getSdkManifest(): SdkManifest | null {
  return runtime?.manifest ?? null;
}

export { loadManifest, switchSdkVersion };
export type { SdkManifest, SdkVersionEntry, SdkChannel } from './types';
