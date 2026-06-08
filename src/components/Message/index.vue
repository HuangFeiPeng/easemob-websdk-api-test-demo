<script setup lang="ts">
import { Message, FileItem } from '@arco-design/web-vue';
import { EasemobChat } from 'easemob-websdk';
import { WebSDK, EMClient } from '@/EaseIM';
import HistoryMessageComp from './historyMessage.vue';
import ReactionMessageComp from './reactionMessage.vue';
import PinMessageComp from './pinMessage.vue';
import { outConsoleLog } from '@/utils/consoleOutput';
// 过滤不可显示发送的消息类型
type FilterMessageType = Exclude<
  EasemobChat.MessageType,
  'delivery' | 'channel'
>;
interface IMessageForm {
  targetId: string;
  msgContent: string;
  chatType: EasemobChat.ChatType;
  messageType: FilterMessageType;
  cursor?: string;
  messageId?: string[];
  pageSize?: number;
  deliverOnlineOnly?: boolean;
  receiverList?: string[];
}
const messageForm = reactive<IMessageForm>({
  targetId: '',
  msgContent: '',
  chatType: 'singleChat',
  messageType: 'txt',
  cursor: '',
  messageId: [],
  pageSize: 20,
  deliverOnlineOnly: false,
  receiverList: [],
});
//发送文本消息
const sendTextMessage = async () => {
  const options: EasemobChat.CreateTextMsgParameters = {
    type: messageForm.messageType as 'txt',
    chatType: messageForm.chatType,
    msg: messageForm.msgContent,
    to: messageForm.targetId,
    deliverOnlineOnly: messageForm.deliverOnlineOnly,
  };
  // 定向消息
  if (
    messageForm.chatType !== 'singleChat' &&
    messageForm.receiverList?.length
  ) {
    options.receiverList = messageForm.receiverList;
  }
  const msg = WebSDK.message.create(options);
  try {
    const { message } = await EMClient.send(msg);
    outConsoleLog('文本消息发送成功', message);

    Message.success('发送文本消息成功');
  } catch (error) {
    outConsoleLog('文本消息发送失败', error, 'error');
    Message.error('发送文本消息失败');
  }
};
//发送图片消息
const sendImageMessage = async () => {
  const options: EasemobChat.CreateImgMsgParameters = {
    type: messageForm.messageType as 'img',
    chatType: messageForm.chatType,
    to: messageForm.targetId,
    file: fileObj.value,
    body: {
      url: 'htttps://www.example.com/example.jpg', // 如果有url可直接传url，没有url传空字符串''
      filename: fileObj.value?.filename || 'example.jpg',
      type: fileObj.value?.filetype || 'image/jpeg',
    },
    deliverOnlineOnly: messageForm.deliverOnlineOnly,
    onFileUploadComplete(data) {
      outConsoleLog('图片上传完成...', data);
    },
    onFileUploadProgress(data) {
      outConsoleLog('图片上传进度展示...', data);
      Message.info(`文件上传中...`);
    },
  };
  // 定向消息
  if (
    messageForm.chatType !== 'singleChat' &&
    messageForm.receiverList?.length
  ) {
    options.receiverList = messageForm.receiverList;
  }
  const msg = WebSDK.message.create(options);
  try {
    const { message } = await EMClient.send(msg);
    outConsoleLog('图片发送成功', message);
    Message.success('发送图片消息成功');
  } catch (error) {
    outConsoleLog('图片发送失败', error, 'error');
    Message.error('发送图片消息失败');
  }
};
//发送视频消息
const sendVideoMessage = async () => {
  const options: any = {
    type: 'video',
    chatType: messageForm.chatType,
    to: messageForm.targetId,
    body: {
      url: 'htttps://www.example.com/example.mp4',
      filename: fileObj.value?.filename || 'example.mp4',
      type: fileObj.value?.filetype || 'video/mp4',
    },
    deliverOnlineOnly: messageForm.deliverOnlineOnly,
    file: fileObj.value,
  };
  // 定向消息
  if (
    messageForm.chatType !== 'singleChat' &&
    messageForm.receiverList?.length
  ) {
    options.receiverList = messageForm.receiverList;
  }
  const msg = WebSDK.message.create(options);
  try {
    const { message } = await EMClient.send(msg);
    outConsoleLog('视频发送成功', message);
    Message.success('发送视频消息成功');
  } catch (error) {
    outConsoleLog('视频发送失败', error, 'error');
    Message.error('发送视频消息失败');
  }
};
//发送命令消息
const sendCmdMessage = async () => {
  const options: EasemobChat.CreateCmdMsgParameters = {
    type: messageForm.messageType as 'cmd',
    chatType: messageForm.chatType,
    action: 'THIS_IS_A_COMMAND',
    to: messageForm.targetId,
    deliverOnlineOnly: messageForm.deliverOnlineOnly,
  };
  // 定向消息
  if (
    messageForm.chatType !== 'singleChat' &&
    messageForm.receiverList?.length
  ) {
    options.receiverList = messageForm.receiverList;
  }
  const msg = WebSDK.message.create(options);
  try {
    const { message } = await EMClient.send(msg);
    outConsoleLog('命令消息发送成功', message);
    Message.success('发送命令消息成功');
  } catch (error) {
    outConsoleLog('命令消息发送失败', error, 'error');
    Message.error('发送命令消息失败');
  }
};
//发送自定义消息
const sendCustomMessage = async () => {
  const options: EasemobChat.CreateCustomMsgParameters = {
    type: messageForm.messageType as 'custom',
    chatType: messageForm.chatType,
    to: messageForm.targetId,
    customEvent: '随意定义的自定义事件名',
    customExts: {
      msg: '随意定义的消息内容',
      nickname: 'XXXXXX',
    },
    deliverOnlineOnly: messageForm.deliverOnlineOnly,
  };
  // 定向消息
  if (
    messageForm.chatType !== 'singleChat' &&
    messageForm.receiverList?.length
  ) {
    options.receiverList = messageForm.receiverList;
  }
  const msg = WebSDK.message.create(options);
  try {
    const { message } = await EMClient.send(msg);
    outConsoleLog('自定义消息发送成功', message);
    Message.success('发送自定义消息成功');
  } catch (error) {
    outConsoleLog('自定义消息发送失败', error, 'error');
    Message.error('发送自定义消息失败');
  }
};
//撤回消息
const recallMessage = async () => {
  if (!messageForm.messageId?.length) {
    Message.error('请输入消息ID');
    return;
  }
  try {
    const res = await EMClient.recallMessage({
      mid: messageForm.messageId[0] as string,
      to: messageForm.targetId,
      ext: messageForm.chatType,
    });
    outConsoleLog('撤回成功', res);
    Message.success('撤回消息成功');
    messageForm.messageId = [];
  } catch (error) {
    outConsoleLog('图片撤回失败', error, 'error');
    Message.error('撤回消息失败');
  }
};
//发送消息已读回执
const sendMessageReadAck = async () => {
  console.log('>>>>>>发送已读回执');
  if (!messageForm.messageId?.length) {
    Message.error('请输入消息ID');
    return;
  }
  const options: EasemobChat.CreateReadMsgParameters = {
    type: 'read',
    to: messageForm.targetId,
    chatType: messageForm.chatType as 'singleChat' | 'groupChat',
    id: messageForm.messageId[0] as string,
  };
  const msg = WebSDK.message.create(options);
  try {
    const res = await EMClient.send(msg);
    outConsoleLog('已读回执发送成功', res);
    Message.success('已读回执发送成功');
  } catch (error) {
    outConsoleLog('已读回执发送失败', error, 'error');
    Message.error('已读回执发送失败');
  }
};
//修改文本消息
const modifyTextMessage = async () => {
  if (!messageForm.messageId?.length) {
    Message.error('请输入消息ID');
    return;
  }
  const textMessagebody = WebSDK.message.create({
    type: 'txt',
    msg: messageForm.msgContent,
    to: messageForm.targetId,
    chatType: messageForm.chatType,
  }) as EasemobChat.TextMsgBody;
  try {
    const res = await EMClient.modifyMessage({
      messageId: messageForm.messageId[0] as string,
      modifiedMessage: textMessagebody,
    });
    outConsoleLog('文本消息修改成功', res);
    Message.success('文本消息修改成功');
    messageForm.messageId = [];
  } catch (error) {
    outConsoleLog('文本消息修改失败', error, 'error');
    Message.error('文本消息修改失败');
  }
};
/* 附件获取 */
const fileData = ref<FileItem>();
const fileObj = ref<EasemobChat.FileObj>();
const getFile = (fileList: FileItem[]) => {
  fileData.value = fileList[0];
  if (fileData.value.file) {
    fileObj.value = {
      url: '',
      filename: fileData.value.file?.name,
      data: fileData.value.file,
      filetype: fileData.value.file?.type,
    };
  }
};
defineOptions({
  name: 'Message',
});
</script>
<template>
  <div class="w-11/12">
    <a-collapse :default-active-key="[1]" accordion :bordered="false">
      <a-collapse-item header="基础消息功能" :key="1">
        <a-form :model="messageForm">
          <a-form-item label="目标ID">
            <a-input
              v-model="messageForm.targetId"
              placeholder="请输入目标ID"
            />
            <template #extra>
              <div>要发送的目标ID，可以是单聊、群组、聊天室ID</div>
            </template>
          </a-form-item>
          <a-form-item
            label="文本消息内容"
            v-show="messageForm.messageType === 'txt'"
          >
            <a-input
              v-model="messageForm.msgContent"
              placeholder="请输入消息内容"
            />
          </a-form-item>
          <!-- 上传文件 -->
          <a-form-item
            label="附件上传"
            v-show="messageForm.messageType === 'img'"
          >
            <a-space direction="vertical">
              <a-upload
                @change="getFile"
                :auto-upload="false"
                :show-retry-button="false"
                :limit="1"
              />
            </a-space>
          </a-form-item>
          <a-form-item label="聊天类型">
            <a-radio-group v-model="messageForm.chatType">
              <a-radio value="singleChat">单聊</a-radio>
              <a-radio value="groupChat">群聊</a-radio>
              <a-radio value="chatRoom">聊天室</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="消息类型">
            <a-radio-group v-model="messageForm.messageType">
              <a-radio value="txt">文本</a-radio>
              <a-radio value="img">图片</a-radio>
              <!-- <a-radio value="audio">语音</a-radio> -->
              <a-radio value="video">视频</a-radio>
              <a-radio value="file" disabled>文件</a-radio>
              <a-radio value="location" disabled>位置</a-radio>
              <a-radio value="cmd">命令</a-radio>
              <a-radio value="custom">自定义</a-radio>
              <a-radio value="read">发送已读回执</a-radio>
            </a-radio-group>
            <template #extra>
              <div>勾选要发送的消息类型</div>
            </template>
          </a-form-item>
          <a-form-item label="发送消息">
            <a-button
              type="primary"
              v-show="messageForm.messageType === 'txt'"
              @click="sendTextMessage"
              >发送文本消息</a-button
            >
            <a-button
              type="primary"
              v-show="messageForm.messageType === 'img'"
              @click="sendImageMessage"
              >发送图片消息</a-button
            >
            <a-button
              type="primary"
              v-show="messageForm.messageType === 'video'"
              @click="sendVideoMessage"
              >发送视频消息</a-button
            >
            <a-button
              type="primary"
              v-show="messageForm.messageType === 'read'"
              @click="sendMessageReadAck"
              >发送已读回执</a-button
            >
            <a-button
              type="primary"
              v-show="messageForm.messageType === 'cmd'"
              @click="sendCmdMessage"
              >发送命令消息</a-button
            >
            <!-- 自定义消息 -->
            <a-button
              type="primary"
              v-show="messageForm.messageType === 'custom'"
              @click="sendCustomMessage"
              >发送自定义消息</a-button
            >
            <template #extra>
              <div>点击按钮执行发送行为</div>
            </template>
          </a-form-item>
          <a-form-item label="是否只投在线">
            <a-switch v-model="messageForm.deliverOnlineOnly" />
          </a-form-item>
          <a-form-item
            v-if="messageForm.chatType !== 'singleChat'"
            label="定向消息Users"
          >
            <a-input-tag
              v-model="messageForm.receiverList"
              placeholder="请输入用户ID"
              :max-tag-count="20"
              allow-clear
              size="small"
            />
            <template #extra>
              <div>
                定向消息发送，需要填写目标ID，并且目标ID为用户ID，可输入多个
              </div>
            </template>
          </a-form-item>
          <a-form-item label="messageId">
            <a-input-tag
              v-model="messageForm.messageId"
              placeholder="请输入消息ID"
              :max-tag-count="5"
              allow-clear
              size="small"
            />
            <template #extra>
              <div>
                要撤回的消息ID，或者为消息漫游接口所需消息ID，可输入多个
              </div>
            </template>
          </a-form-item>
          <a-form-item label="撤回消息">
            <a-button type="primary" @click="recallMessage">撤回消息</a-button>
            <template #extra>
              <div>点击按钮执行撤回行为</div>
            </template>
          </a-form-item>
          <a-form-item label="修改消息">
            <a-button type="primary" @click="modifyTextMessage"
              >文本消息修改</a-button
            >
            <template #extra>
              <div>点击按钮执行修改自己发送的文本消息</div>
            </template>
          </a-form-item>
        </a-form>
      </a-collapse-item>
      <a-collapse-item header="消息漫游" :key="2">
        <history-message-comp></history-message-comp>
      </a-collapse-item>
      <a-collapse-item header="表情回复" :key="3">
        <reaction-message-comp></reaction-message-comp>
      </a-collapse-item>
      <a-collapse-item header="消息置顶" :key="4">
        <pin-message-comp></pin-message-comp>
      </a-collapse-item>
    </a-collapse>
  </div>
</template>
