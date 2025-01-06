<script setup lang="ts">
import ManageGroup from './manageGroup.vue';
</script>
<template>
  <div class="w-11/12">
    <a-collapse :default-active-key="[1]" accordion :bordered="false">
      <a-collapse-item header="群组创建与管理" :key="1">
        <manage-group />
      </a-collapse-item>
      <a-collapse-item header="管理群组成员" :key="2"></a-collapse-item>
      <a-collapse-item header="管理群组属性" :key="3"></a-collapse-item>
      <a-collapse-item header="管理子区" :key="4"></a-collapse-item>
      <a-collapse-item header="管理子区消息" :key="5"></a-collapse-item>
    </a-collapse>
  </div>
</template>
