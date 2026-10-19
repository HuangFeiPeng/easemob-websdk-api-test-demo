<script setup lang="ts">
interface ApiSearchItem {
  label: string;
  menuKey: string;
}

const props = defineProps<{
  items: ApiSearchItem[];
}>();

const emit = defineEmits<{
  (e: 'jump', menuKey: string): void;
}>();

const selectedApi = ref<string>();

const options = computed(() =>
  props.items.map((item) => ({ label: item.label, value: item.label })),
);

const handleChange = (value: any) => {
  const item = props.items.find((api) => api.label === value);
  if (item) {
    emit('jump', item.menuKey);
  }
  nextTick(() => {
    selectedApi.value = undefined;
  });
};

defineOptions({
  name: 'ApiSearch',
});
</script>

<template>
  <a-select
    v-model="selectedApi"
    :options="options"
    allow-search
    allow-clear
    placeholder="搜索 API，回车直达"
    :style="{ width: '320px' }"
    @change="handleChange"
  />
</template>
