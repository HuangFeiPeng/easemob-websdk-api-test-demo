<template>
  <div class="optimization-strategy">
    <h3>聊天室消息渲染优化策略</h3>
    <ol class="strategy-list">
      <li>
        <span class="strategy-title" style="color: #2c3e50; font-weight: bold"
          >批量更新机制</span
        >
        <ul class="sub-list">
          <li>300ms间隔批量处理消息</li>
          <li>保留最新30条消息自动截断</li>
          <li>splice操作保持数组引用不变</li>
        </ul>
      </li>

      <li>
        <span class="strategy-title" style="color: #2c3e50; font-weight: bold"
          >智能更新触发</span
        >
        <ul class="sub-list">
          <li>300ms内新消息立即更新</li>
          <li>高频消息(>1条/100ms)启用防抖</li>
          <li>时间窗合并处理连续消息</li>
        </ul>
      </li>

      <li>
        <span class="strategy-title" style="color: #2c3e50; font-weight: bold"
          >渲染性能优化</span
        >
        <ul class="sub-list">
          <li>CSS硬件加速(will-change)</li>
          <li>复合动画属性(transform+opacity)</li>
          <li>滚动容器反向布局(<code>flex-direction: column-reverse</code>)</li>
        </ul>
      </li>

      <li>
        <span class="strategy-title" style="color: #2c3e50; font-weight: bold"
          >视觉平滑处理</span
        >
        <ul class="sub-list">
          <li>入场动画(0.8s缓动过渡)</li>
          <li>防跳帧Y轴位移动画(40px→0)</li>
          <li>滚动锚定底部自动跟踪</li>
        </ul>
      </li>

      <li>
        <span class="strategy-title" style="color: #2c3e50; font-weight: bold"
          >内存优化</span
        >
        <ul class="sub-list">
          <li>严格消息数量限制</li>
          <li>定时清理历史消息</li>
          <li>防抖定时器自动回收</li>
        </ul>
      </li>
    </ol>
  </div>
  <div class="message_list_container">
    <transition-group name="message-fade" tag="div">
      <div
        v-for="message in messagesList"
        :key="message.id"
        class="message-item"
      >
        {{ message.msg }}
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { EasemobChat } from 'easemob-websdk';
import { EMClient } from '@/EaseIM';
const BATCH_DELAY = 300; // 从 1500ms 调整为 300ms
const DEBOUNCE_DELAY = 100; // 新增防抖延迟
const MAX_MESSAGES_LIST = 30;
const messagesList = ref<EasemobChat.TextMsgBody[]>([]);
let debounceTimer: NodeJS.Timeout | null = null;
const mountMessagesListener = () => {
  EMClient.addEventHandler('CHAT_ROOM_MESSAGES', {
    onTextMessage: (message) => {
      handleMessage(message);
    },
  });
};
mountMessagesListener();
const batchUpdate = () => {
  if (messagesList.value.length > MAX_MESSAGES_LIST) {
    // 使用 splice 保持数组引用不变
    messagesList.value.splice(0, messagesList.value.length - MAX_MESSAGES_LIST);
  }
  debounceTimer = null;
};

let lastUpdate = 0;
const NORMAL_UPDATE_INTERVAL = 300; // 正常更新间隔阈值

const handleMessage = (msg: EasemobChat.TextMsgBody) => {
  const now = Date.now();

  if (now - lastUpdate > NORMAL_UPDATE_INTERVAL) {
    // 超过间隔阈值时立即更新
    messagesList.value.push(msg);
    if (!debounceTimer) {
      debounceTimer = setTimeout(batchUpdate, BATCH_DELAY);
    }
    lastUpdate = now;
  } else {
    // 短时间内频繁触发时启用防抖
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      messagesList.value.push(msg);
      debounceTimer = setTimeout(batchUpdate, BATCH_DELAY);
      lastUpdate = Date.now();
    }, DEBOUNCE_DELAY);
  }
};
</script>

<style scoped>
/* 优化过渡动画 */
.message-fade-enter-active {
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity; /* 启用硬件加速 */
}
.message-fade-enter-from {
  opacity: 0;
  transform: translateY(40px);
}
.message_list_container {
  height: 200px;
  width: 100%;
  /* 新增以下样式实现底部推送效果 */
  display: flex;
  flex-direction: column-reverse; /* 反转主轴方向 */
  overflow-y: auto; /* 启用垂直滚动 */
}
/* 新增过渡动画 */
.message-fade-enter-active {
  transition: all 0.5s ease;
}
.message-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.message-item {
  /* 新增弹幕气泡样式 */
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 8px 12px;
  border-radius: 15px;
  margin: 4px 0;
  max-width: 80%;
  animation: float-up 0.8s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  position: relative;
}

@keyframes float-up {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 调整原有过渡效果 */
.message-fade-enter-active {
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
</style>
