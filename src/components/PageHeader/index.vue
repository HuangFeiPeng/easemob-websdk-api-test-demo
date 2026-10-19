<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  IconLeft,
  IconSunFill,
  IconMoonFill,
} from '@arco-design/web-vue/es/icon';
import { useAppTheme } from '@/utils/theme';

withDefaults(defineProps<{ title: string; showBack?: boolean }>(), {
  showBack: true,
});

const router = useRouter();
const { theme, toggleTheme } = useAppTheme();
const goHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="page-header">
    <a-button v-if="showBack" type="outline" @click="goHome">
      <template #icon>
        <icon-left />
      </template>
      返回首页
    </a-button>
    <div class="page-header__breadcrumb">{{ title }}</div>
    <div class="page-header__extra"><slot name="extra" /></div>
    <a-button type="outline" shape="circle" @click="toggleTheme()">
      <template #icon>
        <icon-sun-fill style="font-size: 16px" v-if="theme === 'dark'" />
        <icon-moon-fill style="font-size: 16px" v-else />
      </template>
    </a-button>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 14px;
  max-width: 1680px;
  margin: 0 auto 16px;
  padding: 12px 16px;
  border: 1px solid var(--arco-color-border-2);
  border-radius: 8px;
  background: var(--arco-color-bg-1);
}

.page-header__breadcrumb {
  min-width: 0;
  color: var(--arco-color-text-1);
  font-size: 15px;
  font-weight: 600;
}

.page-header__extra {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-width: 0;
}

@media (max-width: 640px) {
  .page-header {
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px;
  }

  .page-header__breadcrumb {
    order: -1;
    flex-basis: 100%;
  }
}
</style>
