<script setup lang="ts">
import ContactsRelations from './contactsRelations.vue';
import ContactsAttributes from './contactsAttirbutes.vue';
import OnlienStatusSub from './onlineStatusSub.vue';
</script>
<template>
  <div class="w-11/12">
    <a-collapse :default-active-key="[1]" accordion :bordered="false">
      <a-collapse-item header="用户关系" :key="1">
        <contacts-relations />
      </a-collapse-item>
      <a-collapse-item header="用户属性" :key="2">
        <contacts-attributes />
      </a-collapse-item>
      <a-collapse-item header="在线状态订阅" :key="3">
        <onlien-status-sub />
      </a-collapse-item>
    </a-collapse>
  </div>
</template>

<style scoped></style>
