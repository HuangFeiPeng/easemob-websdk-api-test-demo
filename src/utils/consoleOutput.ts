// 字体为绿色并且更大的console.log输出
export const outConsoleLog = (
  logContent: string,
  logData?: any,
  type: 'debug' | 'error' = 'debug',
) => {
  if (type === 'error') {
    console.error(`%c${logContent}`, `color:red;font-size:16px`, logData);
    return;
  }
  console.log(`%c${logContent}`, `color:green;font-size:16px`, logData);
};
