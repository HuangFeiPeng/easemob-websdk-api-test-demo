<template>
  <div class="push-generator">
    <div class="push-generator__header">
      <div>
        <h2>推送请求体生成器</h2>
        <p>
          先填基础内容即可生成；厂商申请到的参数按需补充，高级字段默认折叠。
        </p>
      </div>
      <div class="push-generator__links">
        <a
          href="https://doc.easemob.com/push/push_notification_config.html"
          target="_blank"
          rel="noreferrer"
        >
          字段文档
        </a>
        <a-divider direction="vertical" />
        <a
          href="https://doc.easemob.com/push/push_send_notification.html"
          target="_blank"
          rel="noreferrer"
        >
          发送接口文档
        </a>
      </div>
    </div>

    <a-alert type="info" class="push-generator__alert">
      生成的是环信即时推送请求体，不是厂商原生
      API。实际发送仍需开通即时推送、有效 App
      Token、厂商证书与推送绑定；勾选厂商仅生成对应配置，不代表指定设备路由。
    </a-alert>

    <form class="push-generator__layout" @submit.prevent="copyResult">
      <div class="push-generator__editor">
        <a-card class="push-section">
          <div class="push-section__heading">
            <span class="push-section__step">1</span>
            <div>
              <h3>选择输出与接收人</h3>
              <p>默认生成可直接用于批量推送接口的完整 JSON。</p>
            </div>
          </div>

          <a-radio-group v-model="outputMode" type="button" class="output-mode">
            <a-radio value="full">完整 /push/single 请求体</a-radio>
            <a-radio value="pushMessage">仅 pushMessage</a-radio>
          </a-radio-group>

          <template v-if="outputMode === 'full'">
            <div class="target-field">
              <label for="push-targets">目标用户 ID <span>*</span></label>
              <a-input-tag
                id="push-targets"
                v-model="targets"
                placeholder="输入用户 ID 后按回车，最多 100 个"
                aria-describedby="push-targets-help"
                allow-clear
                @blur="targetsTouched = true"
              />
              <div id="push-targets-help" class="field-help">
                每个 ID 单独一项；重复粘贴时可一次添加多个。
              </div>
              <div v-if="showTargetError" class="field-error" role="alert">
                {{ targetError?.message }}
              </div>
            </div>

            <div class="target-field">
              <label for="push-strategy">推送策略</label>
              <a-select id="push-strategy" v-model="strategy">
                <a-option
                  v-for="option in strategyOptions"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </a-select>
              <div class="field-help">{{ strategyHelp }}</div>
            </div>

            <div class="endpoint-hint">
              <code>POST https://{host}/{org_name}/{app_name}/push/single</code>
              <code>Content-Type: application/json</code>
              <code>Authorization: Bearer &lt;YourAppToken&gt;</code>
            </div>
          </template>
          <div v-else class="endpoint-hint">
            <code
              >仅输出 pushMessage，可嵌入 /push/single、/push/sync/{target}
              等接口</code
            >
          </div>
        </a-card>

        <a-card class="push-section">
          <div class="push-section__heading">
            <span class="push-section__step">2</span>
            <div>
              <h3>基础通知内容</h3>
              <p>标题和内容已给出示例，修改后即可使用。</p>
            </div>
          </div>

          <div class="field-grid">
            <PushFieldControl
              v-for="field in quickFields(BASIC_PUSH_FIELDS)"
              :key="field.path"
              :field="field"
              :value="basicValues[field.path]"
              :error="errorFor('basic', field.path)"
              :input-id="fieldInputId('basic', field.path)"
              :force-show-error="showAllErrors"
              :class="{ 'field-grid__wide': isWideField(field) }"
              @update:value="setBasicValue(field.path, $event)"
            />
          </div>

          <template v-if="advancedFields(BASIC_PUSH_FIELDS).length">
            <a-button
              type="text"
              class="advanced-toggle"
              :aria-expanded="Boolean(advancedOpen.basic)"
              aria-controls="basic-advanced-fields"
              @click="toggleAdvanced('basic')"
            >
              <template #icon>
                <icon-down v-if="advancedOpen.basic" />
                <icon-right v-else />
              </template>
              高级基础配置（{{ advancedFields(BASIC_PUSH_FIELDS).length }}）
            </a-button>
            <div
              v-show="advancedOpen.basic"
              id="basic-advanced-fields"
              class="advanced-fields"
            >
              <div
                v-for="group in advancedGroups(BASIC_PUSH_FIELDS)"
                :key="group.name"
                class="advanced-group"
              >
                <h4 v-if="group.name !== '其他配置'">{{ group.name }}</h4>
                <div class="field-grid">
                  <PushFieldControl
                    v-for="field in group.fields"
                    :key="field.path"
                    :field="field"
                    :value="basicValues[field.path]"
                    :error="errorFor('basic', field.path)"
                    :input-id="fieldInputId('basic', field.path)"
                    :force-show-error="showAllErrors"
                    :class="{ 'field-grid__wide': isWideField(field) }"
                    @update:value="setBasicValue(field.path, $event)"
                  />
                </div>
              </div>
            </div>
          </template>
        </a-card>

        <a-card class="push-section">
          <div class="push-section__heading vendor-heading">
            <div class="vendor-heading__title">
              <span class="push-section__step">3</span>
              <div>
                <h3>厂商专属配置（可选）</h3>
                <p>只添加你实际使用的厂商；厂商字段会覆盖基础通知内容。</p>
              </div>
            </div>
            <a-select
              v-model="vendorToAdd"
              class="vendor-select"
              placeholder="添加厂商配置"
              allow-search
            >
              <a-option
                v-for="vendor in availableVendors"
                :key="vendor.key"
                :value="vendor.key"
                :label="vendor.label"
              />
            </a-select>
          </div>

          <a-empty
            v-if="!selectedVendorSchemas.length"
            description="不添加厂商也能生成请求体；需要 channel ID、分类等厂商参数时再添加"
          />

          <template v-else>
            <div class="vendor-toolbar">
              <a-tabs v-model:active-key="activeVendor" type="card-gutter">
                <a-tab-pane
                  v-for="vendor in selectedVendorSchemas"
                  :key="vendor.key"
                  :title="vendor.label"
                />
              </a-tabs>
              <a-button
                v-if="currentVendor"
                type="text"
                status="danger"
                @click="removeCurrentVendor"
              >
                移除
              </a-button>
            </div>

            <div v-if="currentVendor" class="vendor-panel">
              <div class="vendor-panel__meta">
                <span>{{ currentVendor.description }}</span>
                <code>pushMessage.{{ currentVendor.key }}</code>
              </div>

              <div class="field-grid">
                <PushFieldControl
                  v-for="field in quickFields(currentVendor.fields)"
                  :key="field.path"
                  :field="field"
                  :value="vendorValues[currentVendor.key]?.[field.path]"
                  :error="errorFor(currentVendor.key, field.path)"
                  :input-id="fieldInputId(currentVendor.key, field.path)"
                  :force-show-error="showAllErrors"
                  :class="{ 'field-grid__wide': isWideField(field) }"
                  @update:value="setVendorValue(field.path, $event)"
                />
              </div>

              <div class="vendor-panel__actions">
                <a-button
                  v-if="advancedFields(currentVendor.fields).length"
                  type="text"
                  class="advanced-toggle"
                  :aria-expanded="Boolean(advancedOpen[currentVendor.key])"
                  :aria-controls="`vendor-advanced-${currentVendor.key}`"
                  @click="toggleAdvanced(currentVendor.key)"
                >
                  <template #icon>
                    <icon-down v-if="advancedOpen[currentVendor.key]" />
                    <icon-right v-else />
                  </template>
                  高级配置（{{ advancedFields(currentVendor.fields).length }}）
                </a-button>
                <a-button type="text" @click="clearCurrentVendor">
                  清空当前厂商
                </a-button>
              </div>

              <div
                v-show="advancedOpen[currentVendor.key]"
                :id="`vendor-advanced-${currentVendor.key}`"
                class="advanced-fields"
              >
                <div
                  v-for="group in advancedGroups(currentVendor.fields)"
                  :key="group.name"
                  class="advanced-group"
                >
                  <h4 v-if="group.name !== '其他配置'">{{ group.name }}</h4>
                  <div class="field-grid">
                    <PushFieldControl
                      v-for="field in group.fields"
                      :key="field.path"
                      :field="field"
                      :value="vendorValues[currentVendor.key]?.[field.path]"
                      :error="errorFor(currentVendor.key, field.path)"
                      :input-id="fieldInputId(currentVendor.key, field.path)"
                      :force-show-error="showAllErrors"
                      :class="{ 'field-grid__wide': isWideField(field) }"
                      @update:value="setVendorValue(field.path, $event)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </a-card>
      </div>

      <aside class="push-preview">
        <div class="push-preview__sticky">
          <div class="push-preview__heading">
            <div>
              <h3>JSON 预览</h3>
              <span>{{
                outputMode === 'full' ? '完整请求体' : 'pushMessage'
              }}</span>
            </div>
            <a-button type="primary" html-type="submit" :loading="copying">
              <template #icon><icon-copy /></template>
              一键复制
            </a-button>
          </div>

          <div
            v-if="showAllErrors && result.errors.length"
            class="push-preview__errors"
            role="alert"
          >
            <strong>复制前请修正 {{ result.errors.length }} 项配置：</strong>
            <div
              v-for="error in result.errors.slice(0, 5)"
              :key="`${error.vendor}:${error.path}`"
            >
              {{ errorLabel(error) }}：{{ error.message }}
            </div>
            <span v-if="result.errors.length > 5">
              另有 {{ result.errors.length - 5 }} 项，请逐一检查表单。
            </span>
          </div>

          <div v-if="result.warnings.length" class="push-preview__warnings">
            <div v-for="warning in result.warnings" :key="warning">
              {{ warning }}
            </div>
          </div>

          <textarea
            ref="previewElement"
            class="push-preview__json"
            :value="result.json"
            readonly
            aria-label="生成的 JSON 请求体"
            spellcheck="false"
          ></textarea>
          <div class="push-preview__footnote">
            空的可选字段不会输出；false 和 0 会按原类型保留。
          </div>
        </div>
      </aside>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconCopy, IconDown, IconRight } from '@arco-design/web-vue/es/icon';
import PushFieldControl from './pushRequestBody/PushFieldControl.vue';
import { copyTextWithFallback } from './pushRequestBody/clipboard';
import { buildPushRequest } from './pushRequestBody/builder';
import {
  BASIC_PUSH_FIELDS,
  PUSH_VENDOR_SCHEMAS,
  type PushFieldSchema,
  type PushFormValues,
  type PushOutputMode,
  type ValidationIssue,
  type VendorId,
} from './pushRequestBody/schema';

const outputMode = ref<PushOutputMode>('full');
const targets = ref<string[]>([]);
const strategy = ref(2);
const basicValues = reactive<PushFormValues>({});
const selectedVendors = ref<VendorId[]>([]);
const vendorValues = reactive<Partial<Record<VendorId, PushFormValues>>>({});
const vendorToAdd = ref<VendorId>();
const activeVendor = ref('');
const advancedOpen = reactive<Record<string, boolean>>({});
const showAllErrors = ref(false);
const targetsTouched = ref(false);
const copying = ref(false);
const previewElement = ref<HTMLTextAreaElement>();

BASIC_PUSH_FIELDS.forEach((field) => {
  if (field.defaultValue !== undefined) {
    basicValues[field.path] = field.defaultValue;
  }
});

const strategyOptions = [
  { value: 0, label: '0 · 厂商通道优先，失败时走环信' },
  { value: 1, label: '1 · 仅环信通道，离线消息保留' },
  { value: 2, label: '2 · 仅第三方厂商通道（文档默认）' },
  { value: 3, label: '3 · 在线走环信，离线走厂商' },
  { value: 4, label: '4 · 仅环信通道且只推在线用户' },
];
const strategyHelp = computed(
  () =>
    strategyOptions.find((option) => option.value === strategy.value)?.label,
);

const selectedVendorSchemas = computed(() =>
  selectedVendors.value
    .map((vendorId) =>
      PUSH_VENDOR_SCHEMAS.find((item) => item.key === vendorId),
    )
    .filter((vendor): vendor is NonNullable<typeof vendor> => Boolean(vendor)),
);
const availableVendors = computed(() =>
  PUSH_VENDOR_SCHEMAS.filter(
    (vendor) => !selectedVendors.value.includes(vendor.key),
  ),
);
const currentVendor = computed(
  () =>
    selectedVendorSchemas.value.find(
      (vendor) => vendor.key === activeVendor.value,
    ) || selectedVendorSchemas.value[0],
);

const result = computed(() =>
  buildPushRequest({
    outputMode: outputMode.value,
    targets: targets.value,
    strategy: strategy.value,
    basicValues,
    selectedVendors: selectedVendors.value,
    vendorValues,
  }),
);
const targetError = computed(() =>
  result.value.errors.find((error) => error.path === 'targets'),
);
const showTargetError = computed(() =>
  Boolean(targetError.value && (targetsTouched.value || showAllErrors.value)),
);

const quickFields = (fields: PushFieldSchema[]) =>
  fields.filter((field) => !field.advanced);
const advancedFields = (fields: PushFieldSchema[]) =>
  fields.filter((field) => field.advanced);
const advancedGroups = (fields: PushFieldSchema[]) => {
  const groups = new Map<string, PushFieldSchema[]>();
  advancedFields(fields).forEach((field) => {
    const name = field.group || '其他配置';
    groups.set(name, [...(groups.get(name) || []), field]);
  });
  return Array.from(groups, ([name, groupFields]) => ({
    name,
    fields: groupFields,
  }));
};
const isWideField = (field: PushFieldSchema) =>
  field.type === 'textarea' || field.type.startsWith('json-');
const fieldInputId = (vendor: VendorId | 'basic', path: string) =>
  `push-${vendor}-${path.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
const errorFor = (vendor: VendorId | 'basic', path: string) =>
  result.value.errors.find(
    (error) => error.vendor === vendor && error.path === path,
  );
const errorLabel = (error: ValidationIssue) => {
  if (error.path === 'targets') return '目标用户';
  if (error.vendor === 'basic') return `基础配置 / ${error.path}`;
  const vendor = PUSH_VENDOR_SCHEMAS.find((item) => item.key === error.vendor);
  return `${vendor?.label || error.vendor} / ${error.path}`;
};

const setBasicValue = (path: string, value: unknown) => {
  basicValues[path] = value;
};
const setVendorValue = (path: string, value: unknown) => {
  if (!currentVendor.value) return;
  if (!vendorValues[currentVendor.value.key])
    vendorValues[currentVendor.value.key] = {};
  vendorValues[currentVendor.value.key]![path] = value;
};
const toggleAdvanced = (key: string) => {
  advancedOpen[key] = !advancedOpen[key];
};

const addVendor = (vendorId?: VendorId) => {
  if (!vendorId || selectedVendors.value.includes(vendorId)) return;
  selectedVendors.value.push(vendorId);
  if (!vendorValues[vendorId]) vendorValues[vendorId] = {};
  activeVendor.value = vendorId;
  vendorToAdd.value = undefined;
};
const removeCurrentVendor = () => {
  if (!currentVendor.value) return;
  selectedVendors.value = selectedVendors.value.filter(
    (vendorId) => vendorId !== currentVendor.value!.key,
  );
  activeVendor.value = selectedVendors.value[0] || '';
};
const clearCurrentVendor = () => {
  if (!currentVendor.value) return;
  vendorValues[currentVendor.value.key] = {};
};

const focusError = async (error: ValidationIssue) => {
  if (error.vendor && error.vendor !== 'basic') {
    activeVendor.value = error.vendor;
    advancedOpen[error.vendor] = true;
  } else if (
    error.vendor === 'basic' &&
    !['targets', 'strategy'].includes(error.path)
  ) {
    advancedOpen.basic = true;
  }
  await nextTick();
  const id = ['targets', 'strategy'].includes(error.path)
    ? `push-${error.path}`
    : fieldInputId(error.vendor || 'basic', error.path);
  document.getElementById(id)?.focus();
};

const copyResult = async () => {
  showAllErrors.value = true;
  await nextTick();
  if (result.value.errors.length) {
    const [firstError] = result.value.errors;
    Message.error(`请先修正配置：${firstError.message}`);
    await focusError(firstError);
    return;
  }
  copying.value = true;
  const fallbackTarget = previewElement.value || {
    focus: () => undefined,
    select: () => undefined,
  };
  const copied = await copyTextWithFallback(result.value.json, fallbackTarget);
  if (copied) {
    Message.success('请求体已复制到剪贴板');
  } else {
    Message.error('自动复制失败，已选中 JSON，请手动复制');
  }
  copying.value = false;
};

watch(vendorToAdd, (vendorId) => addVendor(vendorId));
watch(selectedVendorSchemas, (vendors) => {
  if (!vendors.some((vendor) => vendor.key === activeVendor.value)) {
    activeVendor.value = vendors[0]?.key || '';
  }
});
watch(
  [outputMode, targets, strategy, basicValues, vendorValues],
  () => {
    showAllErrors.value = false;
  },
  { deep: true },
);
</script>

<style scoped>
.push-generator {
  width: 100%;
}

.push-generator__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.push-generator__header h2 {
  margin: 0 0 6px;
  color: var(--arco-color-text-1);
  font-size: 20px;
}

.push-generator__header p,
.push-section__heading p {
  margin: 0;
  color: var(--arco-color-text-3);
  font-size: 13px;
  line-height: 1.5;
}

.push-generator__links {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 13px;
}

.push-generator__alert {
  margin-bottom: 16px;
}

.push-generator__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(340px, 0.8fr);
  gap: 16px;
  align-items: start;
}

.push-generator__editor {
  min-width: 0;
}

.push-section {
  margin-bottom: 16px;
}

.push-section__heading {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 18px;
}

.push-section__heading h3,
.push-preview__heading h3 {
  margin: 0 0 4px;
  color: var(--arco-color-text-1);
  font-size: 16px;
}

.push-section__step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  border-radius: 50%;
  background: rgb(var(--primary-6));
  color: #fff;
  font-size: 13px;
}

.output-mode {
  margin-bottom: 18px;
}

.target-field {
  margin-bottom: 16px;
}

.target-field label {
  display: block;
  margin-bottom: 6px;
  color: var(--arco-color-text-1);
  font-size: 14px;
  font-weight: 500;
}

.target-field label span {
  color: var(--arco-color-danger, #f53f3f);
}

.target-field :deep(.arco-input-tag),
.target-field :deep(.arco-select) {
  width: 100%;
}

.field-help {
  margin-top: 5px;
  color: var(--arco-color-text-3);
  font-size: 12px;
}

.field-error {
  margin-top: 5px;
  color: var(--arco-color-danger, #f53f3f);
  font-size: 12px;
}

.endpoint-hint {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px 12px;
  border-radius: 4px;
  background: var(--arco-color-fill-2);
  overflow-wrap: anywhere;
}

.endpoint-hint code {
  color: var(--arco-color-text-2);
  font-size: 11px;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field-grid__wide {
  grid-column: 1 / -1;
}

.advanced-toggle {
  margin-top: 10px;
  padding-inline: 0;
}

.advanced-fields {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--arco-color-border-2);
}

.advanced-group + .advanced-group {
  margin-top: 20px;
}

.advanced-group h4 {
  margin: 0 0 12px;
  color: var(--arco-color-text-2);
  font-size: 13px;
}

.vendor-heading {
  justify-content: space-between;
}

.vendor-heading__title {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.vendor-select {
  width: 190px;
  flex-shrink: 0;
}

.vendor-toolbar {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  border-bottom: 1px solid var(--arco-color-border-2);
}

.vendor-toolbar :deep(.arco-tabs) {
  min-width: 0;
  flex: 1;
}

.vendor-panel {
  padding-top: 16px;
}

.vendor-panel__meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  color: var(--arco-color-text-3);
  font-size: 12px;
}

.vendor-panel__meta code {
  flex-shrink: 0;
}

.vendor-panel__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.push-preview {
  min-width: 0;
}

.push-preview__sticky {
  position: sticky;
  top: 16px;
  padding: 16px;
  border: 1px solid var(--arco-color-border-2);
  border-radius: 6px;
  background: var(--arco-color-bg-1);
}

.push-preview__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.push-preview__heading span {
  color: var(--arco-color-text-3);
  font-size: 12px;
}

.push-preview__errors,
.push-preview__warnings {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 12px;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
}

.push-preview__errors {
  background: var(--arco-color-danger-light-1, #fff2f0);
  color: var(--arco-color-danger, #f53f3f);
}

.push-preview__warnings {
  background: var(--arco-color-warning-light-1, #fff7e8);
  color: var(--arco-color-warning, #ff7d00);
}

.push-preview__json {
  display: block;
  width: 100%;
  min-height: 460px;
  height: 62vh;
  box-sizing: border-box;
  padding: 12px;
  resize: vertical;
  border: 1px solid var(--arco-color-border-2);
  border-radius: 4px;
  outline: none;
  background: var(--arco-color-fill-1);
  color: var(--arco-color-text-1);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.55;
}

.push-preview__json:focus {
  border-color: rgb(var(--primary-6));
}

.push-preview__footnote {
  margin-top: 8px;
  color: var(--arco-color-text-3);
  font-size: 11px;
}

@media (max-width: 1100px) {
  .push-generator__layout {
    grid-template-columns: 1fr;
  }

  .push-preview__sticky {
    position: static;
  }

  .push-preview__json {
    height: 480px;
    min-height: 320px;
  }
}

@media (max-width: 640px) {
  .push-generator__header,
  .vendor-heading,
  .vendor-panel__meta {
    flex-direction: column;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .field-grid__wide {
    grid-column: auto;
  }

  .vendor-select {
    width: 100%;
  }

  .output-mode {
    display: flex;
  }

  .output-mode :deep(.arco-radio-button) {
    flex: 1;
    text-align: center;
  }

  .push-preview__heading {
    align-items: flex-end;
  }
}
</style>
