<script setup lang="ts">
import { EMClient } from '@/EaseIM';
import { IconDelete } from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
import { EasemobChat } from 'easemob-websdk';
type FilterMessageType = Exclude<
  EasemobChat.MessageType,
  'delivery' | 'channel' | 'read'
>;
interface IGetHistoryMessageForm {
  targetId: string;
  msgContent: string;
  chatType: EasemobChat.ChatType;
  messageType: FilterMessageType;
  cursor?: string;
  messageId?: string[];
  pageSize?: number;
}
const getHistoryMessageForm = reactive<IGetHistoryMessageForm>({
  targetId: '',
  msgContent: '',
  chatType: 'singleChat',
  messageType: 'txt',
  cursor: '',
  messageId: [],
  pageSize: 20,
});
const getHistoryMessage = async () => {
  if (!getHistoryMessageForm.targetId) {
    Message.error('请输入目标ID');
    return;
  }
  try {
    const res = await EMClient.getHistoryMessages({
      targetId: getHistoryMessageForm.targetId,
      chatType: getHistoryMessageForm.chatType,
      pageSize: getHistoryMessageForm.pageSize,
      cursor: getHistoryMessageForm.cursor,
      searchDirection: 'up',
    });
    console.log('获取历史消息', res);
    Message.success('获取历史消息成功');
  } catch (error) {
    console.log(error);
    Message.error('获取历史消息失败');
  }
};
const deleteHistoryMessageWithMsgIds = async () => {
  if (!getHistoryMessageForm.targetId) {
    Message.error('请输入目标ID');
    return;
  }
  try {
    const res = await EMClient.removeHistoryMessages({
      targetId: getHistoryMessageForm.targetId,
      chatType: getHistoryMessageForm.chatType,
      messageIds: getHistoryMessageForm.messageId,
    });
    console.log('删除历史消息', res);
    Message.success('删除历史消息成功');
  } catch (error) {
    console.log(error);
    Message.error('删除历史消息失败');
  }
};
</script>
<template>
  <div>
    <a-form :model="getHistoryMessageForm">
      <a-form-item label="目标ID">
        <a-input
          v-model="getHistoryMessageForm.targetId"
          placeholder="请输入目标ID"
        />
        <template #extra>
          <div>要发送的目标ID，可以是单聊、群组、聊天室ID</div>
        </template>
      </a-form-item>
      <a-form-item label="messageId">
        <a-input-tag
          v-model="getHistoryMessageForm.messageId"
          placeholder="请输入消息ID"
          :max-tag-count="5"
          allow-clear
          size="small"
        />
        <template #extra>
          <div>要撤回的消息ID，或者为消息漫游接口所需消息ID，可输入多个</div>
        </template>
      </a-form-item>
      <a-form-item label="聊天类型">
        <a-radio-group v-model="getHistoryMessageForm.chatType">
          <a-radio value="singleChat">单聊</a-radio>
          <a-radio value="groupChat">群聊</a-radio>
          <a-radio value="chatRoom">聊天室</a-radio>
        </a-radio-group>
      </a-form-item>
      <!-- <a-form-item label="消息类型">
      <a-radio-group v-model="getHistoryMessageForm.messageType">
        <a-radio value="txt">文本</a-radio>
        <a-radio value="img">图片</a-radio>
        <a-radio value="audio">语音</a-radio>
        <a-radio value="video">视频</a-radio>
        <a-radio value="file">文件</a-radio>
        <a-radio value="location">位置</a-radio>
        <a-radio value="cmd">命令</a-radio>
        <a-radio value="custom">自定义</a-radio>
      </a-radio-group>
      <template #extra>
        <div>勾选要发送的消息类型</div>
      </template>
    </a-form-item> -->
      <a-form-item label="漫游页数">
        <a-input-number v-model="getHistoryMessageForm.pageSize" :max="50" />
        <template #extra>
          <div>输入要获取的消息页数</div>
        </template>
      </a-form-item>
      <a-form-item label="漫游获取cursor">
        <a-input
          v-model="getHistoryMessageForm.cursor"
          placeholder="请输入cursor"
        />
        <template #extra>
          <div>输入要获取的消息cursor</div>
        </template>
      </a-form-item>
      <a-form-item label="消息漫游">
        <a-button type="primary" class="ml-5 mr-5" @click="getHistoryMessage"
          >获取消息漫游</a-button
        >
        <a-button type="primary" @click="deleteHistoryMessageWithMsgIds"
          >删除消息漫游(按照消息Id)
          <template #icon>
            <icon-delete />
          </template>
        </a-button>
        <a-button class="ml-5 mr-5" type="primary"
          >删除消息漫游(按照时间戳)
          <template #icon>
            <icon-delete />
          </template>
        </a-button>
        <template #extra>
          <div>点击按钮执行消息漫游行为</div>
        </template>
      </a-form-item>
    </a-form>
  </div>
</template>
