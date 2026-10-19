import './assets/tailwind.css';
import '@arco-design/web-vue/dist/arco.css';
import eruda from 'eruda';
import { initSdkRuntime } from '@/sdk';

eruda.init();

/**
 * 启动顺序很关键：
 * 1. 先按清单加载选中的 SDK 版本（UMD 注入，挂到 window.WebIM）
 * 2. 再动态引入 Vue 应用，这样业务模块在模块顶层拿到的就是正确版本的 SDK
 */
function renderFatalError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error('[sdk] 初始化失败', error);

  const root = document.getElementById('app');
  if (!root) return;

  const wrap = document.createElement('div');
  wrap.style.cssText =
    'max-width:720px;margin:12vh auto;padding:24px;font-family:system-ui,sans-serif;line-height:1.7;color:#1d2129;';

  const title = document.createElement('h2');
  title.textContent = 'SDK 初始化失败';
  title.style.cssText = 'margin:0 0 12px;font-size:20px;';

  const detail = document.createElement('pre');
  detail.textContent = message;
  detail.style.cssText =
    'white-space:pre-wrap;word-break:break-word;background:#f7f8fa;border:1px solid #e5e6eb;border-radius:8px;padding:12px;font-size:13px;';

  const hint = document.createElement('p');
  hint.textContent =
    '常见原因：内置产物缺失（执行 pnpm sdk:sync）、所选版本文件未部署，或静态资源路径不正确。';
  hint.style.cssText = 'color:#86909c;font-size:13px;';

  const reset = document.createElement('button');
  reset.textContent = '清除版本偏好并重试';
  reset.style.cssText =
    'margin-top:8px;padding:8px 16px;border:1px solid #165dff;border-radius:6px;background:#165dff;color:#fff;cursor:pointer;font-size:14px;';
  reset.onclick = () => {
    try {
      window.localStorage.removeItem('easemob-websdk:selected-version');
    } catch {
      /* ignore */
    }
    const url = new URL(window.location.href);
    url.searchParams.delete('sdk');
    window.location.replace(url.toString());
  };

  wrap.append(title, detail, hint, reset);
  root.replaceChildren(wrap);
}

initSdkRuntime()
  .then(() => import('./bootstrap'))
  .catch(renderFatalError);
