/* 环信IM WebSDK 5.x 封装 */
import {
  ChatClient,
  ChatManager,
  ChatRoomManager,
  ContactManager,
  GroupManager,
  PresenceManager,
  PushManager,
  UserInfoManager,
} from 'easemob-websdk-5';
import type {
  CacheManager,
  ChatConversationType,
  ConnectionState,
  InitConfig,
  Message,
} from 'easemob-websdk-5';
import { EM_APPKEY } from '@/constants';
import { addEMClient5Listener } from '@/EaseIM5/listener';

export type {
  ChatConversationType,
  ConnectionState,
  ConversationItem,
  CreateTextMessageParams,
  InitConfig,
  Message,
} from 'easemob-websdk-5';

/** 5.x 初始化配置表单（含身份类型选择） */
export type EM5InitOptions = Omit<InitConfig, 'appKey' | 'appId'> & {
  identityType: 'appKey' | 'appId';
  appKey?: string;
  appId?: string;
};

/** 已挂载全部管理器的 client 类型 */
function createEMClient5(config: InitConfig) {
  return ChatClient.init(config)
    .use(ChatManager)
    .use(GroupManager)
    .use(ChatRoomManager)
    .use(ContactManager)
    .use(PresenceManager)
    .use(PushManager)
    .use(UserInfoManager);
}
export type EMClient5 = ReturnType<typeof createEMClient5>;

/** 模块级单例；未初始化时为 null */
export let emClient5: EMClient5 | null = null;

/** 5.x client 是否已初始化 */
export const isEMClient5Inited = ref(false);
export {
  emClient5ConnectionState,
  isEMClient5LoggedIn,
  receivedMessages5,
} from '@/EaseIM5/listener';

export const initializationEMClient5 = (options: EM5InitOptions) => {
  const { identityType, appKey, appId, deviceId, ...restOptions } = options;
  const config: InitConfig =
    identityType === 'appId' && appId
      ? { appId, ...restOptions }
      : { appKey: appKey || EM_APPKEY, ...restOptions };
  // 空字符串 deviceId 会触发 SDK 校验失败，仅在填写时传递
  if (deviceId) {
    config.deviceId = deviceId;
  }
  const client = createEMClient5(config);
  emClient5 = client;
  isEMClient5Inited.value = true;
  addEMClient5Listener(client);
  return client;
};

/* 各管理器获取函数；未初始化或未登录时可能为 null/undefined，调用方需判空 */
export const getChatManager5 = (): ChatManager | null =>
  emClient5?.chatManager ?? null;
export const getGroupManager5 = (): GroupManager | null =>
  emClient5?.groupManager ?? null;
export const getChatRoomManager5 = (): ChatRoomManager | null =>
  emClient5?.chatRoomManager ?? null;
export const getContactManager5 = (): ContactManager | null =>
  emClient5?.contactManager ?? null;
export const getPresenceManager5 = (): PresenceManager | null =>
  emClient5?.presenceManager ?? null;
export const getPushManager5 = (): PushManager | null =>
  emClient5?.pushManager ?? null;
export const getUserInfoManager5 = (): UserInfoManager | null =>
  emClient5?.userInfoManager ?? null;
export const getCacheManager5 = (): CacheManager | null =>
  emClient5?.getCacheManager() ?? null;

export const getEMClient5ConnectionState = (): ConnectionState =>
  emClient5?.getConnectionState() ?? 'disconnected';
