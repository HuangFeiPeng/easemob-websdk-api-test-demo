<script setup lang="ts">
import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconComputer } from '@arco-design/web-vue/es/icon';
import PageHeader from '@/components/PageHeader/index.vue';
import EnvironmentCheck from '@/components/EnvironmentCheck/index.vue';
import { initializationEMClient, EMClient } from '@/EaseIM';
import { SDK_TYPES } from '@/constants';
import EC from 'easemob-websdk';
/* 组件 */
import ConfigComp from '@/components/Config/index.vue';
import LoginComp from '@/components/Login/index.vue';
import MessageComp from '@/components/Message/index.vue';
import ConversationComp from '@/components/Conversation/index.vue';
import GroupComp from '@/components/Group/index.vue';
import ContactsComp from '@/components/Contacts/index.vue';
import ChatroomComp from '@/components/Chatroom/index.vue';
import Tools from '@/components/Tools/index.vue';
import ResultPanel from '@/components/ResultPanel/index.vue';
import ApiSearch from '@/components/ApiSearch/index.vue';

// 读取 localStorage 中持久化的配置，确保首次初始化使用用户保存的配置而非默认值
const initConfig = (() => {
  try {
    const stored = localStorage.getItem('easemob-config');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.appKey || parsed.appId) return parsed;
    }
  } catch {
    /* ignore parse error */
  }
  return undefined;
})();
initializationEMClient(initConfig);

const envCheckVisible = ref(false);
const menuIndex = ref(['1']);
const testMenuList = [
  {
    name: '配置',
    key: '0',
    component: ConfigComp,
  },
  { name: '登录', key: '1', component: LoginComp },
  { name: '消息', key: '2', component: MessageComp },
  { name: '会话', key: '3', component: ConversationComp },
  { name: '用户', key: '4', component: ContactsComp },
  { name: '群组', key: '5', component: GroupComp },
  { name: '聊天室', key: '6', component: ChatroomComp },
  { name: '工具集', key: '7', component: Tools },
];
const showComponent = computed(() => {
  return testMenuList.find((item) => item.key === menuIndex.value[0])
    ?.component;
});

const apiSearchItems = [
  { label: '保存 SDK 配置 · 配置', menuKey: '0' },
  { label: '密码登录 · 登录', menuKey: '1' },
  { label: 'token 登录 · 登录', menuKey: '1' },
  { label: '退出登录 · 登录', menuKey: '1' },
  { label: '更新 token · 登录', menuKey: '1' },
  { label: '发送文本消息 · 消息', menuKey: '2' },
  { label: '发送图片消息 · 消息', menuKey: '2' },
  { label: '发送视频消息 · 消息', menuKey: '2' },
  { label: '发送命令消息 · 消息', menuKey: '2' },
  { label: '发送自定义消息 · 消息', menuKey: '2' },
  { label: '发送消息已读回执 · 消息', menuKey: '2' },
  { label: '撤回消息 · 消息', menuKey: '2' },
  { label: '修改文本消息 · 消息', menuKey: '2' },
  { label: '获取漫游历史消息 · 消息', menuKey: '2' },
  { label: '删除服务端历史消息 · 消息', menuKey: '2' },
  { label: 'Reaction 获取列表 · 消息', menuKey: '2' },
  { label: 'Reaction 获取详情 · 消息', menuKey: '2' },
  { label: 'Reaction 增加 · 消息', menuKey: '2' },
  { label: 'Reaction 删除 · 消息', menuKey: '2' },
  { label: '置顶消息 · 消息', menuKey: '2' },
  { label: '取消置顶消息 · 消息', menuKey: '2' },
  { label: '获取会话内置顶消息 · 消息', menuKey: '2' },
  { label: '获取会话列表 · 会话', menuKey: '3' },
  { label: '删除会话 · 会话', menuKey: '3' },
  { label: '发送会话已读回执 · 会话', menuKey: '3' },
  { label: '置顶会话 · 会话', menuKey: '3' },
  { label: '取消置顶会话 · 会话', menuKey: '3' },
  { label: '获取服务端置顶会话列表 · 会话', menuKey: '3' },
  { label: '标记会话 · 会话', menuKey: '3' },
  { label: '取消标记会话 · 会话', menuKey: '3' },
  { label: '按标记分页查询会话列表 · 会话', menuKey: '3' },
  { label: '获取全量好友列表 · 用户', menuKey: '4' },
  { label: '分页获取好友列表 · 用户', menuKey: '4' },
  { label: '获取好友列表（只返回ID） · 用户', menuKey: '4' },
  { label: '添加好友 · 用户', menuKey: '4' },
  { label: '删除好友 · 用户', menuKey: '4' },
  { label: '设置好友备注 · 用户', menuKey: '4' },
  { label: '获取黑名单列表 · 用户', menuKey: '4' },
  { label: '添加黑名单 · 用户', menuKey: '4' },
  { label: '删除黑名单 · 用户', menuKey: '4' },
  { label: '设置用户属性 · 用户', menuKey: '4' },
  { label: '获取用户属性 · 用户', menuKey: '4' },
  { label: '订阅用户在线状态 · 用户', menuKey: '4' },
  { label: '发布自定义在线状态 · 用户', menuKey: '4' },
  { label: '取消订阅在线状态 · 用户', menuKey: '4' },
  { label: '查询被订阅用户列表 · 用户', menuKey: '4' },
  { label: '获取用户当前在线状态 · 用户', menuKey: '4' },
  { label: '获取群组详情信息 · 群组', menuKey: '5' },
  { label: '获取已加入群组列表 · 群组', menuKey: '5' },
  { label: '获取群组成员列表 · 群组', menuKey: '5' },
  { label: '创建群组 · 群组', menuKey: '5' },
  { label: '解散群组 · 群组', menuKey: '5' },
  { label: '加入群组 · 群组', menuKey: '5' },
  { label: '退出群组 · 群组', menuKey: '5' },
  { label: '邀请群成员入群 · 群组', menuKey: '5' },
  { label: '同意入群申请 · 群组', menuKey: '5' },
  { label: '拒绝入群申请 · 群组', menuKey: '5' },
  { label: '接受入群邀请 · 群组', menuKey: '5' },
  { label: '拒绝入群邀请 · 群组', menuKey: '5' },
  { label: '设置群成员自定义属性 · 群组', menuKey: '5' },
  { label: '获取群成员自定义属性 · 群组', menuKey: '5' },
  { label: '按属性批量获取群成员自定义属性 · 群组', menuKey: '5' },
  { label: '获取群组管理员列表 · 群组', menuKey: '5' },
  { label: '添加群组管理员 · 群组', menuKey: '5' },
  { label: '删除群组管理员 · 群组', menuKey: '5' },
  { label: '转让群主 · 群组', menuKey: '5' },
  { label: '获取群组白名单 · 群组', menuKey: '5' },
  { label: '添加群组白名单 · 群组', menuKey: '5' },
  { label: '删除群组白名单 · 群组', menuKey: '5' },
  { label: '检查是否在群组白名单中 · 群组', menuKey: '5' },
  { label: '获取群组黑名单 · 群组', menuKey: '5' },
  { label: '添加群组黑名单 · 群组', menuKey: '5' },
  { label: '删除群组黑名单 · 群组', menuKey: '5' },
  { label: '获取群组禁言列表 · 群组', menuKey: '5' },
  { label: '禁言群成员 · 群组', menuKey: '5' },
  { label: '解除禁言群成员 · 群组', menuKey: '5' },
  { label: '群组全员禁言 · 群组', menuKey: '5' },
  { label: '解除群组全员禁言 · 群组', menuKey: '5' },
  { label: '获取群组信息 · 群组', menuKey: '5' },
  { label: '更新群组信息 · 群组', menuKey: '5' },
  { label: '获取群组公告 · 群组', menuKey: '5' },
  { label: '更新群组公告 · 群组', menuKey: '5' },
  { label: '获取群组文件列表 · 群组', menuKey: '5' },
  { label: '上传群组文件 · 群组', menuKey: '5' },
  { label: '下载群组文件 · 群组', menuKey: '5' },
  { label: '删除群组文件 · 群组', menuKey: '5' },
  { label: '创建聊天室 · 聊天室', menuKey: '6' },
  { label: '获取已加入聊天室列表 · 聊天室', menuKey: '6' },
  { label: '获取聊天室详情 · 聊天室', menuKey: '6' },
  { label: '加入聊天室 · 聊天室', menuKey: '6' },
  { label: '退出聊天室 · 聊天室', menuKey: '6' },
  { label: '销毁聊天室 · 聊天室', menuKey: '6' },
  { label: '更新聊天室详情 · 聊天室', menuKey: '6' },
  { label: '获取聊天室公告 · 聊天室', menuKey: '6' },
  { label: '更新聊天室公告 · 聊天室', menuKey: '6' },
  { label: '获取聊天室自定义属性 · 聊天室', menuKey: '6' },
  { label: '设置单个聊天室自定义属性 · 聊天室', menuKey: '6' },
  { label: '设置多个聊天室自定义属性 · 聊天室', menuKey: '6' },
  { label: '删除单个聊天室自定义属性 · 聊天室', menuKey: '6' },
  { label: '删除多个聊天室自定义属性 · 聊天室', menuKey: '6' },
  { label: '获取聊天室成员列表 · 聊天室', menuKey: '6' },
  { label: '移除聊天室成员 · 聊天室', menuKey: '6' },
  { label: '添加聊天室管理员 · 聊天室', menuKey: '6' },
  { label: '移除聊天室管理员 · 聊天室', menuKey: '6' },
  { label: '获取聊天室黑名单 · 聊天室', menuKey: '6' },
  { label: '添加聊天室黑名单 · 聊天室', menuKey: '6' },
  { label: '移除聊天室黑名单 · 聊天室', menuKey: '6' },
  { label: '获取聊天室禁言列表 · 聊天室', menuKey: '6' },
  { label: '查询本人在聊天室禁言状态 · 聊天室', menuKey: '6' },
  { label: '禁言聊天室成员 · 聊天室', menuKey: '6' },
  { label: '解除聊天室成员禁言 · 聊天室', menuKey: '6' },
  { label: '开启聊天室全员禁言 · 聊天室', menuKey: '6' },
  { label: '关闭聊天室全员禁言 · 聊天室', menuKey: '6' },
  { label: '获取聊天室白名单 · 聊天室', menuKey: '6' },
  { label: '添加聊天室白名单 · 聊天室', menuKey: '6' },
  { label: '移除聊天室白名单 · 聊天室', menuKey: '6' },
  { label: '检查是否在聊天室白名单中 · 聊天室', menuKey: '6' },
  { label: '生成动态 Token · 工具集', menuKey: '7' },
  { label: 'IM 网络测试工具 · 工具集', menuKey: '7' },
];
const jumpToApi = (menuKey: string) => {
  menuIndex.value = [menuKey];
};
//SDK切换checkbox
const SDKVersion = ref(EMClient.version);
const switchSDK = useLocalStorage('switchSDK', SDK_TYPES.EASEMOB);

// 获取SDK版本信息
const getSDKVersion = (sdkType: string) => {
  try {
    switch (sdkType) {
      case SDK_TYPES.EASEMOB: {
        const tempClient = new EC.connection({ appKey: 'temp#temp' });
        return `环信SDK v${tempClient.version || 'unknown'}`;
      }
      default:
        return '';
    }
  } catch (e) {
    return `${sdkType} SDK`;
  }
};

const sdkOptions = [
  {
    label: '环信SDK',
    value: SDK_TYPES.EASEMOB,
    tooltip: getSDKVersion(SDK_TYPES.EASEMOB),
  },
];

watch(switchSDK, (newVal: string) => {
  console.log('切换SDK为:', newVal);
  try {
    initializationEMClient();
    SDKVersion.value = EMClient.version;
  } catch (error: any) {
    console.error('SDK初始化失败:', error);
    Message.error({
      content: error.message || 'SDK初始化失败',
      duration: 5000,
    });
    // 回滚到上一个可用的SDK
    nextTick(() => {
      switchSDK.value = SDK_TYPES.EASEMOB;
    });
  }
});
</script>

<template>
  <div class="api-test-page">
    <PageHeader title="环信 WebSDK 4.x API 测试">
      <template #extra>
        <a-tooltip :content="`当前SDK版本：${SDKVersion}`">
          <a-radio-group v-model="switchSDK" type="button">
            <a-tooltip
              v-for="option in sdkOptions"
              :key="option.value"
              :content="option.tooltip"
            >
              <a-radio :value="option.value">
                {{ option.label }}
              </a-radio>
            </a-tooltip>
          </a-radio-group>
        </a-tooltip>
      </template>
    </PageHeader>
    <div class="api-test-page__body">
      <a-alert class="mb-4" type="warning">
        API
        输出同时展示在右侧面板与浏览器控制台；几乎所有API需要登录才能使用，如：发送消息、调用会话列表、操作好友添加等。
      </a-alert>
      <a-button
        type="primary"
        status="success"
        long
        @click="envCheckVisible = true"
      >
        <template #icon>
          <icon-computer />
        </template>
        运行环境检测
      </a-button>
      <div class="api-test-page__main">
        <div class="api-test-page__content">
          <div class="api-test-page__search">
            <ApiSearch :items="apiSearchItems" @jump="jumpToApi" />
          </div>
          <a-menu
            class="mt-4"
            mode="horizontal"
            v-model:selected-keys="menuIndex"
            :default-selected-keys="['0']"
          >
            <a-menu-item
              :key="item.key"
              v-for="item in testMenuList"
              :title="item.name"
            >
              {{ item.name }}
            </a-menu-item>
          </a-menu>
          <KeepAlive>
            <component :is="showComponent"></component>
          </KeepAlive>
        </div>
        <ResultPanel class="api-test-page__panel" />
      </div>
    </div>
    <EnvironmentCheck v-model:visible="envCheckVisible" />
  </div>
</template>

<style scoped>
.api-test-page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 16px 20px 24px;
  background: var(--arco-color-fill-1);
}

.api-test-page__body {
  max-width: 1680px;
  margin: 0 auto;
}

.api-test-page__main {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.api-test-page__content {
  flex: 1;
  min-width: 0;
}

.api-test-page__search {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.api-test-page__panel {
  width: 480px;
  flex-shrink: 0;
  position: sticky;
  top: 12px;
  height: calc(100vh - 24px);
  margin-top: 16px;
}

@media (max-width: 1024px) {
  .api-test-page__main {
    flex-direction: column;
  }
  .api-test-page__panel {
    width: 100%;
    position: static;
    height: 420px;
  }
}

@media (max-width: 640px) {
  .api-test-page {
    padding: 10px 8px 16px;
  }
}
</style>
