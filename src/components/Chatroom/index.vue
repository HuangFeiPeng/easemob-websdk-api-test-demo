<script setup lang="ts">
import ManageChatroom from './manageChatroom.vue';
import ManageChatroomMember from './mangeChatroomMember.vue';
import ManageChatroomAttribute from './manageChatroomAttribute.vue';
import ChatroomsMessageListOpt from './ChatroomMessageListOpt.vue';
</script>
<template>
  <div class="w-11/12">
    <a-collapse :default-active-key="[1]" accordion :bordered="false">
      <a-collapse-item header="创建和管理聊天室" :key="1">
        <ManageChatroom />
      </a-collapse-item>
      <a-collapse-item header="管理聊天室成员" :key="2">
        <ManageChatroomMember />
      </a-collapse-item>
      <a-collapse-item header="管理聊天室属性" :key="3">
        <ManageChatroomAttribute />
      </a-collapse-item>
      <a-collapse-item header="聊天室消息优化示例效果" :key="4">
        <ChatroomsMessageListOpt />
      </a-collapse-item>
    </a-collapse>
  </div>
</template>

<style scoped></style>
