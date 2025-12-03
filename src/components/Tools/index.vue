<template>
  <div class="tools-container">
    <a-tabs
      v-model:active-key="activeTab"
      @change="handleTabChange"
      direction="vertical"
      class="vertical-tabs"
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
import { ref, computed } from 'vue';
import TokenGenerator from './TokenGenerator.vue';

const activeTab = ref<string>('tool1');
const toolsTabs = [
  { key: 0, title: '生成动态Token' },
  { key: 1, title: '工具2' },
  { key: 2, title: '工具3' },
];

// 组件映射
const componentMap = {
  tool1: TokenGenerator,
  tool2: () => import('./Tool2.vue') as any, // 懒加载
  tool3: () => import('./Tool3.vue') as any  // 懒加载
};

// 当前组件
const currentComponent = computed(() => {
  return componentMap[activeTab.value as keyof typeof componentMap] || TokenGenerator;
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
  padding: 16px;
}

.vertical-tabs {
  margin-right: 16px;
  width: 200px;
}

.tool-content {
  flex: 1;
  margin-top: 0;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
}
</style>