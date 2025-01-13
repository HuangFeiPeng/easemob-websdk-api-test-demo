import EC, { EasemobChatStatic, EasemobChat } from 'easemob-websdk';
import { emListenerV4, emListenerV3 } from '@/EaseIM/listener';
export const EM_APPKEY = 'easemob-demo#support';
export let EMClient = {} as EasemobChat.Connection;
export const WebSDK = EC;
export const initializationEMClient = (
  options?: EasemobChat.ConnectionParameters,
) => {
  if (!options) {
    options = { appKey: EM_APPKEY };
  } else if (!options.appKey) {
    options.appKey = EM_APPKEY;
  }
  EMClient = new EC.connection(options);
  emListenerV3(EMClient);
  emListenerV4(EMClient);
};
