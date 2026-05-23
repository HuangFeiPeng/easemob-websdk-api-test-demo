/**
 * 运行时环境检测工具
 * 用于检测当前浏览器/平台环境是否满足 IM SDK 运行要求
 */

export type CheckStatus = 'pass' | 'warn' | 'fail' | 'info';

export interface CheckItem {
  label: string;
  value: string;
  status: CheckStatus;
  description?: string;
}

export interface CheckCategory {
  title: string;
  icon: string;
  items: CheckItem[];
}

export interface EnvironmentCheckResult {
  categories: CheckCategory[];
  summary: {
    total: number;
    pass: number;
    warn: number;
    fail: number;
    isCompatible: boolean;
    message: string;
  };
}

// ========== 浏览器/平台解析 ==========

function parseBrowserInfo() {
  const ua = navigator.userAgent;
  let browserName = '未知浏览器';
  let browserVersion = 'unknown';
  let osName = '未知系统';
  let osVersion = 'unknown';
  let isMobile = false;
  let isWechat = false;
  let isMiniProgram = false;

  // 检测微信
  const wechatMatch = ua.match(/MicroMessenger\/(\d+(\.\d+)*)/);
  if (wechatMatch) {
    isWechat = true;
    browserName = '微信内置浏览器';
    [, browserVersion] = wechatMatch;
  }

  // 检测小程序环境
  if (
    // eslint-disable-next-line dot-notation
    typeof (window as any)['__wxjs_environment'] !== 'undefined' ||
    /miniProgram/.test(ua) ||
    (window as any).wx?.miniProgram?.getEnv
  ) {
    isMiniProgram = true;
  }

  // 浏览器检测（非微信时）
  if (!isWechat) {
    const chromeMatch = ua.match(/Chrome\/(\d+(\.\d+)*)/);
    const safariMatch = ua.match(/Version\/(\d+(\.\d+)*).*Safari/);
    const firefoxMatch = ua.match(/Firefox\/(\d+(\.\d+)*)/);
    const edgeMatch = ua.match(/Edg\/(\d+(\.\d+)*)/);
    const operaMatch = ua.match(/OPR\/(\d+(\.\d+)*)/);

    if (edgeMatch) {
      browserName = 'Microsoft Edge';
      [, browserVersion] = edgeMatch;
    } else if (operaMatch) {
      browserName = 'Opera';
      [, browserVersion] = operaMatch;
    } else if (chromeMatch) {
      browserName = 'Chrome';
      [, browserVersion] = chromeMatch;
    } else if (firefoxMatch) {
      browserName = 'Firefox';
      [, browserVersion] = firefoxMatch;
    } else if (safariMatch) {
      browserName = 'Safari';
      [, browserVersion] = safariMatch;
    }
  }

  // 操作系统检测
  if (/Windows NT 10/.test(ua)) {
    osName = 'Windows';
    osVersion = '10/11';
  } else if (/Windows NT 6\.3/.test(ua)) {
    osName = 'Windows';
    osVersion = '8.1';
  } else if (/Windows NT 6\.2/.test(ua)) {
    osName = 'Windows';
    osVersion = '8';
  } else if (/Windows NT 6\.1/.test(ua)) {
    osName = 'Windows';
    osVersion = '7';
  } else if (/Mac OS X/.test(ua)) {
    osName = 'macOS';
    const macMatch = ua.match(/Mac OS X (\d+[._]\d+)/);
    osVersion = macMatch ? macMatch[1].replace('_', '.') : 'unknown';
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    osName = 'iOS';
    const iosMatch = ua.match(/OS (\d+)[._](\d+)/);
    osVersion = iosMatch ? `${iosMatch[1]}.${iosMatch[2]}` : 'unknown';
    isMobile = true;
  } else if (/Android/.test(ua)) {
    osName = 'Android';
    const androidMatch = ua.match(/Android (\d+(\.\d+)*)/);
    osVersion = androidMatch ? androidMatch[1] : 'unknown';
    isMobile = true;
  } else if (/Linux/.test(ua)) {
    osName = 'Linux';
  }

  // 综合判断移动端
  if (!isMobile) {
    isMobile =
      /Mobile|Android|iPhone|iPad|iPod/.test(ua) || window.innerWidth < 768;
  }

  return {
    browserName,
    browserVersion,
    osName,
    osVersion,
    isMobile,
    isWechat,
    isMiniProgram,
    ua,
  };
}

// ========== 存储检测 ==========

function checkStorage(): CheckItem[] {
  const items: CheckItem[] = [];

  // localStorage
  try {
    const testKey = '__env_check_test__';
    localStorage.setItem(testKey, 'test');
    const value = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    items.push({
      label: 'localStorage',
      value: value === 'test' ? '可用' : '异常',
      status: value === 'test' ? 'pass' : 'warn',
      description: 'IM SDK 需要 localStorage 存储会话数据',
    });
  } catch {
    items.push({
      label: 'localStorage',
      value: '不可用',
      status: 'fail',
      description: '可能被禁用或处于无痕模式',
    });
  }

  // sessionStorage
  try {
    const testKey = '__env_check_test__';
    sessionStorage.setItem(testKey, 'test');
    const value = sessionStorage.getItem(testKey);
    sessionStorage.removeItem(testKey);
    items.push({
      label: 'sessionStorage',
      value: value === 'test' ? '可用' : '异常',
      status: value === 'test' ? 'pass' : 'warn',
    });
  } catch {
    items.push({
      label: 'sessionStorage',
      value: '不可用',
      status: 'fail',
    });
  }

  // IndexedDB
  const hasIndexedDB = typeof indexedDB !== 'undefined';
  items.push({
    label: 'IndexedDB',
    value: hasIndexedDB ? '支持' : '不支持',
    status: hasIndexedDB ? 'pass' : 'warn',
    description: '部分 SDK 功能可能依赖 IndexedDB',
  });

  return items;
}

// ========== WebSocket 检测 ==========

function checkWebSocket(): Promise<CheckItem[]> {
  return Promise.resolve([
    {
      label: 'WebSocket API',
      value: typeof WebSocket !== 'undefined' ? '支持' : '不支持',
      status: typeof WebSocket !== 'undefined' ? 'pass' : 'fail',
      description: 'IM SDK 核心依赖，必须支持',
    },
  ]);
}

// ========== 网络状态检测 ==========

function checkNetwork(): CheckItem[] {
  const items: CheckItem[] = [];
  const conn = (navigator as any).connection;

  items.push({
    label: '网络状态',
    value: navigator.onLine ? '在线' : '离线',
    status: navigator.onLine ? 'pass' : 'fail',
    description: navigator.onLine
      ? undefined
      : '当前设备处于离线状态，无法使用 IM',
  });

  if (conn) {
    const { effectiveType, downlink, saveData } = conn;

    items.push({
      label: '网络类型',
      value: effectiveType.toUpperCase(),
      status: (() => {
        if (effectiveType === '4g') return 'pass';
        if (effectiveType === '3g') return 'warn';
        return 'info';
      })(),
      description:
        '4g/wifi 为最佳，2g 可能无法稳定使用（注：部分浏览器可能无法准确识别网络类型）',
    });

    if (downlink !== 'unknown') {
      items.push({
        label: '下行速度',
        value: `${downlink} Mbps`,
        status: (() => {
          if (downlink >= 1) return 'pass';
          if (downlink >= 0.5) return 'warn';
          return 'info';
        })(),
      });
    }

    if (saveData !== undefined) {
      items.push({
        label: '省流量模式',
        value: saveData ? '已开启' : '未开启',
        status: saveData ? 'warn' : 'pass',
        description: saveData ? '省流量模式可能影响图片/文件传输' : undefined,
      });
    }
  }

  return items;
}

// ========== JS 特性检测 ==========

function checkJSFeatures(): CheckItem[] {
  const items: CheckItem[] = [];

  const features = [
    { name: 'Promise', key: 'Promise', required: true },
    { name: 'fetch', key: 'fetch', required: true },
    { name: 'JSON', key: 'JSON', required: true },
    { name: 'Map', key: 'Map', required: false },
    { name: 'Set', key: 'Set', required: false },
    { name: 'Symbol', key: 'Symbol', required: false },
    { name: 'Proxy', key: 'Proxy', required: false },
    {
      name: 'async/await',
      key: 'AsyncFunction',
      check: () => {
        try {
          // eslint-disable-next-line no-eval
          return eval('typeof async function(){}') === 'function';
        } catch {
          return false;
        }
      },
    },
  ];

  features.forEach((f) => {
    let supported: boolean;
    if (f.check) {
      supported = f.check();
    } else {
      supported = typeof (window as any)[f.key] !== 'undefined';
    }

    items.push({
      label: f.name,
      value: supported ? '支持' : '不支持',
      status: (() => {
        if (supported) return 'pass';
        if (f.required) return 'fail';
        return 'warn';
      })(),
      description: f.required && !supported ? 'IM SDK 必需特性' : undefined,
    });
  });

  return items;
}

// ========== 屏幕/设备检测 ==========

function checkScreen(): CheckItem[] {
  const items: CheckItem[] = [];

  const screenObj = window.screen;

  items.push({
    label: '屏幕分辨率',
    value: `${screenObj.width} x ${screenObj.height}`,
    status: 'info',
  });

  items.push({
    label: '设备像素比 (DPR)',
    value: `${window.devicePixelRatio || 1}x`,
    status: 'info',
  });

  items.push({
    label: '视口尺寸',
    value: `${window.innerWidth} x ${window.innerHeight}`,
    status: 'info',
  });

  items.push({
    label: '色彩深度',
    value: `${screenObj.colorDepth || 'unknown'}-bit`,
    status: 'info',
  });

  return items;
}

// ========== 主检测函数 ==========

export async function runEnvironmentCheck(): Promise<EnvironmentCheckResult> {
  const browserInfo = parseBrowserInfo();

  const categories: CheckCategory[] = [
    {
      title: '基础环境',
      icon: 'icon-desktop',
      items: [
        {
          label: '运行平台',
          value: (() => {
            if (browserInfo.isMiniProgram) return '微信小程序';
            if (browserInfo.isWechat) return '微信内置H5';
            if (browserInfo.isMobile) return '移动端H5';
            return 'PC端H5';
          })(),
          status: 'info',
        },
        {
          label: 'window 对象',
          value: typeof window !== 'undefined' ? '支持' : '不支持',
          status: typeof window !== 'undefined' ? 'pass' : 'fail',
          description: '浏览器核心对象',
        },
        {
          label: 'window.WebIM',
          value: (() => {
            if (typeof window === 'undefined') return '无 window';
            if ((window as any).WebIM) return '已引入';
            return '未引入';
          })(),
          status: (() => {
            if (typeof window === 'undefined') return 'fail';
            if ((window as any).WebIM) return 'pass';
            return 'info';
          })(),
          description: (() => {
            if (typeof window === 'undefined') return undefined;
            if ((window as any).WebIM) return 'IM SDK 已加载到全局';
            return 'IM SDK 未挂载到 window.WebIM';
          })(),
        },
        {
          label: 'document 对象',
          value: typeof document !== 'undefined' ? '支持' : '不支持',
          status: typeof document !== 'undefined' ? 'pass' : 'fail',
        },
        {
          label: 'User Agent',
          value: browserInfo.ua,
          status: 'info',
        },
      ],
    },
    {
      title: '浏览器信息',
      icon: 'icon-browser',
      items: [
        {
          label: '浏览器',
          value: `${browserInfo.browserName} ${browserInfo.browserVersion}`,
          status: 'info',
        },
        {
          label: '操作系统',
          value: `${browserInfo.osName} ${browserInfo.osVersion}`,
          status: 'info',
        },
        {
          label: '设备类型',
          value: browserInfo.isMobile ? '移动端' : '桌面端',
          status: 'info',
        },
        {
          label: '语言',
          value: navigator.language || 'unknown',
          status: 'info',
        },
      ],
    },
    {
      title: '存储支持',
      icon: 'icon-storage',
      items: checkStorage(),
    },
    {
      title: '网络状态',
      icon: 'icon-wifi',
      items: checkNetwork(),
    },
    {
      title: '屏幕与设备',
      icon: 'icon-mobile',
      items: checkScreen(),
    },
    {
      title: 'JavaScript 特性',
      icon: 'icon-code',
      items: checkJSFeatures(),
    },
    {
      title: '安全与协议',
      icon: 'icon-safe',
      items: [
        {
          label: 'HTTPS',
          value: window.location.protocol === 'https:' ? '是' : '否',
          status: window.location.protocol === 'https:' ? 'pass' : 'warn',
          description:
            window.location.protocol === 'https:'
              ? undefined
              : '非 HTTPS 环境可能导致部分功能受限',
        },
        {
          label: 'Cookie 启用',
          value: navigator.cookieEnabled ? '是' : '否',
          status: navigator.cookieEnabled ? 'pass' : 'warn',
        },
      ],
    },
  ];

  // WebSocket 是异步检测，单独处理
  const wsItems = await checkWebSocket();
  categories.splice(2, 0, {
    title: 'WebSocket',
    icon: 'icon-link',
    items: wsItems,
  });

  // 计算汇总
  let total = 0;
  let pass = 0;
  let warn = 0;
  let fail = 0;

  categories.forEach((cat) => {
    cat.items.forEach((item) => {
      total += 1;
      if (item.status === 'pass') pass += 1;
      else if (item.status === 'warn') warn += 1;
      else if (item.status === 'fail') fail += 1;
    });
  });

  const isCompatible = fail === 0;
  const message = (() => {
    if (!isCompatible) {
      return `当前环境存在 ${fail} 项不兼容，可能无法正常使用 IM SDK`;
    }
    if (warn > 0) {
      return `当前环境基本满足 IM SDK 运行要求，但有 ${warn} 项警告需要注意`;
    }
    return '当前环境完全满足 IM SDK 运行要求';
  })();

  return {
    categories,
    summary: {
      total,
      pass,
      warn,
      fail,
      isCompatible,
      message,
    },
  };
}
