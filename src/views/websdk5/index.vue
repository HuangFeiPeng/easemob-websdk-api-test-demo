<script setup lang="ts">
import PageHeader from '@/components/PageHeader/index.vue';
import {
  isEMClient5Inited,
  emClient5ConnectionState,
  emClient5,
} from '@/EaseIM5';
import Config5Comp from './components/Config5/index.vue';
import Login5Comp from './components/Login5/index.vue';
import Message5Comp from './components/Message5/index.vue';
import Conversation5Comp from './components/Conversation5/index.vue';
import Group5Comp from './components/Group5/index.vue';
import Chatroom5Comp from './components/Chatroom5/index.vue';
import Contacts5Comp from './components/Contacts5/index.vue';
import Presence5Comp from './components/Presence5/index.vue';
import UserInfo5Comp from './components/UserInfo5/index.vue';
import ResultPanel from '@/components/ResultPanel/index.vue';
import ApiSearch from '@/components/ApiSearch/index.vue';

const menuIndex = ref(['1']);
const testMenuList = [
  { name: '配置', key: '0', component: Config5Comp },
  { name: '登录', key: '1', component: Login5Comp },
  { name: '消息', key: '2', component: Message5Comp },
  { name: '会话', key: '3', component: Conversation5Comp },
  { name: '群组', key: '4', component: Group5Comp },
  { name: '聊天室', key: '5', component: Chatroom5Comp },
  { name: '联系人', key: '6', component: Contacts5Comp },
  { name: '在线状态', key: '7', component: Presence5Comp },
  { name: '用户属性', key: '8', component: UserInfo5Comp },
];
const showComponent = computed(() => {
  return testMenuList.find((item) => item.key === menuIndex.value[0])
    ?.component;
});

const apiSearchItems = [
  { label: '初始化 SDK · 配置', menuKey: '0' },
  { label: '登录 · 登录', menuKey: '1' },
  { label: '退出登录 · 登录', menuKey: '1' },
  { label: '更新 token · 登录', menuKey: '1' },
  { label: '发送消息 · 消息', menuKey: '2' },
  { label: '撤回消息 · 消息', menuKey: '2' },
  { label: '获取漫游消息 · 消息', menuKey: '2' },
  { label: '发送已读回执 · 消息', menuKey: '2' },
  { label: '获取会话列表 · 会话', menuKey: '3' },
  { label: '创建群组 · 群组', menuKey: '4' },
  { label: '获取已加入群组列表 · 群组', menuKey: '4' },
  { label: '加入聊天室 · 聊天室', menuKey: '5' },
  { label: '离开聊天室 · 聊天室', menuKey: '5' },
  { label: '获取聊天室列表 · 聊天室', menuKey: '5' },
  { label: '添加联系人 · 联系人', menuKey: '6' },
  { label: '同意好友申请 · 联系人', menuKey: '6' },
  { label: '拒绝好友申请 · 联系人', menuKey: '6' },
  { label: '获取通讯录列表 · 联系人', menuKey: '6' },
  { label: '发布自定义在线状态 · 在线状态', menuKey: '7' },
  { label: '订阅在线状态 · 在线状态', menuKey: '7' },
  { label: '取消订阅在线状态 · 在线状态', menuKey: '7' },
  { label: '查询在线状态 · 在线状态', menuKey: '7' },
  { label: '查询订阅列表 · 在线状态', menuKey: '7' },
  { label: '更新用户属性 · 用户属性', menuKey: '8' },
  { label: '更新单个用户属性 · 用户属性', menuKey: '8' },
  { label: '查询用户属性 · 用户属性', menuKey: '8' },
  { label: '按属性查询用户属性 · 用户属性', menuKey: '8' },
];
const jumpToApi = (menuKey: string) => {
  menuIndex.value = [menuKey];
};
</script>

<template>
  <div class="websdk5-page">
    <PageHeader title="环信 WebSDK 5.x 测试">
      <template #extra>
        <a-tag :color="isEMClient5Inited ? 'green' : 'gray'">
          5.x client：{{ isEMClient5Inited ? '已初始化' : '未初始化' }}
        </a-tag>
        <a-tag
          :color="emClient5ConnectionState === 'connected' ? 'green' : 'orange'"
        >
          连接状态：{{ emClient5ConnectionState }}
        </a-tag>
        <a-tooltip content="当前登录用户（未登录为 null）">
          <a-tag v-if="emClient5" color="arcoblue">
            当前用户：{{ emClient5.getCurrentUserId() ?? 'null' }}
          </a-tag>
        </a-tooltip>
      </template>
    </PageHeader>
    <div class="websdk5-page__body">
      <a-alert class="mb-4" type="warning">
        API 输出同时展示在右侧面板与浏览器控制台；几乎所有业务 API
        需要先在【配置】页初始化、在【登录】页登录后才能调用。
      </a-alert>
      <div class="websdk5-page__main">
        <div class="websdk5-page__content">
          <div class="websdk5-page__search">
            <ApiSearch :items="apiSearchItems" @jump="jumpToApi" />
          </div>
          <a-menu
            mode="horizontal"
            v-model:selected-keys="menuIndex"
            :default-selected-keys="['1']"
          >
            <a-menu-item :key="item.key" v-for="item in testMenuList">
              {{ item.name }}
            </a-menu-item>
          </a-menu>
          <KeepAlive>
            <component :is="showComponent"></component>
          </KeepAlive>
        </div>
        <ResultPanel class="websdk5-page__panel" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.websdk5-page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 16px 20px 24px;
  background: var(--arco-color-fill-1);
}

.websdk5-page__body {
  max-width: 1680px;
  margin: 0 auto;
}

.websdk5-page__main {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.websdk5-page__content {
  flex: 1;
  min-width: 0;
}

.websdk5-page__search {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  margin-bottom: 8px;
}

.websdk5-page__panel {
  width: 480px;
  flex-shrink: 0;
  position: sticky;
  top: 12px;
  height: calc(100vh - 24px);
}

@media (max-width: 1024px) {
  .websdk5-page__main {
    flex-direction: column;
  }
  .websdk5-page__panel {
    width: 100%;
    position: static;
    height: 420px;
  }
}

@media (max-width: 640px) {
  .websdk5-page {
    padding: 10px 8px 16px;
  }
}
</style>
