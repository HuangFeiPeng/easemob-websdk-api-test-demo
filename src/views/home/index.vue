<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IconCode,
  IconNotification,
  IconThunderbolt,
  IconComputer,
  IconRight,
} from '@arco-design/web-vue/es/icon';
import PageHeader from '@/components/PageHeader/index.vue';
import EnvironmentCheck from '@/components/EnvironmentCheck/index.vue';
import { getWebSdk } from '@/sdk';

const router = useRouter();
const envCheckVisible = ref(false);
const EC = getWebSdk();

// 4.x SDK 版本（通过临时连接实例读取，无需登录）
const getSDK4Version = () => {
  try {
    const tempClient = new EC.connection({ appKey: 'temp#temp' });
    return `easemob-websdk v${tempClient.version || 'unknown'}`;
  } catch (e) {
    return 'easemob-websdk';
  }
};

const featureCards = [
  {
    key: 'api-test',
    title: 'WebSDK 4.x API 测试',
    description:
      '初始化配置、登录、消息、会话、用户、群组、聊天室等 4.x SDK API 测试，含 Token 生成等工具集。',
    route: '/api-test',
    version: getSDK4Version(),
    icon: IconCode,
  },
  {
    key: 'push-request-body',
    title: '推送请求体生成器',
    description:
      '可视化表单生成各厂商（APNs、FCM、小米、华为、荣耀等）推送 /push/single 接口请求体 JSON。',
    route: '/push-request-body',
    version: '',
    icon: IconNotification,
  },
  {
    key: 'websdk5',
    title: 'WebSDK 5.x 测试',
    description:
      '基于 5.x 新架构（ChatClient + 管理器 + 类型化事件）的初始化、登录、消息、会话、群组等 API 测试。',
    route: '/websdk5',
    version: 'easemob-websdk v5.1.3',
    icon: IconThunderbolt,
  },
];

const enterFeature = (route: string) => {
  router.push(route);
};
</script>

<template>
  <div class="home-page">
    <PageHeader :show-back="false" title="环信WebAPI测试用例" />
    <div class="home-page__body">
      <a-alert class="mb-4" type="warning">
        本项目API输出均打印在控制台，因此请右键点击【检查】打开console查看输出；几乎所有API需要登录才能使用，如：发送消息、调用会话列表、操作好友添加等。
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
      <div class="feature-grid">
        <a-card
          v-for="card in featureCards"
          :key="card.key"
          class="feature-card"
          hoverable
          @click="enterFeature(card.route)"
        >
          <div class="feature-card__header">
            <component :is="card.icon" class="feature-card__icon" />
            <div class="feature-card__title">{{ card.title }}</div>
            <a-tag
              v-if="card.version"
              class="feature-card__version"
              color="arcoblue"
              size="small"
            >
              {{ card.version }}
            </a-tag>
          </div>
          <div class="feature-card__desc">{{ card.description }}</div>
          <div class="feature-card__footer">
            进入测试
            <icon-right />
          </div>
        </a-card>
      </div>
    </div>
    <EnvironmentCheck v-model:visible="envCheckVisible" />
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 16px 20px 24px;
  background: var(--arco-color-fill-1);
}

.home-page__body {
  max-width: 1680px;
  margin: 0 auto;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.feature-card {
  cursor: pointer;
}

.feature-card__header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.feature-card__icon {
  font-size: 22px;
  color: rgb(var(--primary-6));
  flex-shrink: 0;
}

.feature-card__title {
  flex: 1;
  min-width: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--arco-color-text-1);
}

.feature-card__version {
  flex-shrink: 0;
}

.feature-card__desc {
  margin-top: 8px;
  min-height: 44px;
  color: var(--arco-color-text-2);
  line-height: 1.6;
}

.feature-card__footer {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 12px;
  color: rgb(var(--primary-6));
  font-size: 13px;
}

@media (max-width: 640px) {
  .home-page {
    padding: 10px 8px 16px;
  }
}
</style>
