<script setup lang="ts">
/* 轻量递归 JSON 树：对象/数组可折叠，原子值按类型着色；用深度上限兜底循环引用 */
const props = withDefaults(
  defineProps<{
    data: unknown;
    nodeKey?: string;
    depth?: number;
  }>(),
  { nodeKey: '', depth: 0 },
);

const MAX_DEPTH = 5;

const collapsed = ref(props.depth >= 2);
const tooDeep = props.depth >= MAX_DEPTH;

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

const entries = computed(() => {
  if (!isObject(props.data) || tooDeep) return [];
  if (Array.isArray(props.data)) {
    return props.data.map((v, i) => ({ key: String(i), value: v }));
  }
  // getOwnPropertyNames 覆盖 Error、类实例等不可枚举自有属性；getter 抛错时兜底
  return Object.getOwnPropertyNames(props.data).map((k) => {
    try {
      return { key: k, value: (props.data as Record<string, unknown>)[k] };
    } catch {
      return { key: k, value: '[unreadable]' };
    }
  });
});

const typeOf = (v: unknown) => {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
};

const preview = computed(() => {
  const v = props.data;
  if (!isObject(v)) return '';
  if (tooDeep) return '…';
  if (Array.isArray(v)) return `Array(${v.length})`;
  const count = entries.value.length;
  if (count) return `Object(${count})`;
  // 无自有属性的对象（如空类实例）展示构造名而非 [object Object]
  const ctor = v.constructor?.name;
  return ctor && ctor !== 'Object' ? `${ctor} {}` : '{}';
});

const primitiveClass = computed(() => `json-${typeOf(props.data)}`);

const primitiveText = computed(() => {
  const v = props.data;
  if (typeof v === 'string') return `"${v}"`;
  if (typeof v === 'function') return 'ƒ()';
  if (v === undefined) return 'undefined';
  return String(v);
});

const toggle = () => {
  collapsed.value = !collapsed.value;
};
</script>

<template>
  <div class="json-node" :style="{ paddingLeft: depth > 0 ? '14px' : '0' }">
    <template v-if="isObject(data)">
      <span class="json-toggle" @click="toggle">
        {{ collapsed ? '▸' : '▾' }}
      </span>
      <span v-if="nodeKey" class="json-key">{{ nodeKey }}: </span>
      <span class="json-preview" @click="toggle">{{ preview }}</span>
      <template v-if="!collapsed">
        <JsonNode
          v-for="item in entries"
          :key="item.key"
          :data="item.value"
          :node-key="item.key"
          :depth="depth + 1"
        />
      </template>
    </template>
    <template v-else>
      <span class="json-toggle json-toggle--leaf"></span>
      <span v-if="nodeKey" class="json-key">{{ nodeKey }}: </span>
      <span :class="primitiveClass">{{ primitiveText }}</span>
    </template>
  </div>
</template>

<style scoped>
.json-node {
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
  font-size: 12px;
  line-height: 1.7;
  word-break: break-all;
}
.json-toggle {
  display: inline-block;
  width: 14px;
  cursor: pointer;
  color: var(--arco-color-text-3);
  user-select: none;
}
.json-toggle--leaf {
  cursor: default;
}
.json-key {
  color: rgb(var(--purple-6));
}
.json-preview {
  color: var(--arco-color-text-3);
  cursor: pointer;
}
.json-string {
  color: rgb(var(--green-6));
}
.json-number {
  color: rgb(var(--arcoblue-6));
}
.json-boolean {
  color: rgb(var(--orange-6));
}
.json-null,
.json-undefined {
  color: var(--arco-color-text-4);
  font-style: italic;
}
</style>
