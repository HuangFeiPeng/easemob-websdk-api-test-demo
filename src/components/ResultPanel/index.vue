<script setup lang="ts">
/* 输出观察面板：API 调用结果 + SDK 事件流，页面内直接观察裸数据 */
import { Message } from '@arco-design/web-vue';
import {
  resultEntries,
  clearResultEntries,
  type ResultEntry,
} from '@/utils/resultStore';
import JsonNode from './JsonNode.vue';
import { safeStringify, oneLineStringify } from '@/utils/serialize';

type FilterKind = 'all' | 'api' | 'event';
const filter = ref<FilterKind>('all');

const filteredEntries = computed(() =>
  filter.value === 'all'
    ? resultEntries.value
    : resultEntries.value.filter((e) => e.kind === filter.value),
);

const countOf = (kind: FilterKind) =>
  kind === 'all'
    ? resultEntries.value.length
    : resultEntries.value.filter((e) => e.kind === kind).length;

const expandedMap = reactive<Record<number, boolean>>({});
const toggleExpand = (id: number) => {
  expandedMap[id] = !expandedMap[id];
};

const stringifyEntry = (entry: ResultEntry): string => safeStringify(entry.data);

const copyEntry = async (entry: ResultEntry) => {
  try {
    await navigator.clipboard.writeText(stringifyEntry(entry));
    Message.success('已复制');
  } catch {
    Message.error('复制失败，请从控制台复制');
  }
};

const oneLinePreview = (entry: ResultEntry): string =>
  oneLineStringify(entry.data);

const clearCurrent = () => {
  clearResultEntries(filter.value === 'all' ? undefined : filter.value);
};
</script>

<template>
  <div class="result-panel">
    <div class="result-panel__header">
      <a-radio-group v-model="filter" type="button" size="small">
        <a-radio value="all">全部 {{ countOf('all') }}</a-radio>
        <a-radio value="api">API 结果 {{ countOf('api') }}</a-radio>
        <a-radio value="event">SDK 事件 {{ countOf('event') }}</a-radio>
      </a-radio-group>
      <a-button size="small" status="danger" @click="clearCurrent">
        清空
      </a-button>
    </div>
    <div class="result-panel__list">
      <a-empty v-if="!filteredEntries.length" description="暂无输出" />
      <div
        v-for="entry in filteredEntries"
        :key="entry.id"
        class="result-entry"
        :class="{
          'result-entry--error': entry.type === 'error',
          'result-entry--event': entry.kind === 'event',
        }"
      >
        <div class="result-entry__head" @click="toggleExpand(entry.id)">
          <span class="result-entry__time">{{ entry.time }}</span>
          <a-tag
            size="small"
            :color="entry.kind === 'event' ? 'blue' : 'purple'"
          >
            {{ entry.kind === 'event' ? '事件' : 'API' }}
          </a-tag>
          <span class="result-entry__label">{{ entry.label }}</span>
          <a-button
            class="result-entry__copy"
            size="mini"
            type="text"
            @click.stop="copyEntry(entry)"
          >
            复制
          </a-button>
        </div>
        <div v-if="!expandedMap[entry.id]" class="result-entry__preview">
          {{ oneLinePreview(entry) }}
        </div>
        <div v-else class="result-entry__body">
          <JsonNode :data="entry.data" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-2);
  border: 1px solid var(--color-border-2);
  border-radius: 4px;
  overflow: hidden;
}
.result-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--color-border-2);
  flex-shrink: 0;
}
.result-panel__list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.result-entry {
  border: 1px solid var(--color-border-2);
  border-left: 3px solid rgb(var(--green-6));
  border-radius: 3px;
  padding: 6px 8px;
  margin-bottom: 6px;
  background: var(--color-bg-1);
}
.result-entry--error {
  border-left-color: rgb(var(--red-6));
}
.result-entry--event {
  border-left-color: rgb(var(--arcoblue-6));
}
.result-entry__head {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}
.result-entry__time {
  color: var(--arco-color-text-3);
  font-size: 11px;
  font-family: Consolas, Menlo, monospace;
  flex-shrink: 0;
}
.result-entry__label {
  font-size: 12px;
  font-weight: 600;
  flex: 1;
  word-break: break-all;
}
.result-entry__copy {
  flex-shrink: 0;
}
.result-entry__preview {
  color: var(--arco-color-text-3);
  font-size: 11px;
  font-family: Consolas, Menlo, monospace;
  margin-top: 4px;
  word-break: break-all;
}
.result-entry__body {
  margin-top: 4px;
  max-height: 400px;
  overflow: auto;
}
</style>
