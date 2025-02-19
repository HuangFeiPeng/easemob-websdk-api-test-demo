// 字体为绿色并且更大的console.log输出
import { SDK_TYPES } from '@/constants';
const SDKTypes = useLocalStorage('switchSDK', SDK_TYPES.EASEMOB);
export const outConsoleLog = (
  logContent: string,
  logData?: any,
  type: 'debug' | 'error' = 'debug',
) => {
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
