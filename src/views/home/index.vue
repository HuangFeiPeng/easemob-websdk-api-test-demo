<script setup lang="ts">
import { ref } from 'vue';
import {
  IconSunFill,
  IconMoonFill
} from '@arco-design/web-vue/es/icon';
/* 组件 */
import Config from "@/components/Config/index.vue";
import LoginComp from "@/components/Login/index.vue";
import MessageComp from "@/components/Message/index.vue";
import { Notification } from '@arco-design/web-vue';
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

const featureList = [
  { name: 'Vue3', url: 'https://cn.vuejs.org/' },
  { name: 'Vite4', url: 'https://cn.vitejs.dev/' },
  { name: 'TypeScript', url: 'https://www.typescriptlang.org/' },
  { name: 'Arco Design Vue', url: 'https://arco.design/' },
  { name: 'Icones', url: 'https://icones.js.org/' },
  { name: 'Pnpm', url: 'https://www.pnpm.cn/' },
  { name: 'VueUse', url: 'https://vueuse.org/' },
  { name: 'Vue router', url: 'https://router.vuejs.org/zh/' },
  { name: 'Pinia', url: 'https://pinia.web3doc.top/' },
  { name: 'Axios', url: 'https://www.axios-http.cn/' },
  { name: 'Less', url: 'https://less.devjs.cn/' },
  { name: 'Tailwind CSS', url: 'https://tailwindcss.com/' },
  { name: 'Eslint', url: 'http://eslint.cn/' },
  { name: 'Prettier', url: 'https://www.prettier.cn/' },
  { name: 'husky', url: 'https://www.npmjs.com/package/husky' },
  { name: 'lint-staged', url: 'https://www.npmjs.com/package/lint-staged' },
  { name: 'commitlint', url: 'https://commitlint.js.org/', end: true },
];
const menuIndex = ref(['0']);
const testMenuList = [
  {name:'配置',key:'0',componentName:Config},
  { name : '登录',key:'1',componentName:LoginComp},
  { name : '消息',key:'2',componentName:MessageComp},
]
const showComponent = computed(()=>{
  return testMenuList.find(item=>item.key === menuIndex.value[0])?.componentName
})
</script>

<template>
  <div class="mt-5 sm:w - full md:w - 1/2 lg:w - 1/3">
    <a-menu mode="horizontal" v-model:selected-keys="menuIndex"  :default-selected-keys="['0']">
      <a-menu-item :key="item.key" v-for="item in testMenuList" :title="item.name">
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
