<template>
  <div class="push-request-body-page">
    <PageHeader title="环信 WebSDK 推送请求体生成器">
      <template #extra>
        <a-button
          type="text"
          href="https://doc.easemob.com/push/push_send_notification.html"
          target="_blank"
          rel="noreferrer"
        >
          接口文档
        </a-button>
      </template>
    </PageHeader>
    <PushRequestBodyGenerator />
  </div>
</template>

<script setup lang="ts">
import PageHeader from '@/components/PageHeader/index.vue';
import PushRequestBodyGenerator from './components/PushRequestBodyGenerator.vue';
</script>

<style scoped>
.push-request-body-page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 16px 20px 24px;
  background: var(--arco-color-fill-1);
}

.push-request-body-page :deep(.push-generator) {
  max-width: 1680px;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .push-request-body-page {
    padding: 10px 8px 16px;
  }
}
</style>
