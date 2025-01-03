<script setup lang="ts">
import { EasemobChat } from 'easemob-websdk';
import { EMClient } from '@/EaseIM';
import { Message } from '@arco-design/web-vue';
import { outConsoleLog } from '@/utils/consoleOutput';
interface IPinMessageForm {
  conversationId: string;
  messageId: string;
  conversationType: EasemobChat.ChatType;
  pageSize?: number;
  cursor?: string;
}
const pinMessageForm = reactive<IPinMessageForm>({
  conversationId: '',
  messageId: '',
  conversationType: 'singleChat',
  pageSize: 20,
});
const pinMessage = async () => {
  if (!pinMessageForm.conversationId || !pinMessageForm.messageId) {
    Message.error('请输入conversationId以及messageId');
    return;
  }
  try {
    const res = await EMClient.pinMessage({
      conversationId: pinMessageForm.conversationId,
      conversationType: pinMessageForm.conversationType,
      messageId: pinMessageForm.messageId,
    });
    Message.success('置顶消息成功');
  } catch (error) {
    outConsoleLog('置顶消息失败',error,'error');
    Message.error('置顶消息失败');
  }
};
const unpinMessage = async () => {
  if (!pinMessageForm.conversationId ||!pinMessageForm.messageId) {
    Message.error('请输入conversationId以及messageId');
    return;
  }
  try {
    const res = await EMClient.unpinMessage({
      conversationId: pinMessageForm.conversationId,
      conversationType: pinMessageForm.conversationType,
      messageId: pinMessageForm.messageId,
    });
    Message.success('取消置顶消息成功');
  } catch (error) {
    outConsoleLog('置顶消息获取失败',error,'error');
    Message.error('取消置顶消息失败');
  }
};
const getConversationPinMessage = async () => {
  if (!pinMessageForm.conversationId) {
    Message.error('请输入conversationId');
    return;
  }
  try {
    const res = await EMClient.getServerPinnedMessages({
      conversationId: pinMessageForm.conversationId,
      conversationType: pinMessageForm.conversationType,
      cursor: pinMessageForm.cursor,
      pageSize: pinMessageForm.pageSize,
    });
    outConsoleLog('获取单个会话中的置顶消息', res);
    Message.success('获取单个会话中的置顶消息成功');
  } catch (error) {
    outConsoleLog('获取单个会话中的置顶消息失败',error,'error');
    Message.error('获取单个会话中的置顶消息失败');
  }
};
</script>
<template>
    <a-form :model="pinMessageForm">
      <a-form-item label="conversationId">
        <a-input
          v-model="pinMessageForm.conversationId"
          placeholder="请输入conversationId"
        />
        <template #extra>
          <div>要置顶的会话ID</div>
        </template>
      </a-form-item>
      <a-form-item label="messageId">
        <a-input
          v-model="pinMessageForm.messageId"
          placeholder="请输入messageId"
        />
        <template #extra>
          <div>要置顶的消息ID</div>
        </template>
      </a-form-item>
      <a-form-item label="conversationType">
        <a-radio-group v-model="pinMessageForm.conversationType">
          <a-radio value="singleChat">单聊</a-radio>
          <a-radio value="groupChat">群聊</a-radio>
          <a-radio value="chatRoom">聊天室</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="置顶操作">
        <a-button type="primary" @click="pinMessage">置顶消息</a-button>
        <a-button class="ml-3" type="primary" @click="unpinMessage" >取消置顶</a-button>
        <a-button class="ml-3 mr-3" type="primary" @click="getConversationPinMessage">获取单个会话中的置顶消息</a-button>
      </a-form-item>
    </a-form>
</template>
