<script setup lang="ts">
import { Message } from '@arco-design/web-vue';
import type { ConnectionState } from 'easemob-websdk-5';
import {
  emClient5,
  isEMClient5Inited,
  emClient5ConnectionState,
} from '@/EaseIM5';
import { outConsoleLog } from '@/utils/consoleOutput';

interface ILogin5Params {
  userId: string;
  token: string;
}
const loginParams = useLocalStorage<ILogin5Params>('websdk5-login', {
  userId: '',
  token: '',
});

// 轮询兜底刷新连接状态（事件驱动为主）
const polledState = ref<ConnectionState>('disconnected');
let pollTimer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  pollTimer = setInterval(() => {
    polledState.value = emClient5?.getConnectionState() ?? 'disconnected';
  }, 3000);
});
onBeforeUnmount(() => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
});
const currentState = computed(
  () => emClient5ConnectionState.value ?? polledState.value,
);

const loginIM = async () => {
  const client = emClient5;
  if (!client || !isEMClient5Inited.value) {
    Message.warning('请先在【配置】页初始化 WebSDK 5.x');
    return;
  }
  if (!loginParams.value.userId || !loginParams.value.token) {
    Message.warning('请输入环信ID和token');
    return;
  }
  try {
    await client.login({
      userId: loginParams.value.userId,
      token: loginParams.value.token,
    });
    outConsoleLog('WebSDK5-登录成功', client.getCurrentUserId());
    Message.success('登录成功');
  } catch (error) {
    outConsoleLog('WebSDK5-登录失败', error, 'error');
    Message.error('登录失败，请查看控制台');
  }
};

const logoutIM = async () => {
  const client = emClient5;
  if (!client || !isEMClient5Inited.value) {
    Message.warning('请先在【配置】页初始化 WebSDK 5.x');
    return;
  }
  try {
    await client.logout();
    outConsoleLog('WebSDK5-退出成功');
    Message.success('退出成功');
  } catch (error) {
    outConsoleLog('WebSDK5-退出失败', error, 'error');
    Message.error('退出失败');
  }
};

const renewToken = async () => {
  const client = emClient5;
  if (!client || !isEMClient5Inited.value) {
    Message.warning('请先在【配置】页初始化 WebSDK 5.x');
    return;
  }
  if (!loginParams.value.token) {
    Message.warning('请输入要更新的token');
    return;
  }
  try {
    const result = await client.renewToken(loginParams.value.token);
    outConsoleLog('WebSDK5-更新token成功', result);
    Message.success('更新token成功');
  } catch (error) {
    outConsoleLog('WebSDK5-更新token失败', error, 'error');
    Message.error('更新token失败');
  }
};

defineOptions({
  name: 'Login5Page',
});
</script>

<template>
  <div class="m-10">
    <a-alert class="mb-4" type="info">
      token 可在首页【工具集】的 Token 生成器 中生成；也可使用 easemob-demo
      环境的默认账号（如 zy1/123456 对应的 token）。
    </a-alert>
    <a-form :model="loginParams" layout="horizontal">
      <a-form-item label="当前连接状态">
        <a-tag :color="currentState === 'connected' ? 'green' : 'orange'">
          {{ currentState }}
        </a-tag>
        <template #extra>
          <div>
            事件驱动实时更新，另每 3 秒通过 getConnectionState() 轮询兜底
          </div>
        </template>
      </a-form-item>
      <a-form-item label="环信ID" required>
        <a-input v-model="loginParams.userId" placeholder="请输入环信ID" />
      </a-form-item>
      <a-form-item label="token" required>
        <a-input-password
          v-model="loginParams.token"
          placeholder="请输入token"
          :defaultVisibility="false"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-space wrap>
          <a-button type="primary" @click="loginIM">登录</a-button>
          <a-button type="primary" status="danger" @click="logoutIM">
            退出
          </a-button>
          <a-button type="primary" status="warning" @click="renewToken">
            更新token
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>
