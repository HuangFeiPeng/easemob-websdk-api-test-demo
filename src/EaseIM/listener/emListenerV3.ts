import { EasemobChat } from 'easemob-websdk';
import { SDK_TYPES } from '@/constants';
const SDKTypes = useLocalStorage('switchSDK', SDK_TYPES.EASEMOB);
const listenerV3 = 'emListenerV3';
const outConsoleLog = (logContent: string, logData?: any) => {
  console.log(
    `%c${logContent}`,
    `color: red; font-size: 18px`,
    logData,
    `From：${SDKTypes.value}-${listenerV3}`,
  );
};
export const emListenerV3 = (EMClient: EasemobChat.Connection) => {
  console.log('>>>>>emListenerV3 挂载完成....');
  EMClient.listen({
    onOpened() {
      outConsoleLog('onOpened');
    },
    onClosed() {
      outConsoleLog('onClosed');
    },
    onError(message) {
      outConsoleLog('onError', message);
    },
    onTextMessage(message) {
      outConsoleLog('收到文本消息', message);
    },
  });
};
