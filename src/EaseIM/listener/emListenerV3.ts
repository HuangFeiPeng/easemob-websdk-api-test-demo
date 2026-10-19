import { EasemobChat } from 'easemob-websdk';
import { outConsoleLog as outLog } from '@/utils/consoleOutput';
const outConsoleLog = (logContent: string, logData?: any) => {
  // V3 事件回调：打 console 并写入结果面板的「SDK 事件」
  outLog(`V3-${logContent}`, logData, 'debug', 'event');
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
