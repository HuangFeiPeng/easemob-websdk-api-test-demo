<script setup lang="ts">
import { EMClient } from '@/EaseIM';
import { Message } from '@arco-design/web-vue';
import { outConsoleLog } from '@/utils/consoleOutput';
interface IContactsRelationsForm {
  userIds: string[];
  message?: string;
  remark?: string;
  pageSize?: number;
  cursor?: string;
}
const contactsRelationsForm = reactive<IContactsRelationsForm>({
  userIds: [],
  message: '',
  remark: '',
  pageSize: 20,
  cursor: '',
});
const getAllContactslist = async () => {
  try {
    const res = await EMClient.getAllContacts();
    outConsoleLog('获取全量好友列表', res.data);
    Message.success('获取全量好友列表成功');
  } catch (error) {
    outConsoleLog('获取全量好友列表失败', error, 'error');
    Message.error('获取全量好友列表失败');
  }
};
const getContactsWithCursor = async () => {
  try {
    const res = await EMClient.getContactsWithCursor({
      pageSize: contactsRelationsForm.pageSize as number,
      cursor: contactsRelationsForm.cursor,
    });
    outConsoleLog('分页获取好友列表', res.data);
    Message.success('分页获取好友列表成功');
  } catch (error) {
    outConsoleLog('分页获取好友列表失败', error, 'error');
    Message.error('分页获取好友列表失败');
  }
};
const getAllContactsOnlyUserIds = async () => {
  try {
    const res = await EMClient.getContacts();
    outConsoleLog('获取好友列表（只返回ID）', res.data);
    Message.success('获取好友列表（只返回ID）成功');
  } catch (error) {
    outConsoleLog('获取好友列表（只返回ID）失败', error, 'error');
    Message.error('获取好友列表（只返回ID）失败');
  }
};
const sendFriendRequest = async () => {
  if (!contactsRelationsForm.userIds.length) {
    Message.warning('请输入用户ID');
    return;
  }
  const toId = contactsRelationsForm.userIds[0];
  try {
    await EMClient.addContact(toId, contactsRelationsForm.message);
    outConsoleLog('好友申请已发送');
    Message.success('好友申请已发送');
  } catch (error) {
    outConsoleLog('好友申请发送失败', error, 'error');
    Message.error('好友申请发送失败');
  }
};
const deleteFriend = async () => {
  if (!contactsRelationsForm.userIds.length) {
    Message.warning('请输入用户ID');
    return;
  }
  const toId = contactsRelationsForm.userIds[0];
  try {
    await EMClient.deleteContact(toId);
    outConsoleLog('好友已删除');
    Message.success('好友已删除');
  } catch (error) {
    outConsoleLog('好友删除失败', error, 'error');
    Message.error('好友删除失败');
  }
};
const setFriendRemark = async () => {
  if (!contactsRelationsForm.userIds.length) {
    Message.warning('请输入用户ID');
    return;
  }
  if (!contactsRelationsForm.remark) {
    Message.warning('请输入好友备注');
    return;
  }
  const toId = contactsRelationsForm.userIds[0];
  try {
    await EMClient.setContactRemark({
      userId: toId,
      remark: contactsRelationsForm.remark,
    });
    outConsoleLog('好友备注已设置');
    Message.success('好友备注已设置');
  } catch (error) {
    outConsoleLog('好友备注设置失败', error, 'error');
    Message.error('好友备注设置失败');
  }
};
const getContactsBlacklist = async () => {
  try {
    const res = await EMClient.getBlocklist();
    outConsoleLog('获取黑名单列表', res.data);
    Message.success('获取黑名单列表成功');
  } catch (error) {
    outConsoleLog('获取黑名单列表失败', error, 'error');
    Message.error('获取黑名单列表失败');
  }
};
const addContactsToBlacklist = async () => {
  if (!contactsRelationsForm.userIds.length) {
    Message.warning('请输入用户ID');
    return;
  }
  try {
    await EMClient.addUsersToBlocklist({
      name: contactsRelationsForm.userIds,
    });
    outConsoleLog('黑名单已添加');
    Message.success('黑名单已添加');
  } catch (error) {
    outConsoleLog('黑名单添加失败', error, 'error');
    Message.error('黑名单添加失败');
  }
};
const deleteContactsFromBlacklist = async () => {
  if (!contactsRelationsForm.userIds.length) {
    Message.warning('请输入用户ID');
    return;
  }
  try {
    await EMClient.removeUserFromBlocklist({
      name: contactsRelationsForm.userIds,
    });
    outConsoleLog('黑名单已删除');
    Message.success('黑名单已删除');
  } catch (error) {
    outConsoleLog('黑名单删除失败', error, 'error');
    Message.error('黑名单删除失败');
  }
};
</script>
<template>
  <div>
    <a-form :model="contactsRelationsForm">
      <a-form-item label="userIds" required>
        <a-input-tag
          v-model="contactsRelationsForm.userIds"
          placeholder="请输入用户ID"
          :max-tag-count="5"
          allow-clear
          size="small"
        />
        <template #extra>
          <div>用户 ID 组成的数组，不包含自己的用户 ID，回车键可输入多个</div>
        </template>
      </a-form-item>
      <a-form-item label="好友申请消息">
        <a-input
          v-model="contactsRelationsForm.message"
          placeholder="请输入message"
        />
      </a-form-item>
      <a-form-item label="好友备注">
        <a-input
          v-model="contactsRelationsForm.remark"
          placeholder="请输入remark"
        />
      </a-form-item>
      <a-form-item label="好友列表分页">
        <a-space :size="'medium'" wrap>
          <a-input-number v-model="contactsRelationsForm.pageSize" :max="50" />
          <a-input
            v-model="contactsRelationsForm.cursor"
            placeholder="请输入cursor"
          />
        </a-space>
      </a-form-item>
      <a-form-item label="好友列表操作">
        <a-space :size="'medium'" wrap>
          <a-button type="primary" @click="getAllContactslist"
            >获取全量好友列表</a-button
          >
          <a-button type="primary" @click="getContactsWithCursor"
            >分页获取好友列表</a-button
          >
          <a-button type="primary" @click="getAllContactsOnlyUserIds"
            >获取好友列表（只返回ID）</a-button
          >
        </a-space>
      </a-form-item>
      <a-form-item label="好友操作">
        <a-space :size="'medium'" wrap>
          <a-button type="primary" @click="sendFriendRequest"
            >添加好友</a-button
          >
          <a-button type="primary" status="danger" @click="deleteFriend"
            >删除好友</a-button
          >
          <a-button type="primary" @click="setFriendRemark"
            >设置好友备注</a-button
          >
        </a-space>
      </a-form-item>
      <a-form-item label="黑名单操作">
        <a-space :size="'medium'" wrap>
          <a-button type="primary" @click="getContactsBlacklist"
            >获取黑名单列表</a-button
          >
          <a-button type="primary" @click="addContactsToBlacklist"
            >添加黑名单</a-button
          >
          <a-button
            type="primary"
            status="danger"
            @click="deleteContactsFromBlacklist"
            >删除黑名单</a-button
          >
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped></style>
