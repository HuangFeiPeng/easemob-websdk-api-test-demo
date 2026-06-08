<template>
  <div class="tools-container">
    <a-tabs
      v-model:active-key="activeTab"
      @change="handleTabChange"
      :direction="isMobile ? 'horizontal' : 'vertical'"
      :class="{ 'vertical-tabs': !isMobile, 'horizontal-tabs': isMobile }"
    >
      <a-tab-pane
        v-for="item in toolsTabs"
        :key="item.key"
        :title="item.title"
      ></a-tab-pane>
    </a-tabs>

    <div class="tool-content">
      <component :is="currentComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
} from 'vue';
import TokenGenerator from './TokenGenerator.vue';

const activeTab = ref<string>('tool1');
const isMobile = ref<boolean>(false);
const toolsTabs = [
  { key: 0, title: '生成动态Token' },
  { key: 1, title: 'IM网络测试工具' },
  { key: 2, title: '工具3' },
];

// 检测屏幕尺寸是否为移动设备
const checkIsMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

// 监听窗口大小变化
onMounted(() => {
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile);
});

// 组件映射 - 使用defineAsyncComponent正确处理懒加载组件
const componentMap = {
  tool1: TokenGenerator,
  tool2: defineAsyncComponent(
    () => import('./IMNetworkTestAddressGenerator.vue'),
  ),
  tool3: defineAsyncComponent(() => import('./Tool3.vue')),
};

// 当前组件
const currentComponent = computed(() => {
  return (
    componentMap[activeTab.value as keyof typeof componentMap] || TokenGenerator
  );
});

const handleTabChange = (key: string | number) => {
  console.log('当前选中的标签:', key);
  const keyNum = typeof key === 'string' ? parseInt(key) : key;
  activeTab.value = `tool${keyNum + 1}`;
};
</script>

<style scoped>
.tools-container {
  display: flex;
  flex-direction: column;
  padding: 16px;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 桌面端垂直tabs */
.vertical-tabs {
  margin-bottom: 16px;
  width: 100%;
}

/* 移动端水平tabs */
.horizontal-tabs {
  margin-bottom: 16px;
}

.tool-content {
  flex: 1;
  margin-top: 0;
  padding: 16px;
  border: 1px solid var(--arco-color-border-2);
  border-radius: var(--arco-border-radius-small);
  background-color: var(--arco-color-bg-1);
}

/* 桌面端布局 */
@media (min-width: 768px) {
  .tools-container {
    flex-direction: row;
  }

  .vertical-tabs {
    margin-right: 16px;
    margin-bottom: 0;
    width: 200px;
    flex-shrink: 0;
  }
}

/* 移动端布局优化 */
@media (max-width: 767px) {
  .tools-container {
    padding: 12px;
  }

  .tool-content {
    padding: 12px;
  }
}
</style>
