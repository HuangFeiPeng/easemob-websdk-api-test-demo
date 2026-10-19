/* API 调用结果 / SDK 事件流的页面内数据源（配合 ResultPanel 组件展示） */

export interface ResultEntry {
  id: number;
  /** HH:mm:ss.SSS 格式时间戳 */
  time: string;
  /** api=主动调用结果；event=SDK 回调事件 */
  kind: 'api' | 'event';
  type: 'debug' | 'error';
  label: string;
  data?: unknown;
}

const MAX_ENTRIES = 200;

// shallowRef：条目里的 data 是任意 SDK 对象（可能带只读非可配置属性），
// 不能被 Vue 深度响应式代理，否则访问其属性会抛 proxy TypeError
export const resultEntries = shallowRef<ResultEntry[]>([]);

let seq = 0;

const pad = (n: number, len = 2) => String(n).padStart(len, '0');

export const pushResultEntry = (
  entry: Omit<ResultEntry, 'id' | 'time'>,
): void => {
  const d = new Date();
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
    d.getSeconds(),
  )}.${pad(d.getMilliseconds(), 3)}`;
  const next = { ...entry, id: ++seq, time };
  resultEntries.value = [next, ...resultEntries.value].slice(0, MAX_ENTRIES);
};

export const clearResultEntries = (kind?: ResultEntry['kind']): void => {
  if (!kind) {
    resultEntries.value = [];
    return;
  }
  resultEntries.value = resultEntries.value.filter((e) => e.kind !== kind);
};
