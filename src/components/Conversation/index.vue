<script setup lang="ts">
import { EasemobChat } from 'easemob-websdk';
import { EMClient } from '@/EaseIM';
import {outConsoleLog} from '@/utils/consoleOutput';
import { Message } from '@arco-design/web-vue';
interface IConversationForm {
  pageSize?: number;
  cursor?: string;
  chatType: Exclude<EasemobChat.ChatType, 'chatRoom'>;
  deleteRoam?: boolean;
}
const conversationForm = reactive<IConversationForm>({
  pageSize: 20,
  cursor: '',
  chatType: 'singleChat',
  deleteRoam: false,
});
const getConversationList = async () => {
  try {
    const res = await EMClient.getServerConversations({
      pageSize: conversationForm.pageSize,
      cursor: conversationForm.cursor
    });
    outConsoleLog('获取会话列表', res);
    Message.success('获取会话列表成功');
  } catch (error) {
    outConsoleLog('获取会话列表失败', error, 'error');
    Message.error('获取会话列表失败');
  }
};
</script>
<template>
  <div class="w-11/12">
    <a-form
      :model="conversationForm"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-item label="pageSize">
        <a-input-number
          v-model="conversationForm.pageSize"
          :min="1"
          :max="50"
        />
      </a-form-item>
      <a-form-item label="cursor">
        <a-input v-model="conversationForm.cursor" />
      </a-form-item>
      <a-form-item label="聊天类型">
        <a-radio-group v-model="conversationForm.chatType">
          <a-radio value="singleChat">单聊</a-radio>
          <a-radio value="groupChat">群聊</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="删除会话是否漫游消息">
        <a-switch v-model="conversationForm.deleteRoam" />
      </a-form-item>
      <a-form-item label="会话列表基础操作">
        <a-button type="primary" @click="getConversationList">获取会话列表</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
