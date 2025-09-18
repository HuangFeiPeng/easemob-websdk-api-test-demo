<script setup lang="ts">
import { EasemobChat } from 'easemob-websdk';
import { Notification } from '@arco-design/web-vue';
import { initializationEMClient, EMClient } from '@/EaseIM';
import { SDK_TYPES } from '@/constants';
const configForm = reactive<EasemobChat.ConnectionParameters>({
  appKey: 'easemob-demo#support',
  appId: '',
  apiUrl: '',
  url: '',
  isHttpDNS: true,
  isFixedDeviceId: false,
  useOwnUploadFun: false,
  useReplacedMessageContents: false,
  deviceId: EMClient.deviceId,
  delivery: false,
});
const saveConfig = () => {
  console.log('configForm', configForm);
  initializationEMClient(configForm);
  Notification.success('配置已成功！');
};
const SDKTypes = useLocalStorage('switchSDK', 'easemob');
watch(
  () => SDKTypes.value,
  (newVal, oldVal) => {
    console.log('newVal', newVal);
    if (newVal === SDK_TYPES.EASEMOB) {
      configForm.appKey = 'easemob-demo#support';
    } else if (newVal === SDK_TYPES.SHENGWANG) {
      console.log('切换为声网SDK 重置appkey');
      configForm.appKey = '';
      configForm.appId = '';
      console.log(configForm);
    }
  },
);
defineOptions({
  name: 'Config',
});
</script>
<template>
  <div class="m-10">
    <a-form :model="configForm" layout="horizontal">
      <a-form-item v-if="SDKTypes === 'easemob'" label="appKey" required>
        <a-input v-model="configForm.appKey" placeholder="请输入格式正确的appKey" />
        <template #extra>
          <div>环信IM所必须的appKey</div>
        </template>
      </a-form-item>
      <a-form-item v-if="SDKTypes === 'shengwang'" label="appId" required>
        <a-input v-model="configForm.appId" placeholder="请输入appId" />
        <template #extra>
          <div>声网IM所必须的appId</div>
        </template>
      </a-form-item>
      <a-form-item label="isHttpDNS">
        <a-switch v-model="configForm.isHttpDNS" />
        <template #extra>
          <div>是否开启动态获取SDK连接地址等配置</div>
        </template>
      </a-form-item>
      <a-form-item v-show="!configForm.isHttpDNS" label="apiUrl" required>
        <a-input v-model="configForm.apiUrl" placeholder="请输入RestUrl" />
        <template #extra>
          <div>SDK连接所需的RestUrl地址</div>
        </template>
      </a-form-item>
      <a-form-item v-show="!configForm.isHttpDNS" label="url" required>
        <a-input v-model="configForm.url" placeholder="请输入websocket地址" />
        <template #extra>
          <div>SDK连接所需的websocket地址</div>
        </template>
      </a-form-item>
      <a-form-item label="isFixedDeviceId">
        <a-switch v-model="configForm.isFixedDeviceId" />
        <template #extra>
          <div>
            SDK是否固定DeviceId，开启则同浏览器多标签页登录，会引起登录被踢
          </div>
        </template>
      </a-form-item>
      <a-form-item label="useOwnUploadFun">
        <a-switch v-model="configForm.useOwnUploadFun" />
        <template #extra>
          <div>
            是否开启附件上传至自定义服务，开启则SDK不会将附件域名修改为环信地址
          </div>
        </template>
      </a-form-item>
      <a-form-item label="useReplacedMessageContents" auto-label-width>
        <a-switch v-model="configForm.useReplacedMessageContents" />
        <template #extra>
          <div>
            开启后，发送消息时如果被内容审核进行了内容替换，发送方可以获取替换后的内容
          </div>
        </template>
      </a-form-item>
      <a-form-item label="deviceId">
        <a-input v-model="configForm.deviceId" placeholder="请输入自定义resource ID" />
        <template #extra>
          <div>自定义resource ID，用于区分用户登录的设备</div>
        </template>
      </a-form-item>
      <a-form-item label="delivery">
        <a-switch v-model="configForm.delivery" />
        <template #extra>
          <div>是否开启消息送达回执</div>
        </template>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="saveConfig">保存配置</a-button>
      </a-form-item>
    </a-form>
    <!-- {{ configForm }} -->
  </div>
</template>
