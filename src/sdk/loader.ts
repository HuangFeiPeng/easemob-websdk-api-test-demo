import type { EasemobChatStatic } from 'easemob-websdk';
import type { SdkVersionEntry } from './types';

let loadedSdk: EasemobChatStatic | null = null;
let pendingLoad: Promise<EasemobChatStatic> | null = null;

/** 已加载的 SDK 实例（未初始化前为 null） */
export function getLoadedSdk(): EasemobChatStatic | null {
  return loadedSdk;
}

/**
 * 通过 <script> 注入指定版本的 UMD 产物。
 *
 * 4.x 的 Easemob-chat.js 是自包含 UMD，加载后会挂到：
 * - `window.WebIM`：等价于 `import EC from 'easemob-websdk'` 的默认导出
 * - `window.websdk`：仅包含 `default`，不要直接用
 *
 * 注意：同一页面同时加载两个版本会互相覆盖全局变量，所以这里只允许加载一次；
 * 切换版本统一走 `switchSdkVersion()` 整页刷新。
 */
export function loadSdk(entry: SdkVersionEntry): Promise<EasemobChatStatic> {
  if (loadedSdk) return Promise.resolve(loadedSdk);
  if (pendingLoad) return pendingLoad;

  pendingLoad = new Promise<EasemobChatStatic>((resolve, reject) => {
    const src = `${import.meta.env.BASE_URL}${entry.path}`;

    // 清掉上一次可能残留的全局变量，避免串版本
    delete window.WebIM;
    delete window.websdk;

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.sdkVersion = entry.version;

    script.onload = () => {
      const sdk = window.WebIM;
      if (!sdk?.connection) {
        reject(new Error(`SDK 已下载但未找到 window.WebIM.connection：${src}`));
        return;
      }
      loadedSdk = sdk as EasemobChatStatic;
      window.__EASEMOB_SDK__ = {
        version: entry.version,
        channel: entry.channel,
        src,
      };
      resolve(loadedSdk);
    };

    script.onerror = () => {
      reject(
        new Error(
          `SDK 脚本加载失败：${src}\n请确认已执行 \`pnpm sdk:sync\` 或该版本产物已部署。`,
        ),
      );
    };

    document.head.appendChild(script);
  });

  return pendingLoad;
}
