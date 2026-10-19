<script setup lang="ts">
import { computed } from 'vue';
import { getSdkManifest, getSdkVersion, switchSdkVersion } from '@/sdk';

const manifest = getSdkManifest();
const currentVersion = getSdkVersion();

const versions = computed(() => manifest?.versions ?? []);
const currentEntry = computed(() =>
  versions.value.find((item) => item.version === currentVersion),
);

const options = computed(() =>
  versions.value.map((item) => ({
    value: item.version,
    label: item.channel === 'beta' ? `${item.version} (beta)` : item.version,
  })),
);

const tooltip = computed(() => {
  const parts = [`当前实际加载：easemob-websdk v${currentVersion}`];
  if (currentEntry.value?.channel === 'beta') parts.push('预发布版本');
  if (currentEntry.value?.aliasOf) {
    parts.push(`产物与 v${currentEntry.value.aliasOf} 完全一致`);
  }
  parts.push('切换后页面会自动重新加载');
  return parts.join('；');
});

const handleChange = (value: unknown) => {
  if (typeof value !== 'string' || value === currentVersion) return;
  switchSdkVersion(value);
};
</script>

<template>
  <div class="sdk-version-select" :title="tooltip">
    <span class="sdk-version-select__caption">SDK 版本</span>
    <a-select
      :model-value="currentVersion"
      :options="options"
      size="small"
      class="sdk-version-select__select"
      @change="handleChange"
    />
    <a-tag
      v-if="currentEntry?.channel === 'beta'"
      size="small"
      color="orange"
      class="sdk-version-select__tag"
    >
      beta
    </a-tag>
  </div>
</template>

<style scoped>
.sdk-version-select {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.sdk-version-select__caption {
  color: var(--arco-color-text-3);
  font-size: 12px;
  white-space: nowrap;
}

.sdk-version-select__select {
  width: 148px;
}

.sdk-version-select__tag {
  flex: none;
}

@media (max-width: 640px) {
  .sdk-version-select__caption,
  .sdk-version-select__tag {
    display: none;
  }

  .sdk-version-select__select {
    width: 118px;
  }
}
</style>
