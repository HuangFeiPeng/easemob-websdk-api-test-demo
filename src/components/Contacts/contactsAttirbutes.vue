<script setup lang="ts">
import { EasemobChat } from 'easemob-websdk';
import { Message } from '@arco-design/web-vue';
import { outConsoleLog } from '@/utils/consoleOutput';
import { EMClient } from '@/EaseIM';
interface IContactsAttributesForm extends EasemobChat.UpdateOwnUserInfoParams {
  userIds: string[];
  gender: string;
}
const contactsAttributesForm = reactive<IContactsAttributesForm>({
  userIds: [],
  nickname: '',
  avatarurl: '',
  gender: '',
  birth: '',
  mail: '',
  phone: '',
  ext: '',
});
const setUserAttributes = async () => {
  const { userIds, ...params } = contactsAttributesForm;
  if (
    !contactsAttributesForm.nickname &&
    !contactsAttributesForm.avatarurl &&
    !contactsAttributesForm.gender &&
    !contactsAttributesForm.birth &&
    !contactsAttributesForm.mail &&
    !contactsAttributesForm.phone &&
    !contactsAttributesForm.ext
  ) {
    Message.warning('请输入用户属性');
    return;
  }
  try {
    const res = await EMClient.updateUserInfo(params);
    outConsoleLog('设置用户属性成功', res);
    Message.success('设置用户属性成功');
  } catch (error) {
    outConsoleLog('设置用户属性失败', error, 'error');
    Message.error('设置用户属性失败');
  }
};
const getUserAttributes = async () => {
  const { userIds } = contactsAttributesForm;
  if (!userIds.length) {
    Message.warning('请输入用户ID');
    return;
  }
  try {
    const res = await EMClient.fetchUserInfoById(userIds);
    outConsoleLog('获取用户属性成功', res.data);
    Message.success('获取用户属性成功');
  } catch (error) {
    outConsoleLog('获取用户属性失败', error, 'error');
    Message.error('获取用户属性失败');
  }
};
</script>
<template>
  <div>
    <a-form :model="contactsAttributesForm">
      <a-form-item label="userId" required>
        <a-input-tag
          v-model="contactsAttributesForm.userIds"
          placeholder="请输入用户ID"
          :max-tag-count="5"
          allow-clear
          size="small"
        />
        <template #extra>
          <div>用户 ID 组成的数组，不包含自己的用户 ID，回车键可输入多个</div>
        </template>
      </a-form-item>
      <a-form-item label="nickname">
        <a-input
          v-model="contactsAttributesForm.nickname"
          placeholder="请输入nickname"
        />
      </a-form-item>
      <a-form-item label="avatarurl">
        <a-input
          v-model="contactsAttributesForm.avatarurl"
          placeholder="请输入avatarurl"
        />
      </a-form-item>
      <a-form-item label="gender">
        <a-input
          v-model="contactsAttributesForm.gender"
          placeholder="请输入gender"
        />
      </a-form-item>
      <a-form-item label="mail">
        <a-input
          v-model="contactsAttributesForm.mail"
          placeholder="请输入mail"
        />
      </a-form-item>
      <a-form-item label="phone">
        <a-input
          v-model="contactsAttributesForm.phone"
          placeholder="请输入phone"
        />
      </a-form-item>
      <a-form-item label="ext">
        <a-input v-model="contactsAttributesForm.ext" placeholder="请输入ext" />
      </a-form-item>
      <a-form-item label="用户属性操作">
        <a-space :size="'medium'" wrap>
          <a-button type="primary" @click="setUserAttributes">
            设置用户属性
          </a-button>
          <a-button type="primary" @click="getUserAttributes">
            获取用户属性
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped></style>
