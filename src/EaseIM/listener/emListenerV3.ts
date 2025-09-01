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
    onCmdMessage(message) {
      outConsoleLog('收到命令消息', message);
    },
    onAudioMessage(message) {
      outConsoleLog('收到音频消息', message);
    },
    onFileMessage(message) {
      outConsoleLog('收到文件消息', message);
    },
    onReadMessage(message) {
      outConsoleLog('收到已读消息', message);
    },
    onPictureMessage(message) {
      outConsoleLog('收到图片消息', message);
    },
    onLocationMessage(message) {
      outConsoleLog('收到位置消息', message);
    },
    onVideoMessage(message) {
      outConsoleLog('收到视频消息', message);
    },
    onCustomMessage(message) {
      outConsoleLog('收到自定义消息', message);
    },
  });
};
