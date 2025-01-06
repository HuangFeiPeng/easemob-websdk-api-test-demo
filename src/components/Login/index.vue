<script setup lang="ts">
import { Message } from '@arco-design/web-vue';
import { EMClient } from '@/EaseIM';
import { outConsoleLog } from '@/utils/consoleOutput';
interface ILoginParams {
  userId: string;
  password: string;
  accessToken: string;
}
const loginParams: ILoginParams = reactive({
  userId: '',
  password: '',
  accessToken: '',
});
const loginIM = async () => {
  if (!loginParams.userId || !loginParams.password) {
    Message.warning('请输入环信ID和密码');
    return;
  }
  try {
    console.log(EMClient);
    await EMClient.open({
      user: loginParams.userId,
      pwd: loginParams.password,
    });
    Message.success('登录成功');
  } catch (error) {
    console.log(error);
    Message.error('登录失败');
  }
};

const loginWithToken = async () => {
  if (!loginParams.userId || !loginParams.accessToken) {
    Message.warning('请输入环信ID和token');
    return;
  }
  try {
    console.log(EMClient);
    await EMClient.open({
      user: loginParams.userId,
      accessToken: loginParams.accessToken,
    });
    Message.success('登录成功');
  } catch (error) {
    console.log(error);
    Message.error('登录失败');
  }
};

const logoutIM = () => {
  try {
    EMClient.close();
    Message.success('退出成功');
  } catch (error) {
    console.log(error);
    Message.error('退出失败');
  }
};
const updateNewAccessToken = async () => {
  if (!loginParams.accessToken) {
    Message.warning('请输入要更新的token');
    return;
  }
  try {
    const res = await EMClient.renewToken(loginParams.accessToken);
    outConsoleLog('更新token', res);
    Message.success('更新token成功');
  } catch (error) {
    outConsoleLog('更新token失败', error, 'error');
    Message.error('更新token失败');
  }
};
</script>
<template>
  <div class="login">
    <div class="login__container">
      <div class="login__right">
        <div class="login__form">
          <div class="login__form__item m-10">
            <a-input v-model="loginParams.userId" placeholder="请输入环信ID" />
          </div>
          <div class="login__form__item m-10">
            <a-input-password
              v-model="loginParams.password"
              placeholder="请输入密码"
              :defaultVisibility="false"
              allow-clear
            />
          </div>
          <div class="login__form__item m-10">
            <a-input
              placeholder="请输入token"
              v-model="loginParams.accessToken"
            />
          </div>
          <div class="login__form__item m-10">
            <a-button type="primary" @click="loginIM">登录</a-button>
            <a-button type="primary" status="warning" @click="loginWithToken"
              >token登录</a-button
            >
            <a-button type="primary" status="danger" @click="logoutIM"
              >退出</a-button
            >
            <a-button
              type="primary"
              status="danger"
              @click="updateNewAccessToken"
              >更新token</a-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
