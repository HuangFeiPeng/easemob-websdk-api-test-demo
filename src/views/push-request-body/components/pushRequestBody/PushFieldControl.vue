<template>
  <div class="push-field" :class="{ 'push-field--error': visibleError }">
    <label class="push-field__label" :for="controlId">
      <span>{{ field.label }}</span>
      <span v-if="field.required" class="push-field__required">*</span>
      <a-tag v-if="field.source === 'attachment'" size="small" color="orange">
        附件补充
      </a-tag>
    </label>

    <code class="push-field__path">{{ field.path }}</code>

    <a-input
      v-if="field.type === 'text'"
      :id="controlId"
      v-model="textValue"
      :placeholder="field.placeholder"
      :maxlength="field.maxLength"
      :aria-describedby="describedBy"
      :aria-invalid="Boolean(visibleError)"
      allow-clear
      @blur="handleBlur"
    />

    <a-textarea
      v-else-if="field.type === 'textarea'"
      :id="controlId"
      v-model="textValue"
      :placeholder="field.placeholder"
      :maxlength="field.maxLength"
      :auto-size="{ minRows: 2, maxRows: 5 }"
      :aria-describedby="describedBy"
      :aria-invalid="Boolean(visibleError)"
      @blur="handleBlur"
    />

    <a-input-number
      v-else-if="field.type === 'integer' || field.type === 'number'"
      :id="controlId"
      v-model="numberValue"
      :min="field.min"
      :max="field.max"
      :precision="field.type === 'integer' ? 0 : undefined"
      :placeholder="field.placeholder"
      :aria-describedby="describedBy"
      :aria-invalid="Boolean(visibleError)"
      @blur="handleBlur"
    />

    <a-select
      v-else-if="field.type === 'select' || field.type === 'boolean'"
      :id="controlId"
      v-model="selectValue"
      :placeholder="field.placeholder || '不设置'"
      :aria-describedby="describedBy"
      :aria-invalid="Boolean(visibleError)"
      allow-clear
      @blur="handleBlur"
    >
      <a-option
        v-for="option in selectOptions"
        :key="String(option.value)"
        :value="option.value"
        :label="option.label"
      />
    </a-select>

    <a-input-tag
      v-else-if="field.type === 'string-list'"
      :id="controlId"
      v-model="listValue"
      :placeholder="field.placeholder || '输入后按回车添加'"
      :aria-describedby="describedBy"
      :aria-invalid="Boolean(visibleError)"
      allow-clear
      @blur="handleBlur"
    />

    <a-textarea
      v-else
      :id="controlId"
      v-model="jsonValue"
      :placeholder="jsonPlaceholder"
      :auto-size="{ minRows: 3, maxRows: 10 }"
      :aria-describedby="describedBy"
      :aria-invalid="Boolean(visibleError)"
      class="push-field__json"
      spellcheck="false"
      @blur="handleBlur"
    />

    <div v-if="field.help" :id="helpId" class="push-field__help">
      {{ field.help }}
    </div>
    <div
      v-if="visibleError"
      :id="errorId"
      class="push-field__error"
      role="alert"
    >
      {{ visibleError.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type {
  PushFieldSchema,
  PushSelectOption,
  ValidationIssue,
} from './schema';

const props = defineProps<{
  field: PushFieldSchema;
  value?: unknown;
  error?: ValidationIssue;
  inputId?: string;
  forceShowError?: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:value', value: unknown): void;
  (event: 'blur'): void;
}>();

const touched = ref(false);
const controlId = computed(
  () =>
    props.inputId || `push-${props.field.path.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
);
const helpId = computed(() => `${controlId.value}-help`);
const errorId = computed(() => `${controlId.value}-error`);
const visibleError = computed(() =>
  touched.value || props.forceShowError ? props.error : undefined,
);
const describedBy = computed(() => {
  const ids = [];
  if (props.field.help) ids.push(helpId.value);
  if (visibleError.value) ids.push(errorId.value);
  return ids.length ? ids.join(' ') : undefined;
});

const textValue = computed({
  get: () =>
    props.value === undefined || props.value === null
      ? ''
      : String(props.value),
  set: (value: string) => emit('update:value', value),
});
const numberValue = computed({
  get: () =>
    props.value === undefined || props.value === null || props.value === ''
      ? undefined
      : Number(props.value),
  set: (value?: number) => emit('update:value', value),
});
const selectValue = computed({
  get: () => props.value as string | number | boolean | undefined,
  set: (value?: string | number | boolean) => emit('update:value', value),
});
const listValue = computed({
  get: () => (Array.isArray(props.value) ? (props.value as string[]) : []),
  set: (value: string[]) => emit('update:value', value),
});
const jsonValue = computed({
  get: () => {
    if (props.value === undefined || props.value === null) return '';
    return typeof props.value === 'string'
      ? props.value
      : JSON.stringify(props.value, null, 2);
  },
  set: (value: string) => emit('update:value', value),
});

const selectOptions = computed<PushSelectOption[]>(() => {
  if (props.field.type === 'boolean') {
    return [
      { label: 'true（是）', value: true },
      { label: 'false（否）', value: false },
    ];
  }
  return props.field.options || [];
});
const jsonPlaceholder = computed(
  () =>
    props.field.placeholder ||
    (props.field.type === 'json-array'
      ? '[{"key":"value"}]'
      : '{"key":"value"}'),
);

const handleBlur = () => {
  touched.value = true;
  emit('blur');
};

watch(
  () => props.field.path,
  () => {
    touched.value = false;
  },
);
</script>

<style scoped>
.push-field {
  min-width: 0;
}

.push-field__label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
  color: var(--arco-color-text-1);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}

.push-field__required {
  color: var(--arco-color-danger, #f53f3f);
}

.push-field__path {
  display: block;
  margin-bottom: 6px;
  color: var(--arco-color-text-3);
  font-size: 11px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.push-field :deep(.arco-input-wrapper),
.push-field :deep(.arco-textarea-wrapper),
.push-field :deep(.arco-input-number),
.push-field :deep(.arco-select),
.push-field :deep(.arco-input-tag) {
  width: 100%;
}

.push-field__json :deep(textarea) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
}

.push-field__help {
  margin-top: 5px;
  color: var(--arco-color-text-3);
  font-size: 12px;
  line-height: 1.5;
}

.push-field__error {
  margin-top: 5px;
  color: var(--arco-color-danger, #f53f3f);
  font-size: 12px;
  line-height: 1.5;
}

.push-field--error :deep(.arco-input-wrapper),
.push-field--error :deep(.arco-textarea-wrapper),
.push-field--error :deep(.arco-select-view-single),
.push-field--error :deep(.arco-input-tag) {
  border-color: var(--arco-color-danger, #f53f3f);
}
</style>
