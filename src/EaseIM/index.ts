import EC,{ EasemobChatStatic,EasemobChat } from 'easemob-websdk'
export let EMClient = {} as EasemobChat.Connection

export const initializationEMClient = (options:EasemobChat.ConnectionParameters) => {
  EMClient = new EC.connection(options)
}

