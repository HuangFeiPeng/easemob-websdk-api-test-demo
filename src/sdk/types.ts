/** SDK 版本清单与运行时相关的共享类型 */

export type SdkChannel = 'stable' | 'beta';

/** 单个已内置的 SDK 版本 */
export interface SdkVersionEntry {
  /** npm 版本号，如 4.24.1 */
  version: string;
  /** stable / beta */
  channel: SdkChannel;
  /** 相对于站点根目录的脚本路径 */
  path: string;
  bytes?: number;
  sha256?: string;
  publishedAt?: string | null;
  /** 与某个版本的产物完全一致时，复用该版本的文件 */
  aliasOf?: string;
}

/** public/sdk/websdk/versions.json */
export interface SdkManifest {
  name: string;
  generatedAt?: string;
  range?: { from: string; to: string };
  default: string;
  versions: SdkVersionEntry[];
}

declare global {
  interface Window {
    /** 4.x UMD 产物挂载的全局对象，等价于 `import EC from 'easemob-websdk'` */
    WebIM?: any;
    /** 4.x UMD 命名空间，仅含 default */
    websdk?: any;
    /** 当前实际加载的 SDK 信息，便于控制台排查 */
    __EASEMOB_SDK__?: {
      version: string;
      channel: SdkChannel;
      src: string;
    };
  }
}

export {};
