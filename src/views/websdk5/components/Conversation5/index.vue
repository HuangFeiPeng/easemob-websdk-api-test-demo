<script setup lang="ts">
import { Message } from '@arco-design/web-vue';
import type { ConversationItem } from 'easemob-websdk-5';
import { emClient5, isEMClient5Inited } from '@/EaseIM5';
import { outConsoleLog } from '@/utils/consoleOutput';

const includeEmpty = ref(false);
const sessionList = ref<ConversationItem[]>([]);
const loading = ref(false);

const refreshSessionList = async () => {
  const client = emClient5;
  if (!client || !isEMClient5Inited.value) {
    Message.warning('请先在【配置】页初始化 WebSDK 5.x');
    return;
  }
  try {
    loading.value = true;
    const list = await client.refreshSessionList({
      includeEmpty: includeEmpty.value,
    });
    sessionList.value = [...list];
    outConsoleLog('WebSDK5-获取会话列表成功', sessionList.value);
    Message.success(`获取会话列表成功，共 ${sessionList.value.length} 条`);
  } catch (error) {
    outConsoleLog('WebSDK5-获取会话列表失败', error, 'error');
    Message.error('获取会话列表失败，请查看控制台');
  } finally {
    loading.value = false;
  }
};

const lastMessageText = (item: ConversationItem) => {
  const snippet = item.lastMessage;
  if (!snippet) return '-';
  if (snippet.type === 'text' && 'content' in snippet.body) {
    return String(snippet.body.content);
  }
  return `[${snippet.type}]`;
};

const columns = [
  { title: '会话ID', dataIndex: 'conversationId' },
  { title: '类型', dataIndex: 'conversationType', width: 110 },
  { title: '会话名称', dataIndex: 'conversationName' },
  { title: '未读数', dataIndex: 'unreadCount', width: 90 },
  { title: '最后一条消息', slotName: 'lastMessage' },
  { title: '最后消息时间', slotName: 'lastMessageAt' },
  { title: '置顶', slotName: 'isPinned', width: 80 },
];

defineOptions({
  name: 'Conversation5Page',
});
</script>

<template>
  <div class="m-10">
    <a-space class="mb-4" wrap>
      <a-switch v-model="includeEmpty" />
      <span>includeEmpty（是否同步空会话）</span>
      <a-button type="primary" :loading="loading" @click="refreshSessionList">
        获取会话列表
      </a-button>
    </a-space>
    <a-table
      :columns="columns"
      :data="sessionList"
      :pagination="{ pageSize: 10 }"
      bordered
    >
      <template #lastMessage="{ record }">
        {{ lastMessageText(record as ConversationItem) }}
      </template>
      <template #lastMessageAt="{ record }">
        {{
          (record as ConversationItem).lastMessageAt
            ? new Date(
                (record as ConversationItem).lastMessageAt!,
              ).toLocaleString()
            : '-'
        }}
      </template>
      <template #isPinned="{ record }">
        <a-tag
          :color="(record as ConversationItem).isPinned ? 'green' : 'gray'"
        >
          {{ (record as ConversationItem).isPinned ? '是' : '否' }}
        </a-tag>
      </template>
      <template #empty>
        <a-empty description="暂无会话数据，点击上方按钮获取" />
      </template>
    </a-table>
  </div>
</template>
