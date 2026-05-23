<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  IconComputer,
  IconMobile,
  IconStorage,
  IconLink,
  IconWifi,
  IconCode,
  IconSafe,
  IconRefresh,
  IconCheckCircleFill,
  IconExclamationCircleFill,
  IconCloseCircleFill,
  IconInfoCircleFill,
} from '@arco-design/web-vue/es/icon';
import {
  runEnvironmentCheck,
  type EnvironmentCheckResult,
  type CheckStatus,
} from '@/utils/environmentCheck';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const drawerVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

const loading = ref(false);
const result = ref<EnvironmentCheckResult | null>(null);
const innerWidth = ref(window.innerWidth);

const handleResize = () => {
  innerWidth.value = window.innerWidth;
};

window.addEventListener('resize', handleResize);

const iconMap: Record<string, any> = {
  'icon-desktop': IconComputer,
  'icon-browser': IconComputer,
  'icon-storage': IconStorage,
  'icon-link': IconLink,
  'icon-wifi': IconWifi,
  'icon-mobile': IconMobile,
  'icon-code': IconCode,
  'icon-safe': IconSafe,
};

const statusIconMap: Record<CheckStatus, any> = {
  pass: IconCheckCircleFill,
  warn: IconExclamationCircleFill,
  fail: IconCloseCircleFill,
  info: IconInfoCircleFill,
};

const statusColorMap: Record<CheckStatus, string> = {
  pass: 'text-green-500',
  warn: 'text-yellow-500',
  fail: 'text-red-500',
  info: 'text-gray-400',
};

const statusBgMap: Record<CheckStatus, string> = {
  pass: 'bg-green-50 dark:bg-green-900/20',
  warn: 'bg-yellow-50 dark:bg-yellow-900/20',
  fail: 'bg-red-50 dark:bg-red-900/20',
  info: 'bg-gray-50 dark:bg-gray-800/50',
};

const summaryColorClass = computed(() => {
  if (!result.value) return 'text-gray-500';
  if (result.value.summary.fail > 0) return 'text-red-500';
  if (result.value.summary.warn > 0) return 'text-yellow-500';
  return 'text-green-500';
});

const summaryBgClass = computed(() => {
  if (!result.value) return 'bg-gray-50';
  if (result.value.summary.fail > 0) return 'bg-red-50 dark:bg-red-900/20';
  if (result.value.summary.warn > 0)
    return 'bg-yellow-50 dark:bg-yellow-900/20';
  return 'bg-green-50 dark:bg-green-900/20';
});

async function doCheck() {
  loading.value = true;
  try {
    result.value = await runEnvironmentCheck();
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.visible,
  (val) => {
    if (val && !result.value) {
      doCheck();
    }
  },
);

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <a-drawer
    v-model:visible="drawerVisible"
    title="运行环境检测"
    :width="innerWidth < 768 ? '100%' : 640"
    :mask-closable="true"
    :unmount-on-close="false"
  >
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <a-spin :size="28" tip="正在检测运行环境..." />
    </div>

    <div v-else-if="result" class="space-y-4">
      <!-- 总体结果 -->
      <div
        :class="[
          'rounded-lg border p-4',
          summaryBgClass,
          'border-current border-opacity-20',
        ]"
      >
        <div class="flex items-center gap-3">
          <component
            :is="
              result.summary.fail > 0
                ? IconCloseCircleFill
                : result.summary.warn > 0
                ? IconExclamationCircleFill
                : IconCheckCircleFill
            "
            class="text-xl"
            :class="summaryColorClass"
          />
          <div class="flex-1">
            <div class="font-bold" :class="summaryColorClass">
              {{ result.summary.isCompatible ? '环境兼容' : '存在不兼容' }}
            </div>
            <div class="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {{ result.summary.message }}
            </div>
          </div>
        </div>
        <div class="mt-3 flex gap-4 text-sm">
          <span class="text-green-600 dark:text-green-400">
            通过 {{ result.summary.pass }}
          </span>
          <span
            v-if="result.summary.warn > 0"
            class="text-yellow-600 dark:text-yellow-400"
          >
            警告 {{ result.summary.warn }}
          </span>
          <span
            v-if="result.summary.fail > 0"
            class="text-red-600 dark:text-red-400"
          >
            不通过 {{ result.summary.fail }}
          </span>
          <span class="text-gray-400"> 总计 {{ result.summary.total }} </span>
        </div>
      </div>

      <!-- 分类卡片网格 -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div
          v-for="cat in result.categories"
          :key="cat.title"
          class="rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <!-- 分类标题 -->
          <div
            class="flex items-center gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-700"
          >
            <component
              :is="iconMap[cat.icon] || IconInfoCircleFill"
              class="text-lg text-gray-500"
            />
            <span class="font-bold">{{ cat.title }}</span>
          </div>

          <!-- 检测项列表 -->
          <div class="divide-y divide-gray-100 dark:divide-gray-700">
            <div
              v-for="item in cat.items"
              :key="item.label"
              :class="[
                'flex items-start gap-3 px-4 py-2.5',
                statusBgMap[item.status],
              ]"
            >
              <component
                :is="statusIconMap[item.status]"
                :class="[
                  'mt-0.5 flex-shrink-0 text-base',
                  statusColorMap[item.status],
                ]"
              />
              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-2">
                  <span
                    class="text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    {{ item.label }}
                  </span>
                  <span
                    class="max-w-[60%] flex-shrink-0 break-all text-right text-sm font-semibold"
                    :class="statusColorMap[item.status]"
                  >
                    {{ item.value }}
                  </span>
                </div>
                <div
                  v-if="item.description"
                  class="mt-0.5 text-xs text-gray-500 dark:text-gray-400"
                >
                  {{ item.description }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部重新检测按钮 -->
    <template #footer>
      <a-button type="primary" :loading="loading" @click="doCheck">
        <template #icon>
          <icon-refresh />
        </template>
        重新检测
      </a-button>
    </template>
  </a-drawer>
</template>
