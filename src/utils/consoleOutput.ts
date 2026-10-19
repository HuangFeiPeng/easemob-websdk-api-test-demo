// 字体为绿色并且更大的console.log输出；同时写入页面内结果面板（ResultPanel）
import { SDK_TYPES } from '@/constants';
import { pushResultEntry } from '@/utils/resultStore';
const SDKTypes = useLocalStorage('switchSDK', SDK_TYPES.EASEMOB);
export const outConsoleLog = (
  logContent: string,
  logData?: any,
  type: 'debug' | 'error' = 'debug',
  kind: 'api' | 'event' = 'api',
) => {
  pushResultEntry({
    kind,
    type,
    label: `${SDKTypes.value}-${logContent}`,
    data: logData,
  });
  if (type === 'error') {
    console.error(
      `%c${SDKTypes.value}-${logContent}`,
      `color:red;font-size:16px`,
      logData,
    );
    return;
  }
  console.log(
    `%c${SDKTypes.value}-${logContent}`,
    `color:green;font-size:16px`,
    logData,
  );
};
