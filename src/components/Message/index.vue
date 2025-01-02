<script setup lang="ts">
import { Message, FileItem } from '@arco-design/web-vue';
import { WebSDK, EMClient } from '@/EaseIM';
import { EasemobChat } from 'easemob-websdk';
import HistoryMessageComp from "./historyMessage.vue";
//过滤不可显示发送的消息类型
type FilterMessageType = Exclude<
  EasemobChat.MessageType,
  'delivery' | 'channel' | 'read'
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
}
const messageForm = reactive<IMessageForm>({
  targetId: '',
  msgContent: '',
  chatType: 'singleChat',
  messageType: 'txt',
  cursor: '',
  messageId: [],
  pageSize: 20,
  deliverOnlineOnly:false
});

const sendTextMessage = async () => {
  const options: EasemobChat.CreateTextMsgParameters = {
    type: messageForm.messageType as 'txt',
    chatType: messageForm.chatType,
    msg: messageForm.msgContent,
    to: messageForm.targetId,
  };
  const msg = WebSDK.message.create(options);
  try {
    const { message } = await EMClient.send(msg);
    console.log('message', message);

    Message.success('发送文本消息成功');
  } catch (error) {
    console.log(error);
    Message.error('发送文本消息失败');
  }
};
const sendImageMessage = async () => {
  const options: EasemobChat.CreateImgMsgParameters = {
    type: messageForm.messageType as 'img',
    chatType: messageForm.chatType,
    to: messageForm.targetId,
    file: fileObj.value,
    onFileUploadComplete(data) {
      console.log('data', data);
    },
    onFileUploadProgress(data) {
      console.log('data', data);
      Message.info(`文件上传中...`);
    },
  };
  const msg = WebSDK.message.create(options);
  try {
    const { message } = await EMClient.send(msg);
    console.log('message', message);
    Message.success('发送图片消息成功');
  } catch (error) {
    console.log(error);
    Message.error('发送图片消息失败');
  }
};
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
    console.log('撤回成功', res);
    Message.success('撤回消息成功');
    messageForm.messageId = [];
  } catch (error) {
    console.log(error);
    Message.error('撤回消息失败');
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
</script>
<template>
  <div class="w-11/12 ">
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
              <a-radio value="file">文件</a-radio>
              <a-radio value="location">位置</a-radio>
              <a-radio value="cmd">命令</a-radio>
              <a-radio value="custom">自定义</a-radio>
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
            <template #extra>
              <div>点击按钮执行发送行为</div>
            </template>
          </a-form-item>
          <a-form-item label="是否直投在线">
            <a-switch
              v-model="messageForm.deliverOnlineOnly"
            />
          </a-form-item>
          <a-form-item label="撤回消息">
            <a-button type="primary" @click="recallMessage">撤回消息</a-button>
            <template #extra>
              <div>点击按钮执行撤回行为</div>
            </template>
          </a-form-item>
        </a-form>
      </a-collapse-item>
      <a-collapse-item header="消息漫游" :key="2">
        <history-message-comp></history-message-comp>
      </a-collapse-item>
      <a-collapse-item header="表情回复" :key="3">
        <div>Beijing Toutiao Technology Co., Ltd.</div>
      </a-collapse-item>
      <a-collapse-item header="消息置顶" :key="4">
        <div>Beijing Toutiao Technology Co., Ltd.</div>
      </a-collapse-item>
    </a-collapse>
  </div>
</template>
