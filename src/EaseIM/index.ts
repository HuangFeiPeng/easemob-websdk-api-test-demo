/* 环信IM */
import EC, { EasemobChatStatic, EasemobChat } from 'easemob-websdk';
import SC, { ShengwangChatStatic, ShengwangChat } from 'shengwang-chat';
import AgoraChat from 'agora-chat';
import { emListenerV4, emListenerV3 } from '@/EaseIM/listener';
import { SDK_TYPES, EM_APPKEY, SHENGWANG_APPID, AGORA_APPKEY } from '@/constants';
const SDKTypes = useLocalStorage('switchSDK', SDK_TYPES.EASEMOB);
console.log('[DEBUG] 实际SDK类型:', SDKTypes.value);
console.log('[DEBUG] 本地存储值:', localStorage.getItem('switchSDK'));
export let EMClient = {} as EasemobChat.Connection;
EC.logger.onLog = (data)=>{console.log('EasemobChat log:', data)};
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
  } else if (SDKTypes.value === SDK_TYPES.AGORA) {
    options.appKey = options.appKey || AGORA_APPKEY;
  }

  let client: EasemobChat.Connection;
  if (SDKTypes.value === SDK_TYPES.EASEMOB) {
    console.log('options++++', options);
    client = new EC.connection({
      appKey: options.appKey || EM_APPKEY,
      // 明确排除appId参数
      ...Object.fromEntries(
        Object.entries(options).filter(([k]) => k !== 'appId'),
      ),
    });
    console.log('>>>环信IM初始化');
  } else if (SDKTypes.value === SDK_TYPES.SHENGWANG) {
    console.log('>>>声网IM初始化');
    client = new SC.connection(
      options as ShengwangChat.ConnectionParameters,
    ) as unknown as EasemobChat.Connection;
  } else if (SDKTypes.value === SDK_TYPES.AGORA) {
    console.log('>>>Agora Chat 初始化');
    client = new AgoraChat.connection({
      appKey: options.appKey || AGORA_APPKEY,
    }) as unknown as EasemobChat.Connection;
  } else {
    throw new Error('Invalid SDK type');
  }
  EMClient = client;
  console.log('EMClient', EMClient);
  emListenerV3(EMClient);
  emListenerV4(EMClient);
};
