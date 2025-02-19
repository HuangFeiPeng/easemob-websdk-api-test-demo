import { EasemobChat } from 'easemob-websdk';
import { SDK_TYPES } from '@/constants';
const SDKTypes = useLocalStorage('switchSDK', SDK_TYPES.EASEMOB);
const listenerV4 = 'emListenerV4';
const outConsoleLog = (logContent: string, logData?: any) => {
  // logConentent 字体为蓝色并且更大的console.log输出
  console.log(
    `%c${logContent}`,
    `color: blue; font-size: 18px`,
    logData,
    `From：${SDKTypes.value}-${listenerV4}`,
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
    onReconnecting() {
      outConsoleLog('onReconnecting');
    },
    onError(err) {
      outConsoleLog('onError', err);
      console.log(`${listenerV4}连接失败`);
    },
    onTokenExpired() {
      outConsoleLog('onTokenExpired');
    },
    onTokenWillExpire() {
      outConsoleLog('onTokenWillExpire');
    },
    /* 消息 */
    onTextMessage(message) {
      outConsoleLog('onTextMessage', message);
    },
    onFileMessage(msg) {
      outConsoleLog('onFileMessage', msg);
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
    onModifiedMessage(msg) {
      outConsoleLog('onModifiedMessage', msg);
    },
    /* 群组事件 */
    onGroupChange(event) {
      outConsoleLog('onGroupChange', event);
    },
    onGroupEvent(eventData) {
      outConsoleLog('onGroupEvent', eventData);
    },
    /* 联系人 */
    onContactInvited(eventData) {
      outConsoleLog('onContactInvited', eventData);
    },
    onContactDeleted(eventData) {
      outConsoleLog('onContactDeleted', eventData);
    },
    onContactAdded(msg) {
      outConsoleLog('onContactAdded', msg);
    },
    onContactAgreed(msg) {
      outConsoleLog('onContactAgreed', msg);
    },
    onContactRefuse(msg) {
      outConsoleLog('onContactRefuse', msg);
    },
    /* 在线状态订阅 */
    onPresenceStatusChange(msg) {
      outConsoleLog('onPresenceStatusChange', msg);
    },
    /* 聊天室 */
    onChatroomEvent(eventData) {
      outConsoleLog('onChatroomEvent', eventData);
    },
    onChatroomChange(eventData) {
      outConsoleLog('onChatroomChange', eventData);
    },
  });
};
