<script setup lang="ts">
import { ref } from 'vue';
import { IconSunFill, IconMoonFill } from '@arco-design/web-vue/es/icon';
import { initializationEMClient, EMClient } from '@/EaseIM';
import { emListenerV4, emListenerV3 } from '@/EaseIM/listener';
/* 组件 */
import Config from '@/components/Config/index.vue';
import LoginComp from '@/components/Login/index.vue';
import MessageComp from '@/components/Message/index.vue';
import ConversationComp from '@/components/Conversation/index.vue';
import GroupComp from '@/components/Group/index.vue';

initializationEMClient();
emListenerV3(EMClient);
emListenerV4(EMClient);
const theme = ref('light');
const isDark = useDark({
  valueDark: 'dark',
  valueLight: 'light',
  storageKey: 'theme',
  onChanged(dark: boolean) {
    if (dark) {
      theme.value = 'dark';
      document.body.setAttribute('arco-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      theme.value = 'light';
      document.body.removeAttribute('arco-theme');
      document.documentElement.classList.remove('dark');
    }
  },
});
const toggleTheme = useToggle(isDark);
const menuIndex = ref(['1']);
const testMenuList = [
  { name: '配置', key: '0', componentName: Config },
  { name: '登录', key: '1', componentName: LoginComp },
  { name: '消息', key: '2', componentName: MessageComp },
  { name: '会话', key: '3', componentName: ConversationComp },
  { name: '群组', key: '4', componentName: GroupComp },
];
const showComponent = computed(() => {
  return testMenuList.find((item) => item.key === menuIndex.value[0])
    ?.componentName;
});
</script>

<template>
  <div class="mt-5 sm:w - full md:w - 1/2 lg:w - 1/3">
    <a-menu
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
    <component :is="showComponent"></component>
    <ul class="mt-10 flex space-around">
      <li class="px-2">
        <a-tooltip
          :content="`点击切换为${theme === 'light' ? '暗黑' : '亮色'}模式`"
        >
          <a-button type="outline" shape="circle" @click="toggleTheme()">
            <template #icon>
              <icon-sun-fill style="font-size: 16px" v-if="theme === 'dark'" />
              <icon-moon-fill style="font-size: 16px" v-else />
            </template>
          </a-button>
        </a-tooltip>
      </li>
    </ul>
  </div>
</template>

<style scoped></style>
