<script setup lang="ts">
import { Message } from '@arco-design/web-vue';
import type { JoinedGroupSummary } from 'easemob-websdk-5';
import { emClient5, isEMClient5Inited } from '@/EaseIM5';
import { outConsoleLog } from '@/utils/consoleOutput';

const groupForm = reactive({
  name: '',
  description: '',
  public: false,
  joinApprovalRequired: false,
  allowInvites: true,
  inviteNeedConfirm: false,
  maxMembers: 200,
});
const createdGroupId = ref('');
const joinedGroups = ref<JoinedGroupSummary[]>([]);
const loading = ref(false);

const createGroup = async () => {
  const client = emClient5;
  if (!client || !isEMClient5Inited.value) {
    Message.warning('请先在【配置】页初始化 WebSDK 5.x');
    return;
  }
  if (!groupForm.name) {
    Message.warning('请输入群组名称');
    return;
  }
  try {
    const result = await client.groupManager.createGroup({
      name: groupForm.name,
      description: groupForm.description,
      public: groupForm.public,
      joinApprovalRequired: groupForm.joinApprovalRequired,
      allowInvites: groupForm.allowInvites,
      inviteNeedConfirm: groupForm.inviteNeedConfirm,
      maxMembers: groupForm.maxMembers,
    });
    createdGroupId.value = result.groupId;
    outConsoleLog('WebSDK5-创建群组成功', result);
    Message.success(`创建群组成功：${result.groupId}`);
  } catch (error) {
    outConsoleLog('WebSDK5-创建群组失败', error, 'error');
    Message.error('创建群组失败，请查看控制台');
  }
};

const getJoinedGroups = () => {
  const client = emClient5;
  if (!client || !isEMClient5Inited.value) {
    Message.warning('请先在【配置】页初始化 WebSDK 5.x');
    return;
  }
  try {
    loading.value = true;
    const list = client.groupManager.getJoinedGroupList();
    joinedGroups.value = [...list];
    outConsoleLog('WebSDK5-获取已加入群组列表', joinedGroups.value);
    Message.success(
      `共 ${joinedGroups.value.length} 个群组（本地同步数据，不发起网络请求）`,
    );
  } catch (error) {
    outConsoleLog('WebSDK5-获取已加入群组列表失败', error, 'error');
    Message.error('获取群组列表失败');
  } finally {
    loading.value = false;
  }
};

const columns = [
  { title: '群组ID', dataIndex: 'groupId' },
  { title: '群名称', dataIndex: 'name' },
  { title: '成员数', dataIndex: 'memberCount', width: 90 },
  { title: '群主', dataIndex: 'ownerId' },
  { title: '我的角色', dataIndex: 'role', width: 110 },
];

defineOptions({
  name: 'Group5Page',
});
</script>

<template>
  <div class="m-10">
    <a-form :model="groupForm" layout="horizontal">
      <a-form-item label="群名称" required>
        <a-input v-model="groupForm.name" placeholder="请输入群组名称" />
      </a-form-item>
      <a-form-item label="群描述">
        <a-input v-model="groupForm.description" placeholder="请输入群组描述" />
      </a-form-item>
      <a-form-item label="public">
        <a-switch v-model="groupForm.public" />
        <template #extra>
          <div>是否为公开群</div>
        </template>
      </a-form-item>
      <a-form-item label="joinApprovalRequired">
        <a-switch v-model="groupForm.joinApprovalRequired" />
        <template #extra>
          <div>用户加入群组时是否需要管理员审批</div>
        </template>
      </a-form-item>
      <a-form-item label="allowInvites">
        <a-switch v-model="groupForm.allowInvites" />
        <template #extra>
          <div>是否允许普通成员邀请其他用户加入群组</div>
        </template>
      </a-form-item>
      <a-form-item label="inviteNeedConfirm">
        <a-switch v-model="groupForm.inviteNeedConfirm" />
        <template #extra>
          <div>受邀用户加入群组前是否需要确认邀请</div>
        </template>
      </a-form-item>
      <a-form-item label="maxMembers">
        <a-input-number v-model="groupForm.maxMembers" :min="3" :max="3000" />
      </a-form-item>
      <a-form-item>
        <a-space wrap>
          <a-button type="primary" @click="createGroup">创建群组</a-button>
          <a-button :loading="loading" @click="getJoinedGroups">
            获取我加入的群组
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <a-alert v-if="createdGroupId" class="mb-4" type="success">
      最近创建的群组ID：{{ createdGroupId }}
    </a-alert>
    <a-table
      :columns="columns"
      :data="joinedGroups"
      :pagination="{ pageSize: 10 }"
      bordered
    >
      <template #empty>
        <a-empty description="暂无群组数据" />
      </template>
    </a-table>
  </div>
</template>
