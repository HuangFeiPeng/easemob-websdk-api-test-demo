/* 环信 WebSDK 5.x 事件监听封装 */
import type { ConnectionState, Message } from 'easemob-websdk-5';
import type { EMClient5 } from '@/EaseIM5';
import { outConsoleLog } from '@/utils/consoleOutput';

const listenerId = 'EM_LISTENER_5';

/** 5.x 当前连接状态（事件驱动更新） */
export const emClient5ConnectionState = ref<ConnectionState>('disconnected');
/** 5.x 当前是否已登录 */
export const isEMClient5LoggedIn = ref(false);
/** 5.x 最近收到的事件消息（共享给消息页展示） */
export const receivedMessages5 = ref<Message[]>([]);

const logEvent = (eventName: string, payload?: unknown) => {
  // SDK 事件：打 console 并写入结果面板的「SDK 事件」
  outConsoleLog(eventName, payload, 'debug', 'event');
};

const outEvent = (
  label: string,
  data?: unknown,
  type: 'debug' | 'error' = 'debug',
) => {
  outConsoleLog(label, data, type, 'event');
};

export const addEMClient5Listener = (client: EMClient5) => {
  console.log('>>>>>EM5 listener 挂载完成....');
  client.addEventHandler(listenerId, {
    /* 连接事件 */
    onConnecting(payload) {
      emClient5ConnectionState.value = payload.state;
      logEvent('onConnecting', payload);
    },
    onConnected(payload) {
      emClient5ConnectionState.value = payload.state;
      isEMClient5LoggedIn.value = true;
      logEvent('onConnected', payload);
    },
    onDisconnected(payload) {
      emClient5ConnectionState.value = payload.state;
      isEMClient5LoggedIn.value = false;
      logEvent('onDisconnected', payload);
    },
    onReconnectFailed(payload) {
      emClient5ConnectionState.value = payload.state;
      logEvent('onReconnectFailed', payload);
    },
    onTokenWillExpire() {
      outEvent(
        'WebSDK5-onTokenWillExpire',
        'token即将过期，请及时调用renewToken',
      );
    },
    onTokenExpired() {
      outEvent('WebSDK5-onTokenExpired', 'token已过期，请重新登录', 'error');
    },
    /* 消息事件 */
    onMessage(message) {
      receivedMessages5.value.unshift(markRaw(message));
      if (receivedMessages5.value.length > 50) {
        receivedMessages5.value.length = 50;
      }
      outEvent('WebSDK5-onMessage', message);
    },
    onMessageDelivered(payload) {
      outEvent('WebSDK5-onMessageDelivered', payload);
    },
    onMessageReadReceipts(payload) {
      outEvent('WebSDK5-onMessageReadReceipts', payload);
    },
    onMessageRecalled(payload) {
      outEvent('WebSDK5-onMessageRecalled', payload);
    },
    onConversationListUpdate(payload) {
      outEvent('WebSDK5-onConversationListUpdate', payload);
    },
    /* 联系人事件 */
    onContactInvited(payload) {
      outEvent('WebSDK5-onContactInvited', payload);
    },
    onContactAdded(payload) {
      outEvent('WebSDK5-onContactAdded', payload);
    },
    onContactDeleted(payload) {
      outEvent('WebSDK5-onContactDeleted', payload);
    },
    onContactAgreed(payload) {
      outEvent('WebSDK5-onContactAgreed', payload);
    },
    onContactRefuse(payload) {
      outEvent('WebSDK5-onContactRefuse', payload);
    },
    /* 群组事件 */
    onInvitationReceived(payload) {
      outEvent('WebSDK5-onInvitationReceived', payload);
    },
    onRequestToJoinReceived(payload) {
      outEvent('WebSDK5-onRequestToJoinReceived', payload);
    },
    onMembersJoined(payload) {
      outEvent('WebSDK5-onMembersJoined', payload);
    },
    onMembersExited(payload) {
      outEvent('WebSDK5-onMembersExited', payload);
    },
    onUserRemoved(payload) {
      outEvent('WebSDK5-onUserRemoved', payload);
    },
    onGroupDestroyed(payload) {
      outEvent('WebSDK5-onGroupDestroyed', payload);
    },
    /* 聊天室事件（SDK 内部聊天室事件以 __chatroom: 前缀派发） */
    '__chatroom:onMembersJoined': (payload) => {
      outEvent('WebSDK5-聊天室onMembersJoined', payload);
    },
    '__chatroom:onRemovedFromChatRoom': (payload) => {
      outEvent('WebSDK5-聊天室onRemovedFromChatRoom', payload);
    },
    /* 在线状态 */
    onPresenceStatusChange(payload) {
      outEvent('WebSDK5-onPresenceStatusChange', payload);
    },
  });
};

export const removeEMClient5Listener = (client: EMClient5) => {
  client.removeEventHandler(listenerId);
};
