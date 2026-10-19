<script setup lang="ts">
import { Message } from '@arco-design/web-vue';
import type { Contact } from 'easemob-websdk-5';
import { emClient5, isEMClient5Inited } from '@/EaseIM5';
import { outConsoleLog } from '@/utils/consoleOutput';

const contactForm = useLocalStorage('websdk5-contact', {
  userId: '',
  message: '',
});
const contactList = ref<Contact[]>([]);
const loading = ref(false);

const addContact = async () => {
  const client = emClient5;
  if (!client || !isEMClient5Inited.value) {
    Message.warning('请先在【配置】页初始化 WebSDK 5.x');
    return;
  }
  if (!contactForm.value.userId) {
    Message.warning('请输入目标用户ID');
    return;
  }
  try {
    await client.contactManager.addContact({
      userId: contactForm.value.userId,
      message: contactForm.value.message,
    });
    outConsoleLog('WebSDK5-添加联系人成功', contactForm.value.userId);
    Message.success('好友申请已发送');
  } catch (error) {
    outConsoleLog('WebSDK5-添加联系人失败', error, 'error');
    Message.error('添加联系人失败，请查看控制台');
  }
};

const acceptContactInvite = async () => {
  const client = emClient5;
  if (!client || !isEMClient5Inited.value) {
    Message.warning('请先在【配置】页初始化 WebSDK 5.x');
    return;
  }
  if (!contactForm.value.userId) {
    Message.warning('请输入目标用户ID');
    return;
  }
  try {
    await client.contactManager.acceptContactInvite({
      userId: contactForm.value.userId,
    });
    outConsoleLog('WebSDK5-同意好友申请成功', contactForm.value.userId);
    Message.success('已同意好友申请');
  } catch (error) {
    outConsoleLog('WebSDK5-同意好友申请失败', error, 'error');
    Message.error('同意好友申请失败，请查看控制台');
  }
};

const declineContactInvite = async () => {
  const client = emClient5;
  if (!client || !isEMClient5Inited.value) {
    Message.warning('请先在【配置】页初始化 WebSDK 5.x');
    return;
  }
  if (!contactForm.value.userId) {
    Message.warning('请输入目标用户ID');
    return;
  }
  try {
    await client.contactManager.declineContactInvite({
      userId: contactForm.value.userId,
    });
    outConsoleLog('WebSDK5-拒绝好友申请成功', contactForm.value.userId);
    Message.success('已拒绝好友申请');
  } catch (error) {
    outConsoleLog('WebSDK5-拒绝好友申请失败', error, 'error');
    Message.error('拒绝好友申请失败，请查看控制台');
  }
};

const getContacts = () => {
  const client = emClient5;
  if (!client || !isEMClient5Inited.value) {
    Message.warning('请先在【配置】页初始化 WebSDK 5.x');
    return;
  }
  try {
    loading.value = true;
    const list = client.contactManager.getContacts();
    contactList.value = [...list];
    outConsoleLog('WebSDK5-获取通讯录列表', contactList.value);
    Message.success(`共 ${contactList.value.length} 位联系人（本地快照数据）`);
  } catch (error) {
    outConsoleLog('WebSDK5-获取通讯录列表失败', error, 'error');
    Message.error('获取通讯录列表失败');
  } finally {
    loading.value = false;
  }
};

const columns = [
  { title: '用户ID', slotName: 'userId' },
  { title: '昵称', slotName: 'nickname' },
  { title: '备注', dataIndex: 'remark' },
  { title: '添加时间', slotName: 'addTs' },
];

defineOptions({
  name: 'Contacts5Page',
});
</script>

<template>
  <div class="m-10">
    <a-alert class="mb-4" type="info">
      收到 onContactInvited
      事件后，在此输入发起方用户ID，点击「同意好友申请」或「拒绝好友申请」处理。
    </a-alert>
    <a-form :model="contactForm" layout="horizontal">
      <a-form-item label="目标用户ID" required>
        <a-input
          v-model="contactForm.userId"
          placeholder="请输入要添加的用户ID"
        />
      </a-form-item>
      <a-form-item label="验证消息">
        <a-input
          v-model="contactForm.message"
          placeholder="请输入验证消息（可选）"
        />
      </a-form-item>
      <a-form-item>
        <a-space wrap>
          <a-button type="primary" @click="addContact">添加联系人</a-button>
          <a-button
            type="primary"
            status="success"
            @click="acceptContactInvite"
          >
            同意好友申请
          </a-button>
          <a-button
            type="primary"
            status="danger"
            @click="declineContactInvite"
          >
            拒绝好友申请
          </a-button>
          <a-button :loading="loading" @click="getContacts">
            获取通讯录列表
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <a-table
      :columns="columns"
      :data="contactList"
      :pagination="{ pageSize: 10 }"
      bordered
    >
      <template #userId="{ record }">
        {{ (record as Contact).userId }}
      </template>
      <template #nickname="{ record }">
        {{ (record as Contact).userInfo.nickname ?? '-' }}
      </template>
      <template #addTs="{ record }">
        {{
          (record as Contact).addTs
            ? new Date((record as Contact).addTs).toLocaleString()
            : '-'
        }}
      </template>
      <template #empty>
        <a-empty description="暂无联系人数据" />
      </template>
    </a-table>
  </div>
</template>
