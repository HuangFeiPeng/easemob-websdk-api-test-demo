import { EasemobChat } from 'easemob-websdk'
const listenerV3 = 'emListenerV3'
const outConsoleLog = (logContent:string,logData?:any)=>{
    console.log(`%c${listenerV3}`, `color:red`, logContent,logData)
}
export const emListenerV3 = (EMClient:EasemobChat.Connection) =>{
    console.log('>>>>>emListenerV3 挂载完成....');
    EMClient.listen({
        onOpened() {
            outConsoleLog('onOpened')
        },
        onClosed() {
            outConsoleLog('onClosed')
        },
        onError(message) {
            outConsoleLog('onError',message)
        },
        onTextMessage(message) {
            outConsoleLog('收到文本消息', message)
        },
    })
}