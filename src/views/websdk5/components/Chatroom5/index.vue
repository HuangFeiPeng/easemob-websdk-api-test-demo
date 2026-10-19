<script setup lang="ts">
import { Message } from '@arco-design/web-vue';
import type { ChatRoomSummary } from 'easemob-websdk-5';
import { emClient5, isEMClient5Inited } from '@/EaseIM5';
import { outConsoleLog } from '@/utils/consoleOutput';

const chatRoomForm = reactive({
  chatRoomId: '',
});
const chatRoomList = ref<ChatRoomSummary[]>([]);
const loading = ref(false);

const joinChatRoom = async () => {
  const client = emClient5;
  if (!client || !isEMClient5Inited.value) {
    Message.warning('请先在【配置】页初始化 WebSDK 5.x');
    return;
  }
  if (!chatRoomForm.chatRoomId) {
    Message.warning('请输入聊天室ID');
    return;
  }
  try {
    const result = await client.chatRoomManager.joinChatRoom({
      chatRoomId: chatRoomForm.chatRoomId,
    });
    outConsoleLog('WebSDK5-加入聊天室成功', result);
    Message.success('加入聊天室成功');
  } catch (error) {
    outConsoleLog('WebSDK5-加入聊天室失败', error, 'error');
    Message.error('加入聊天室失败，请查看控制台');
  }
};

const leaveChatRoom = async () => {
  const client = emClient5;
  if (!client || !isEMClient5Inited.value) {
    Message.warning('请先在【配置】页初始化 WebSDK 5.x');
    return;
  }
  if (!chatRoomForm.chatRoomId) {
    Message.warning('请输入聊天室ID');
    return;
  }
  try {
    await client.chatRoomManager.leaveChatRoom({
      chatRoomId: chatRoomForm.chatRoomId,
    });
    outConsoleLog('WebSDK5-离开聊天室成功', chatRoomForm.chatRoomId);
    Message.success('离开聊天室成功');
  } catch (error) {
    outConsoleLog('WebSDK5-离开聊天室失败', error, 'error');
    Message.error('离开聊天室失败，请查看控制台');
  }
};

const getChatRoomList = async () => {
  const client = emClient5;
  if (!client || !isEMClient5Inited.value) {
    Message.warning('请先在【配置】页初始化 WebSDK 5.x');
    return;
  }
  try {
    loading.value = true;
    const result = await client.chatRoomManager.getChatRoomList({
      pageNum: 1,
      pageSize: 20,
    });
    chatRoomList.value = [...result.items];
    outConsoleLog('WebSDK5-获取聊天室列表成功', result);
    Message.success(`获取聊天室列表成功，共 ${chatRoomList.value.length} 条`);
  } catch (error) {
    outConsoleLog('WebSDK5-获取聊天室列表失败', error, 'error');
    Message.error('获取聊天室列表失败，请查看控制台');
  } finally {
    loading.value = false;
  }
};

const columns = [
  { title: '聊天室ID', dataIndex: 'chatRoomId' },
  { title: '名称', dataIndex: 'name' },
  { title: '成员数', dataIndex: 'memberCount', width: 100 },
  { title: '房主', slotName: 'owner' },
];

defineOptions({
  name: 'Chatroom5Page',
});
</script>

<template>
  <div class="m-10">
    <a-form :model="chatRoomForm" layout="horizontal">
      <a-form-item label="聊天室ID" required>
        <a-input
          v-model="chatRoomForm.chatRoomId"
          placeholder="请输入聊天室ID，用于加入/离开"
        />
      </a-form-item>
      <a-form-item>
        <a-space wrap>
          <a-button type="primary" @click="joinChatRoom">加入聊天室</a-button>
          <a-button status="danger" @click="leaveChatRoom">
            离开聊天室
          </a-button>
          <a-button :loading="loading" @click="getChatRoomList">
            获取聊天室列表
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <a-table
      :columns="columns"
      :data="chatRoomList"
      :pagination="{ pageSize: 10 }"
      bordered
    >
      <template #owner="{ record }">
        {{ (record as ChatRoomSummary).owner?.userId ?? '-' }}
      </template>
      <template #empty>
        <a-empty description="暂无聊天室数据" />
      </template>
    </a-table>
  </div>
</template>
