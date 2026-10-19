<script setup lang="ts">
import { Message } from '@arco-design/web-vue';
import { outConsoleLog } from '@/utils/consoleOutput';
import type { EM5InitOptions } from '@/EaseIM5';
import {
  initializationEMClient5,
  isEMClient5Inited,
  emClient5,
} from '@/EaseIM5';
import { EM_APPKEY } from '@/constants';

const defaultConfig: EM5InitOptions = {
  identityType: 'appKey',
  appKey: EM_APPKEY,
  appId: '',
  enableDeliveryReceipt: false,
  enableUserInfoSync: false,
  useFixedDeviceId: false,
  useReplacedMessageContents: false,
  useCustomAttachmentUpload: false,
  deleteConversationOnGroupDestroyed: true,
  deviceId: '',
};

// 使用 useLocalStorage 进行持久化存储，key 使用 websdk5- 前缀避免与 4.x 冲突
const configForm = useLocalStorage<EM5InitOptions>(
  'websdk5-config',
  defaultConfig,
  {
    mergeDefaults: true,
  },
);

onMounted(() => {
  // 已有持久化配置且尚未初始化时，自动完成初始化
  const stored = localStorage.getItem('websdk5-config');
  if (stored && !isEMClient5Inited.value) {
    try {
      const parsed = JSON.parse(stored) as EM5InitOptions;
      if (parsed.identityType === 'appId' ? parsed.appId : parsed.appKey) {
        initializationEMClient5({ ...defaultConfig, ...parsed });
      }
    } catch {
      /* ignore parse error */
    }
  }
});

const initSDK = () => {
  try {
    const client = initializationEMClient5(configForm.value);
    outConsoleLog('WebSDK5-初始化成功', client);
    Message.success('WebSDK 5.x 初始化成功');
  } catch (error) {
    outConsoleLog('WebSDK5-初始化失败', error, 'error');
    Message.error('WebSDK 5.x 初始化失败，请查看控制台');
  }
};

defineOptions({
  name: 'Config5Page',
});
</script>

<template>
  <div class="m-10">
    <a-form :model="configForm" layout="horizontal">
      <a-form-item label="身份类型">
        <a-radio-group v-model="configForm.identityType" type="button">
          <a-radio value="appKey">appKey</a-radio>
          <a-radio value="appId">appId</a-radio>
        </a-radio-group>
        <template #extra>
          <div>
            appKey 格式为 org#app；appId 模式通过 DNSConfig 解析 App Key
          </div>
        </template>
      </a-form-item>
      <a-form-item
        v-if="configForm.identityType === 'appKey'"
        label="appKey"
        required
      >
        <a-input
          v-model="configForm.appKey"
          placeholder="请输入格式正确的appKey"
        />
      </a-form-item>
      <a-form-item v-else label="appId" required>
        <a-input v-model="configForm.appId" placeholder="请输入appId" />
      </a-form-item>
      <a-form-item label="enableDeliveryReceipt">
        <a-switch v-model="configForm.enableDeliveryReceipt" />
        <template #extra>
          <div>
            是否开启送达回执，开启后收到单聊消息自动回执，发送方收到
            onMessageDelivered
          </div>
        </template>
      </a-form-item>
      <a-form-item label="enableUserInfoSync">
        <a-switch v-model="configForm.enableUserInfoSync" />
        <template #extra>
          <div>是否启用用户资料同步增强能力</div>
        </template>
      </a-form-item>
      <a-form-item label="useFixedDeviceId">
        <a-switch v-model="configForm.useFixedDeviceId" />
        <template #extra>
          <div>
            是否在同一浏览器内复用固定设备标识，开启则同浏览器多标签页登录会互相踢下线
          </div>
        </template>
      </a-form-item>
      <a-form-item label="deviceId">
        <a-input
          v-model="configForm.deviceId"
          placeholder="请输入自定义设备标识"
        />
        <template #extra>
          <div>自定义设备标识；未传时使用 SDK 默认值</div>
        </template>
      </a-form-item>
      <a-form-item label="useReplacedMessageContents" auto-label-width>
        <a-switch v-model="configForm.useReplacedMessageContents" />
        <template #extra>
          <div>内容审核替换后，是否将替换后的消息回给发送方</div>
        </template>
      </a-form-item>
      <a-form-item label="useCustomAttachmentUpload" auto-label-width>
        <a-switch v-model="configForm.useCustomAttachmentUpload" />
        <template #extra>
          <div>是否使用自定义附件上传能力</div>
        </template>
      </a-form-item>
      <a-form-item label="deleteConversationOnGroupDestroyed" auto-label-width>
        <a-switch v-model="configForm.deleteConversationOnGroupDestroyed" />
        <template #extra>
          <div>群组解散时是否自动删除对应的本地群会话，默认为 true</div>
        </template>
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" @click="initSDK">初始化</a-button>
          <a-tag v-if="isEMClient5Inited" color="green">已初始化</a-tag>
          <a-tag v-else color="gray">未初始化</a-tag>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>
