/* 环信IM */
import EC, { EasemobChatStatic, EasemobChat } from 'easemob-websdk';
import SC, { ShengwangChatStatic, ShengwangChat } from 'shengwang-chat';
import { emListenerV4, emListenerV3 } from '@/EaseIM/listener';
import { SDK_TYPES, EM_APPKEY, SHENGWANG_APPID } from '@/constants';
const SDKTypes = useLocalStorage('switchSDK', SDK_TYPES.EASEMOB);

export let EMClient = {} as EasemobChat.Connection;
export const WebSDK = EC;
export const initializationEMClient = (
  options?: EasemobChat.ConnectionParameters,
) => {
  if (!options) {
    options = {};
  }

  if (SDKTypes.value === SDK_TYPES.EASEMOB) {
    options.appKey = options.appKey || EM_APPKEY;
  } else if (SDKTypes.value === SDK_TYPES.SHENGWANG) {
    options.appId = options.appId || SHENGWANG_APPID;
  }

  let client: EasemobChat.Connection;
  if (SDKTypes.value === SDK_TYPES.EASEMOB) {
    client = new EC.connection(options);
    console.log('>>>环信IM初始化');
  } else if (SDKTypes.value === SDK_TYPES.SHENGWANG) {
    console.log('>>>声网IM初始化');
    client = new SC.connection(options) as unknown as EasemobChat.Connection;
  } else {
    throw new Error('Invalid SDK type');
  }
  EMClient = client;
  emListenerV3(EMClient);
  emListenerV4(EMClient);
};
