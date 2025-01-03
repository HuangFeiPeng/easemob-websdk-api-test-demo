import { EasemobChat } from 'easemob-websdk'
const listenerV4 = 'emListenerV4'
const outConsoleLog = (logContent:string,logData?:any)=>{
    console.log(`%c${listenerV4}`, `color:blue`, logContent,logData)
}
export const emListenerV4 = (EMClient:EasemobChat.Connection)=>{
    console.log('>>>>>emListenerV4 挂载完成....');
    EMClient.addEventHandler('EM_LISTENER',{
        onConnected() {
            outConsoleLog('onConnected')
        },
        onDisconnected() {
            outConsoleLog('onDisconnected')
        },
        onError(err) {
            outConsoleLog('onError',err)
            console.log(listenerV4+'连接失败')
        },
        onTextMessage(message) {
            outConsoleLog('onTextMessage',message)
        },
        onReactionChange(msg) {
            outConsoleLog('onReactionChange',msg)
        },
        onMessagePinEvent(eventData) {
            outConsoleLog('onMessagePinEvent',eventData)
        },
    })
    
}