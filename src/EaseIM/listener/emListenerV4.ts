import { EasemobChat } from 'easemob-websdk';

const listenerV4 = 'emListenerV4';
const outConsoleLog = (logContent: string, logData?: any) => {
  // logConentent 字体为蓝色并且更大的console.log输出
  console.log(
    `%c${logContent}`,
    `color: blue; font-size: 18px`,
    logData,
    `From：${listenerV4}`,
  );
};
export const emListenerV4 = (EMClient: EasemobChat.Connection) => {
  console.log('>>>>>emListenerV4 挂载完成....');
  EMClient.addEventHandler('EM_LISTENER', {
    onConnected() {
      outConsoleLog('onConnected');
    },
    onDisconnected() {
      outConsoleLog('onDisconnected');
    },
    onError(err) {
      outConsoleLog('onError', err);
      console.log(`${listenerV4}连接失败`);
    },
    onTextMessage(message) {
      outConsoleLog('onTextMessage', message);
    },
    onReactionChange(msg) {
      outConsoleLog('onReactionChange', msg);
    },
    onMessagePinEvent(eventData) {
      outConsoleLog('onMessagePinEvent', eventData);
    },
    onChannelMessage(msg) {
      outConsoleLog('onChannelMessage', msg);
    },
  });
};
