/* 将任意 SDK 返回值转为可读的纯数据结构（供结果面板预览/复制使用） */

const MAX_DEPTH = 6;

/**
 * 深度转为纯数据：
 * - 包含不可枚举的自有属性（Error 的 message/stack、类实例字段）
 * - 循环引用输出 '[Circular]'，超深度输出 '…'
 * - 函数/BigInt 转为可读字符串，属性访问异常输出 '[unreadable]'
 */
export const toPlainData = (
  value: unknown,
  depth = 0,
  seen = new WeakSet<object>(),
): unknown => {
  if (value === null || value === undefined) return value;
  if (typeof value === 'bigint') return `${value}n`;
  if (typeof value === 'function') {
    return `ƒ ${(value as Function).name || 'anonymous'}()`;
  }
  if (typeof value !== 'object') return value;
  if (seen.has(value)) return '[Circular]';
  if (depth >= MAX_DEPTH) return '…';
  seen.add(value);
  if (Array.isArray(value)) {
    return value.map((item) => toPlainData(item, depth + 1, seen));
  }
  if (value instanceof Date) return value.toISOString();
  if (value instanceof File) {
    return `[File ${value.name} ${value.size}B ${value.type}]`;
  }
  if (value instanceof Blob) {
    return `[Blob ${value.size}B ${value.type}]`;
  }
  const out: Record<string, unknown> = {};
  for (const key of Object.getOwnPropertyNames(value)) {
    try {
      const v = (value as Record<string, unknown>)[key];
      if (typeof v === 'function') continue;
      out[key] = toPlainData(v, depth + 1, seen);
    } catch {
      out[key] = '[unreadable]';
    }
  }
  return out;
};

/** 美化序列化任意值为 JSON 文本，永不抛异常 */
export const safeStringify = (value: unknown): string => {
  try {
    return JSON.stringify(toPlainData(value), null, 2) ?? 'undefined';
  } catch {
    try {
      return String(value);
    } catch {
      return '[unreadable]';
    }
  }
};

/** 单行紧凑序列化（用于条目预览），超长截断 */
export const oneLineStringify = (value: unknown, maxLen = 80): string => {
  if (value === undefined) return '';
  try {
    const text = JSON.stringify(toPlainData(value)) ?? 'undefined';
    return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
  } catch {
    try {
      return String(value);
    } catch {
      return '[unreadable]';
    }
  }
};
