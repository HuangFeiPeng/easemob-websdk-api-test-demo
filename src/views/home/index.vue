<script setup lang="ts">
import { ref } from 'vue';
import { IconSunFill, IconMoonFill } from '@arco-design/web-vue/es/icon';
import { initializationEMClient, EMClient } from '@/EaseIM';
import { emListenerV4, emListenerV3 } from '@/EaseIM/listener';
/* 组件 */
import ConfigComp from '@/components/Config/index.vue';
import LoginComp from '@/components/Login/index.vue';
import MessageComp from '@/components/Message/index.vue';
import ConversationComp from '@/components/Conversation/index.vue';
import GroupComp from '@/components/Group/index.vue';
import ContactsComp from '@/components/Contacts/index.vue';
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
  {
    name: '配置',
    key: '0',
    component: ConfigComp,
  },
  { name: '登录', key: '1', component: LoginComp },
  { name: '消息', key: '2', component: MessageComp },
  { name: '会话', key: '3', component: ConversationComp },
  { name: '用户关系', key: '4', component: ContactsComp },
  { name: '群组', key: '5', component: GroupComp },
];
const showComponent = computed(() => {
  return testMenuList.find((item) => item.key === menuIndex.value[0])
    ?.component;
});
</script>

<template>
  <a-card>
    <template #title>
      <a-tooltip :content="`当前SDK版本：${EMClient.version}`">
        <h1 class="text-2xl font-bold">环信WebAPI测试用例</h1>
      </a-tooltip>
    </template>
    <template #extra>
      <div>
        <a-button type="outline" shape="circle" @click="toggleTheme()">
          <template #icon>
            <icon-sun-fill style="font-size: 16px" v-if="theme === 'dark'" />
            <icon-moon-fill style="font-size: 16px" v-else />
          </template>
        </a-button>
      </div>
    </template>
    <ul>
      <li class="font-bold">
        ⭐️：本项目API输出均打印在控制台，因此请右键点击【检查】打开console查看输出。
      </li>
      <li class="font-bold">
        ⭐️：几乎所有API需要登录才能使用，如：发送消息、调用会话列表、操作好友添加等。
      </li>
    </ul>
  </a-card>
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
    <KeepAlive>
      <component :is="showComponent"></component>
    </KeepAlive>
    <!-- <component :is="showComponent"></component> -->
  </div>
</template>

<style scoped></style>
