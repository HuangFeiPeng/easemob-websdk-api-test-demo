<script setup lang="ts">
import { Message } from '@arco-design/web-vue';
import type { UserInfo, UserInfoAttribute } from 'easemob-websdk-5';
import { emClient5, isEMClient5Inited } from '@/EaseIM5';
import { outConsoleLog } from '@/utils/consoleOutput';

const userInfoForm = useLocalStorage('websdk5-userinfo', {
  userIds: '',
  nickname: '',
  avatarUrl: '',
  mail: '',
  phone: '',
  sign: '',
  birth: '',
  ext: '',
  attribute: 'nickname' as UserInfoAttribute,
  attributeValue: '',
  queryAttributes: [] as UserInfoAttribute[],
});
const userInfoList = ref<UserInfo[]>([]);
const loading = ref(false);

const attributeOptions: { label: string; value: UserInfoAttribute }[] = [
  { label: '昵称 nickname', value: 'nickname' },
  { label: '头像 avatarUrl', value: 'avatarUrl' },
  { label: '邮箱 mail', value: 'mail' },
  { label: '手机号 phone', value: 'phone' },
  { label: '性别 gender', value: 'gender' },
  { label: '签名 sign', value: 'sign' },
  { label: '生日 birth', value: 'birth' },
  { label: '扩展 ext', value: 'ext' },
];

const parseUserIds = () =>
  userInfoForm.value.userIds
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

const updateOwnInfo = async () => {
  const client = requireClient();
  if (!client) {
    return;
  }
  const params: Record<string, string> = {};
  (
    ['nickname', 'avatarUrl', 'mail', 'phone', 'sign', 'birth', 'ext'] as const
  ).forEach((key) => {
    if (userInfoForm.value[key]) {
      params[key] = userInfoForm.value[key];
    }
  });
  if (Object.keys(params).length === 0) {
    Message.warning('请至少填写一个要更新的属性');
    return;
  }
  try {
    const result = await client.userInfoManager.updateOwnInfo(params);
    outConsoleLog('WebSDK5-更新用户属性成功', result);
    Message.success('更新用户属性成功');
  } catch (error) {
    outConsoleLog('WebSDK5-更新用户属性失败', error, 'error');
    Message.error('更新用户属性失败，请查看控制台');
  }
};

const updateOwnInfoByAttribute = async () => {
  const client = requireClient();
  if (!client) {
    return;
  }
  if (!userInfoForm.value.attributeValue) {
    Message.warning('请输入属性值');
    return;
  }
  try {
    const result = await client.userInfoManager.updateOwnInfoByAttribute(
      userInfoForm.value.attribute,
      userInfoForm.value.attributeValue,
    );
    outConsoleLog('WebSDK5-更新单个属性成功', result);
    Message.success('更新单个属性成功');
  } catch (error) {
    outConsoleLog('WebSDK5-更新单个属性失败', error, 'error');
    Message.error('更新单个属性失败，请查看控制台');
  }
};

const getUserInfoByUserId = async () => {
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
    const result = await client.userInfoManager.getUserInfoByUserId({
      userIds,
    });
    userInfoList.value = [...result];
    outConsoleLog('WebSDK5-查询用户属性成功', result);
    Message.success(`查询到 ${result.length} 个用户属性`);
  } catch (error) {
    outConsoleLog('WebSDK5-查询用户属性失败', error, 'error');
    Message.error('查询用户属性失败，请查看控制台');
  } finally {
    loading.value = false;
  }
};

const getUserInfoByAttribute = async () => {
  const client = requireClient();
  if (!client) {
    return;
  }
  const userIds = parseUserIds();
  if (userIds.length === 0 || userInfoForm.value.queryAttributes.length === 0) {
    Message.warning('请输入用户ID并选择要查询的属性');
    return;
  }
  try {
    loading.value = true;
    const result = await client.userInfoManager.getUserInfoByAttribute({
      userIds,
      attributes: userInfoForm.value.queryAttributes,
    });
    userInfoList.value = [...result];
    outConsoleLog('WebSDK5-按属性查询用户属性成功', result);
    Message.success(`查询到 ${result.length} 个用户属性`);
  } catch (error) {
    outConsoleLog('WebSDK5-按属性查询用户属性失败', error, 'error');
    Message.error('按属性查询失败，请查看控制台');
  } finally {
    loading.value = false;
  }
};

const userInfoColumns = [
  { title: '用户ID', dataIndex: 'userId' },
  { title: '昵称', dataIndex: 'nickname' },
  { title: '头像', slotName: 'avatarUrl' },
  { title: '签名', dataIndex: 'sign' },
  { title: '扩展', dataIndex: 'ext' },
];

defineOptions({
  name: 'UserInfo5Page',
});
</script>

<template>
  <div class="m-10">
    <a-form :model="userInfoForm" layout="horizontal">
      <a-form-item label="用户ID列表">
        <a-textarea
          v-model="userInfoForm.userIds"
          placeholder="待查询的用户ID，多个用逗号或空格分隔"
        />
      </a-form-item>
      <a-form-item label="查询属性">
        <a-select
          v-model="userInfoForm.queryAttributes"
          :options="attributeOptions"
          multiple
          placeholder="按属性查询时选择（不选则用默认字段查询）"
        />
      </a-form-item>
      <a-form-item>
        <a-space wrap>
          <a-button
            type="primary"
            :loading="loading"
            @click="getUserInfoByUserId"
          >
            查询用户属性
          </a-button>
          <a-button :loading="loading" @click="getUserInfoByAttribute">
            按属性查询
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <a-table
      :columns="userInfoColumns"
      :data="userInfoList"
      :pagination="{ pageSize: 10 }"
      bordered
    >
      <template #avatarUrl="{ record }">
        <a-avatar
          v-if="(record as UserInfo).avatarUrl"
          :image-url="(record as UserInfo).avatarUrl"
        />
        <span v-else>-</span>
      </template>
      <template #empty>
        <a-empty description="暂无用户属性数据" />
      </template>
    </a-table>
    <a-divider />
    <h3 class="mb-2 font-bold">更新当前用户属性（留空的字段不传）</h3>
    <a-form :model="userInfoForm" layout="horizontal">
      <a-form-item label="昵称">
        <a-input v-model="userInfoForm.nickname" placeholder="nickname" />
      </a-form-item>
      <a-form-item label="头像地址">
        <a-input v-model="userInfoForm.avatarUrl" placeholder="avatarUrl" />
      </a-form-item>
      <a-form-item label="邮箱">
        <a-input v-model="userInfoForm.mail" placeholder="mail" />
      </a-form-item>
      <a-form-item label="手机号">
        <a-input v-model="userInfoForm.phone" placeholder="phone" />
      </a-form-item>
      <a-form-item label="签名">
        <a-input v-model="userInfoForm.sign" placeholder="sign" />
      </a-form-item>
      <a-form-item label="生日">
        <a-input v-model="userInfoForm.birth" placeholder="birth" />
      </a-form-item>
      <a-form-item label="扩展字段">
        <a-input v-model="userInfoForm.ext" placeholder="ext" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="updateOwnInfo">
          更新用户属性（updateOwnInfo）
        </a-button>
      </a-form-item>
      <a-form-item label="单属性更新">
        <a-space>
          <a-select
            v-model="userInfoForm.attribute"
            :options="attributeOptions"
            :style="{ width: '180px' }"
          />
          <a-input v-model="userInfoForm.attributeValue" placeholder="属性值" />
          <a-button @click="updateOwnInfoByAttribute"> 更新单个属性 </a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>
