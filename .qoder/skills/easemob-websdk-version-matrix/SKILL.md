---
name: easemob-websdk-version-matrix
description: 维护本项目内置的 easemob-websdk 4.x 多版本机制（同步版本产物、生成版本清单、运行时加载、部署自检）。当需要新增/升级/删除 SDK 版本，排查「切版本 404」「版本不生效」「SDK 初始化失败」，或改动 src/sdk、public/sdk、scripts/sync-sdk-versions.mjs 时使用。
---

# 环信 WebSDK 多版本机制

## 架构一句话

构建期把每个 4.x 版本的 **UMD 单文件** 放进 `public/sdk/websdk/<version>/`；运行时先读 `versions.json` 选定版本 → `<script>` 注入 → 取 `window.WebIM` → 再动态挂载 Vue 应用。**主应用 bundle 里不含 SDK**，新增版本不需要重新构建。

```
main.ts
  └─ initSdkRuntime()
       ├─ loadManifest()            fetch /sdk/websdk/versions.json
       ├─ resolveSelectedVersion()  ?sdk > localStorage > manifest.default
       └─ loadSdk()                 注入 <script>，等 window.WebIM.connection
  └─ import('./bootstrap')          SDK 就绪后才加载路由/页面
```

## 关键文件

| 文件 | 职责 |
| --- | --- |
| `scripts/sync-sdk-versions.mjs` | 从 npm registry 下载区间内所有版本，解出 `Easemob-chat.js`，生成清单 |
| `public/sdk/websdk/versions.json` | 运行时版本清单（生成的，不要手改） |
| `public/sdk/websdk/<v>/Easemob-chat.js` | 各版本 UMD 产物（生成的，需随包部署） |
| `src/sdk/index.ts` | 对外 API：`initSdkRuntime` / `getWebSdk` / `getSdkVersion` / `switchSdkVersion` |
| `src/sdk/manifest.ts` | 清单读取、版本优先级、切换逻辑 |
| `src/sdk/loader.ts` | UMD 注入、全局变量清理、重复加载保护 |
| `src/components/SdkVersionSelect/index.vue` | 「WebSDK 4.x API 测试」页右上角的下拉框 |
| `scripts/check-dist.mjs` | 部署前自检（引用、清单、产物、SDK 是否误打包） |

## 硬约束（违反通常不会报错，只会静默出错）

1. **业务代码禁止 `import EC from 'easemob-websdk'`**。运行时只能用 `getWebSdk()`；只需要类型时写 `import type { EasemobChat } from 'easemob-websdk'`。
   - `package.json` 里的 `easemob-websdk` 依赖**仅用于类型**；
   - `pnpm dist:check` 会扫描 bundle，发现 `init SDK: Conn` 标记就判失败。
2. **4.x 和 5.x 的加载机制不同，不要复用同一个 loader**：
   - 4.x：自包含 UMD，单文件，挂 `window.WebIM`；
   - 5.x（`easemob-websdk-5`）：纯 ESM + 28 个 chunk + 裸导入 `zod`，必须走打包或 esm.sh / import map。
3. **同一页面只能加载一个 4.x 版本**，所有版本都会覆盖 `window.WebIM` / `window.websdk`。切换版本必须整页刷新，统一走 `switchSdkVersion()`，不要做“原地卸载重载”。
4. **`public/sdk/` 必须随包发布**，且站点部署在**根路径**（产物里是 `/static/...`、`/sdk/...` 绝对路径）。
5. 清单里 `default` 必须存在于 `versions`；`path` 必须是相对站点根的路径。
6. 产物内容完全相同的版本（如 beta 与正式版）复用同一文件并标记 `aliasOf`，不要重复下载/重复占体积。
7. `dist/`、`release/` 不进版本库；`public/sdk/` 需要进库，保证离线/CI 可复现构建。

## 常用操作

### 同步 / 新增版本

```bash
pnpm sdk:sync          # 默认区间 4.19.1~4.24.1（含 beta），增量合并进已有清单
pnpm sdk:sync:force    # 忽略缓存，全部重新下载
```

需要自定义区间或默认版本时直接调脚本（pnpm 转参容易踩坑）：

```bash
node scripts/sync-sdk-versions.mjs --from=4.24.0 --to=4.24.3 --no-prerelease
node scripts/sync-sdk-versions.mjs --prune          # 严格按本次区间重建清单，并删除未引用目录
node scripts/sync-sdk-versions.mjs --default=4.24.1 # 改默认版本
NPM_REGISTRY=https://registry.npmjs.org node scripts/sync-sdk-versions.mjs
```

同步完成后**不需要改业务代码**；跑一次 `pnpm build` 让 `public/sdk` 进 `dist` 即可（纯静态部署时也可以只上传新增的版本目录 + `versions.json`）。

### 发布前自检

```bash
pnpm build
pnpm dist:check
```

`dist:check` 校验：index.html 引用存在、清单可解析、default 合法、每个版本产物存在且大小匹配、bundle 未内置 SDK。

### 打部署包

```bash
mkdir -p release
(cd dist && zip -qr "../release/easemob-websdk-api-test-demo-v$(node -p "require('./package.json').version")-$(date +%Y%m%d).zip" .)
```

## 排障

| 现象 | 原因 / 处理 |
| --- | --- |
| 切版本 404 | `public/sdk` 没部署；或站点不在根路径 |
| 直接访问 `/api-test` 404 | 服务器缺 SPA fallback（`try_files $uri $uri/ /index.html`） |
| 页面显示「SDK 初始化失败」 | 产物缺失/路径错。点「清除版本偏好并重试」，或删除 localStorage 的 `easemob-websdk:selected-version` |
| 选了版本但没生效 | 优先级是 `?sdk` > localStorage > default，检查 URL 和 localStorage |
| 显示版本号与所选版本不一致 | 该版本是 `aliasOf` 别名（beta 与正式版同一份产物），SDK 内部 version 是正式版号，属正常 |
| 控制台排查 | `window.__EASEMOB_SDK__` 里有实际加载的 `version` / `channel` / `src` |

## 部署要求

```nginx
location / {
  try_files $uri $uri/ /index.html;
}

# 版本产物按 URL 永久缓存；清单不缓存
location /sdk/websdk/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
location = /sdk/websdk/versions.json {
  add_header Cache-Control "no-cache";
}
```

## 改动后的验证清单

- [ ] `pnpm build` 通过（含 `vue-tsc`）
- [ ] `pnpm dist:check` 通过
- [ ] `/?sdk=<version>` 打开后页面版本徽标与所选一致
- [ ] 在 4.x API 测试页切换版本，页面刷新且版本变化
- [ ] 新增版本时确认 `versions.json` 与磁盘产物一一对应
