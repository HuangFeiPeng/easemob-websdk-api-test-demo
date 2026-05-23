<script setup lang="ts">
import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import {
  IconSunFill,
  IconMoonFill,
  IconComputer,
} from '@arco-design/web-vue/es/icon';
import EnvironmentCheck from '@/components/EnvironmentCheck/index.vue';
import { initializationEMClient, EMClient } from '@/EaseIM';
import { SDK_TYPES } from '@/constants';
import EC from 'easemob-websdk';
import SC from 'shengwang-chat';
import AgoraChat from 'agora-chat';
/* 组件 */
import ConfigComp from '@/components/Config/index.vue';
import LoginComp from '@/components/Login/index.vue';
import MessageComp from '@/components/Message/index.vue';
import ConversationComp from '@/components/Conversation/index.vue';
import GroupComp from '@/components/Group/index.vue';
import ContactsComp from '@/components/Contacts/index.vue';
import ChatroomComp from '@/components/Chatroom/index.vue';
import Tools from '@/components/Tools/index.vue';
initializationEMClient();
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
//SDK切换checkbox
const SDKVersion = ref(EMClient.version);
const switchSDK = useLocalStorage('switchSDK', SDK_TYPES.EASEMOB);

// 获取各个SDK的真实版本信息
const getSDKVersion = (sdkType: string) => {
  try {
    switch (sdkType) {
      case SDK_TYPES.EASEMOB: {
        const tempClient = new EC.connection({ appKey: 'temp#temp' });
        return `环信SDK v${tempClient.version || 'unknown'}`;
      }
      case SDK_TYPES.SHENGWANG: {
        const tempClient = new SC.connection({ appId: 'temp' });
        return `声网SDK v${(tempClient as any).version || 'unknown'}`;
      }
      case SDK_TYPES.AGORA: {
        const tempClient = new AgoraChat.connection({ appKey: 'temp#temp' });
        return `Agora Chat v${(tempClient as any).version || 'unknown'}`;
      }
      default:
        return '';
    }
  } catch (e) {
    // 如果创建失败，返回默认信息
    return `${sdkType} SDK`;
  }
};

const sdkOptions = [
  {
    label: '环信SDK',
    value: SDK_TYPES.EASEMOB,
    tooltip: getSDKVersion(SDK_TYPES.EASEMOB),
  },
  {
    label: '声网SDK',
    value: SDK_TYPES.SHENGWANG,
    tooltip: getSDKVersion(SDK_TYPES.SHENGWANG),
  },
  {
    label: 'Agora Chat',
    value: SDK_TYPES.AGORA,
    tooltip: getSDKVersion(SDK_TYPES.AGORA),
  },
];

watch(switchSDK, (newVal: string) => {
  console.log('切换SDK为:', newVal);
  try {
    initializationEMClient();
    SDKVersion.value = EMClient.version;
    // 如果是Agora SDK且AppKey未配置，提示用户
    if (newVal === SDK_TYPES.AGORA) {
      nextTick(() => {
        Message.info({
          content:
            '请在【配置】页面设置Agora Chat的AppKey（格式：orgName#appName）',
          duration: 5000,
        });
      });
    }
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
  <a-card>
    <template #title>
      <a-tooltip :content="`当前SDK版本：${SDKVersion}`">
        <div class="flex items-center gap-4">
          <h1 class="text-2xl font-bold">环信WebAPI测试用例</h1>
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
        </div>
      </a-tooltip>
    </template>
    <template #extra>
      <div class="flex items-center gap-2">
        <a-tooltip content="运行环境检测">
          <a-button
            type="outline"
            shape="circle"
            @click="envCheckVisible = true"
          >
            <template #icon>
              <icon-computer style="font-size: 16px" />
            </template>
          </a-button>
        </a-tooltip>
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
  <EnvironmentCheck v-model:visible="envCheckVisible" />
</template>

<style scoped></style>
