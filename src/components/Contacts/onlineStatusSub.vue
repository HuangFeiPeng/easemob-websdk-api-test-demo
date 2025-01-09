<script setup lang="ts">
import { EasemobChat } from 'easemob-websdk';
import { EMClient } from '@/EaseIM';
import { Message } from '@arco-design/web-vue';
import { outConsoleLog } from '@/utils/consoleOutput';

interface IOnlineStatusSubForm {
  userIds: string[];
  description?: string;
  pageNum?: number;
  pageSize?: number;
}
const onlineStatusSubForm = reactive<IOnlineStatusSubForm>({
  userIds: [],
  description: '',
  pageNum: 0,
  pageSize: 20,
});
const subscribeUserOnlineStatus = async () => {
  if (!onlineStatusSubForm.userIds.length) {
    Message.warning('请输入用户ID');
    return;
  }
  try {
    const res = await EMClient.subscribePresence({
      usernames: onlineStatusSubForm.userIds,
      expiry: 7 * 24 * 3600, // 单位为秒
    });
    outConsoleLog('订阅指定用户的在线状态成功', res.data?.result);
    Message.success('订阅指定用户的在线状态成功');
  } catch (error) {
    outConsoleLog('订阅指定用户的在线状态失败', error, 'error');
    Message.error('订阅指定用户的在线状态失败');
  }
};
const publishCustomOnlineStatus = async () => {
  if (!onlineStatusSubForm.description) {
    Message.warning('请输入自定义在线状态');
    return;
  }
  try {
    await EMClient.publishPresence({
      description: onlineStatusSubForm.description,
    });
    outConsoleLog('发布自定义在线状态成功');
    Message.success('发布自定义在线状态成功');
  } catch (error) {
    outConsoleLog('发布自定义在线状态失败', error, 'error');
    Message.error('发布自定义在线状态失败');
  }
};
const unsubscribeUserOnlineStatus = async () => {
  if (!onlineStatusSubForm.userIds.length) {
    Message.warning('请输入用户ID');
    return;
  }
  try {
    await EMClient.unsubscribePresence({
      usernames: onlineStatusSubForm.userIds,
    });
    outConsoleLog('取消订阅指定用户的在线状态成功');
    Message.success('取消订阅指定用户的在线状态成功');
  } catch (error) {
    outConsoleLog('取消订阅指定用户的在线状态失败', error, 'error');
    Message.error('取消订阅指定用户的在线状态失败');
  }
};
const querySubscribedUserList = async () => {
  try {
    const res = await EMClient.getSubscribedPresencelist({
      pageNum: onlineStatusSubForm.pageNum as number,
      pageSize: onlineStatusSubForm.pageSize as number,
    });
    outConsoleLog('查询被订阅用户列表成功', res.data?.result);
    Message.success('查询被订阅用户列表成功');
  } catch (error) {
    outConsoleLog('查询被订阅用户列表失败', error, 'error');
    Message.error('查询被订阅用户列表失败');
  }
};
const getUserCurrentOnlineStatus = async () => {
  if (!onlineStatusSubForm.userIds.length) {
    Message.warning('请输入用户ID');
    return;
  }
  try {
    const res = await EMClient.getPresenceStatus({
      usernames: onlineStatusSubForm.userIds,
    });
    outConsoleLog('获取用户的当前在线状态成功', res.data?.result);
    Message.success('获取用户的当前在线状态成功');
  } catch (error) {
    outConsoleLog('获取用户的当前在线状态失败', error, 'error');
    Message.error('获取用户的当前在线状态失败');
  }
};
</script>

<template>
  <div>
    <a-form :model="onlineStatusSubForm">
      <a-form-item label="userIds">
        <a-input-tag
          v-model="onlineStatusSubForm.userIds"
          placeholder="请输入用户ID"
          :max-tag-count="5"
          allow-clear
          size="small"
        />
        <template #extra>
          <div>用户 ID 组成的数组，回车键可输入多个</div>
        </template>
      </a-form-item>
      <a-form-item label="自定义在线状态">
        <a-input
          v-model="onlineStatusSubForm.description"
          placeholder="请输入自定义在线状态"
        />
      </a-form-item>
      <a-form-item label="分页获取在线状态">
        <a-space :size="'medium'" wrap>
          <a-tooltip content="页码">
            <a-input-number v-model="onlineStatusSubForm.pageNum" :max="50" />
          </a-tooltip>
          <a-tooltip content="每页条数">
            <a-input-number v-model="onlineStatusSubForm.pageSize" :max="50" />
          </a-tooltip>
        </a-space>
      </a-form-item>
      <a-form-item label="在线状态操作">
        <a-space :size="'medium'" wrap>
          <a-button type="primary" @click="subscribeUserOnlineStatus">
            订阅指定用户的在线状态
          </a-button>
          <a-button type="primary" @click="publishCustomOnlineStatus">
            发布自定义在线状态
          </a-button>

          <a-button
            type="primary"
            status="danger"
            @click="unsubscribeUserOnlineStatus"
          >
            取消订阅指定用户的在线状态
          </a-button>
          <a-tooltip
            content="为方便用户管理订阅关系，SDK 提供 getSubscribedPresencelist 方法，可使用户分页查询自己订阅的用户列表。"
          >
            <a-button type="primary" @click="querySubscribedUserList">
              查询被订阅用户列表
            </a-button>
          </a-tooltip>
          <a-tooltip
            content="如果不关注用户的在线状态变更，你可以调用 getPresenceStatus 获取用户当前的在线状态，而无需订阅状态。"
          >
            <a-button type="primary" @click="getUserCurrentOnlineStatus">
              获取用户的当前在线状态
            </a-button>
          </a-tooltip>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped></style>
