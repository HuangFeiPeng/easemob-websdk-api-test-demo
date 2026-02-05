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
  }
  // Agora 模式不设置默认值，需要用户手动配置

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
    // 检查AppKey是否有效配置
    if (!options.appKey || options.appKey.trim() === '') {
      console.warn('⚠️  Agora Chat AppKey未配置，请在配置页面设置有效的AppKey（格式：orgName#appName）');
      console.warn('💡 临时使用环信SDK代替，请尽快配置Agora Chat AppKey');
      // 临时使用环信SDK
      client = new EC.connection({
        appKey: EM_APPKEY,
      });
    } else {
      console.log('使用 Agora Chat AppKey:', options.appKey);
      client = new AgoraChat.connection({
        appKey: options.appKey,
      }) as unknown as EasemobChat.Connection;
    }
  } else {
    throw new Error('Invalid SDK type');
  }
  EMClient = client;
  console.log('EMClient', EMClient);
  emListenerV3(EMClient);
  emListenerV4(EMClient);
};
