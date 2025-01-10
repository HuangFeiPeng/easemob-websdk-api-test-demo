import { EasemobChat } from 'easemob-websdk';

const listenerV3 = 'emListenerV3';
const outConsoleLog = (logContent: string, logData?: any) => {
  console.log(
    `%c${logContent}`,
    `color: red; font-size: 18px`,
    logData,
    `From：${listenerV3}`,
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
