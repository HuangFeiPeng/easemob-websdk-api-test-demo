<script setup lang="ts">
import { Message } from '@arco-design/web-vue';
import type { PresenceInfo } from 'easemob-websdk-5';
import { emClient5, isEMClient5Inited } from '@/EaseIM5';
import { outConsoleLog } from '@/utils/consoleOutput';

const presenceForm = useLocalStorage('websdk5-presence', {
  userIds: '',
  expiry: 3600,
  customStatus: '',
  pageNum: 0,
  pageSize: 20,
});
const presenceList = ref<PresenceInfo[]>([]);
const subscribedUserIds = ref<string[]>([]);
const loading = ref(false);

const parseUserIds = () =>
  presenceForm.value.userIds
    .split(/[,，\s]+/)
    .map((id) => id.trim())
    .filter(Boolean);

const requireClient = () => {
  const client = emClient5;
  if (!client || !isEMClient5Inited.value) {
    Message.warning('请先在【配置】页初始化 WebSDK 5.x');
    return null;
  }
  return client;
};

const publishPresence = async () => {
  const client = requireClient();
  if (!client) {
    return;
  }
  if (!presenceForm.value.customStatus) {
    Message.warning('请输入自定义在线状态');
    return;
  }
  try {
    await client.presenceManager.publishPresence({
      customStatus: presenceForm.value.customStatus,
    });
    outConsoleLog('WebSDK5-发布在线状态成功', presenceForm.value.customStatus);
    Message.success('发布在线状态成功');
  } catch (error) {
    outConsoleLog('WebSDK5-发布在线状态失败', error, 'error');
    Message.error('发布在线状态失败，请查看控制台');
  }
};

const subscribePresence = async () => {
  const client = requireClient();
  if (!client) {
    return;
  }
  const userIds = parseUserIds();
  if (userIds.length === 0) {
    Message.warning('请输入要订阅的用户ID');
    return;
  }
  try {
    loading.value = true;
    const result = await client.presenceManager.subscribePresence({
      userIds,
      expiry: presenceForm.value.expiry,
    });
    presenceList.value = [...result];
    outConsoleLog('WebSDK5-订阅在线状态成功', result);
    Message.success('订阅在线状态成功');
  } catch (error) {
    outConsoleLog('WebSDK5-订阅在线状态失败', error, 'error');
    Message.error('订阅在线状态失败，请查看控制台');
  } finally {
    loading.value = false;
  }
};

const unsubscribePresence = async () => {
  const client = requireClient();
  if (!client) {
    return;
  }
  const userIds = parseUserIds();
  if (userIds.length === 0) {
    Message.warning('请输入要取消订阅的用户ID');
    return;
  }
  try {
    await client.presenceManager.unsubscribePresence({ userIds });
    outConsoleLog('WebSDK5-取消订阅在线状态成功', userIds);
    Message.success('已取消订阅');
  } catch (error) {
    outConsoleLog('WebSDK5-取消订阅在线状态失败', error, 'error');
    Message.error('取消订阅失败，请查看控制台');
  }
};

const getPresenceStatus = async () => {
  const client = requireClient();
  if (!client) {
    return;
  }
  const userIds = parseUserIds();
  if (userIds.length === 0) {
    Message.warning('请输入要查询的用户ID');
    return;
  }
  try {
    loading.value = true;
    const result = await client.presenceManager.getPresenceStatus({ userIds });
    presenceList.value = [...result];
    outConsoleLog('WebSDK5-查询在线状态成功', result);
    Message.success(`查询到 ${result.length} 个用户的在线状态`);
  } catch (error) {
    outConsoleLog('WebSDK5-查询在线状态失败', error, 'error');
    Message.error('查询在线状态失败，请查看控制台');
  } finally {
    loading.value = false;
  }
};

const getSubscribedPresenceList = async () => {
  const client = requireClient();
  if (!client) {
    return;
  }
  try {
    loading.value = true;
    const result = await client.presenceManager.getSubscribedPresenceList({
      pageNum: presenceForm.value.pageNum,
      pageSize: presenceForm.value.pageSize,
    });
    subscribedUserIds.value = [...result];
    outConsoleLog('WebSDK5-查询订阅列表成功', result);
    Message.success(`当前订阅了 ${result.length} 个用户`);
  } catch (error) {
    outConsoleLog('WebSDK5-查询订阅列表失败', error, 'error');
    Message.error('查询订阅列表失败，请查看控制台');
  } finally {
    loading.value = false;
  }
};

const presenceColumns = [
  { title: '用户ID', dataIndex: 'publisher' },
  { title: '设备状态', slotName: 'statusList' },
  { title: '扩展描述', dataIndex: 'ext' },
  { title: '更新时间', slotName: 'latestTime' },
];

defineOptions({
  name: 'Presence5Page',
});
</script>

<template>
  <div class="m-10">
    <a-alert class="mb-4" type="info">
      订阅成功后，被订阅用户的在线状态变更会通过 onPresenceStatusChange
      事件推送到右侧结果面板。
    </a-alert>
    <a-form :model="presenceForm" layout="horizontal">
      <a-form-item label="自定义状态">
        <a-input
          v-model="presenceForm.customStatus"
          placeholder="发布给订阅者的自定义在线状态，如 忙碌中"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="publishPresence">
          发布自定义状态（publishPresence）
        </a-button>
      </a-form-item>
      <a-form-item label="用户ID列表">
        <a-textarea
          v-model="presenceForm.userIds"
          placeholder="待订阅/查询的用户ID，多个用逗号或空格分隔"
        />
      </a-form-item>
      <a-form-item label="订阅时长(秒)">
        <a-input-number v-model="presenceForm.expiry" :min="0" />
      </a-form-item>
      <a-form-item>
        <a-space wrap>
          <a-button
            type="primary"
            :loading="loading"
            @click="subscribePresence"
          >
            订阅在线状态
          </a-button>
          <a-button status="warning" @click="unsubscribePresence">
            取消订阅
          </a-button>
          <a-button :loading="loading" @click="getPresenceStatus">
            查询在线状态
          </a-button>
        </a-space>
      </a-form-item>
      <a-form-item label="订阅列表分页">
        <a-space>
          <a-input-number
            v-model="presenceForm.pageNum"
            :min="0"
            placeholder="页码"
          />
          <a-input-number
            v-model="presenceForm.pageSize"
            :min="1"
            placeholder="每页条数"
          />
          <a-button :loading="loading" @click="getSubscribedPresenceList">
            查询订阅列表
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <template v-if="subscribedUserIds.length">
      <h3 class="mb-2 font-bold">已订阅的用户</h3>
      <a-space wrap class="mb-4">
        <a-tag v-for="id in subscribedUserIds" :key="id">{{ id }}</a-tag>
      </a-space>
    </template>
    <a-table
      :columns="presenceColumns"
      :data="presenceList"
      :pagination="{ pageSize: 10 }"
      bordered
    >
      <template #statusList="{ record }">
        {{ JSON.stringify((record as PresenceInfo).statusList) }}
      </template>
      <template #latestTime="{ record }">
        {{
          (record as PresenceInfo).latestTime
            ? new Date((record as PresenceInfo).latestTime).toLocaleString()
            : '-'
        }}
      </template>
      <template #empty>
        <a-empty description="暂无在线状态数据" />
      </template>
    </a-table>
  </div>
</template>
