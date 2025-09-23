<script setup lang="ts">
import { EasemobChat } from 'easemob-websdk';
import { EMClient } from '@/EaseIM';
import { Message } from '@arco-design/web-vue';
import { outConsoleLog } from '@/utils/consoleOutput';
interface IManageChatroomMemberForm {
  chatroomId: string;
  chatroomMembers?: string[];
  pageSize?: number;
  pageNum?: number;
  muteDuration?: number;
}
const manageChatroomMemberForm = reactive<IManageChatroomMemberForm>({
  chatroomId: '',
  chatroomMembers: [],
  pageSize: 20,
  pageNum: 1,
  muteDuration: -1000,
});
/* 聊天室基础操作 */
const getChatroomMembers = async () => {
  if (!manageChatroomMemberForm.chatroomId) {
    Message.error('请输出要获取的聊天室ID');
    return;
  }
  try {
    const res = await EMClient.listChatRoomMembers({
      chatRoomId: manageChatroomMemberForm.chatroomId,
      pageSize: manageChatroomMemberForm.pageSize as number,
      pageNum: manageChatroomMemberForm.pageNum as number,
    });
    outConsoleLog('获取聊天室成员列表成功', res.data);
    Message.success('获取聊天室成员列表成功');
  } catch (error) {
    outConsoleLog('获取聊天室成员列表失败', error, 'error');
    Message.error('获取聊天室成员列表失败');
  }
};
//离开聊天室
const leaveChatroom = async () => {
  if (!manageChatroomMemberForm.chatroomId) {
    Message.error('请输入聊天室ID');
    return;
  }
  try {
    const res = await EMClient.leaveChatRoom({
      roomId: manageChatroomMemberForm.chatroomId,
    });
    outConsoleLog('主动退出聊天室成功', res.data);
    Message.success('主动退出聊天室成功');
  } catch (error) {
    outConsoleLog('主动退出聊天室失败', error, 'error');
    Message.error('主动退出聊天室失败');
  }
};
const removeChatroomMembers = async () => {
  if (!manageChatroomMemberForm.chatroomId) {
    Message.error('请输入聊天室ID');
    return;
  }
  if (!manageChatroomMemberForm.chatroomMembers) {
    Message.error('请输入要移除的聊天室成员');
    return;
  }
  try {
    const res = await EMClient.removeChatRoomMembers({
      chatRoomId: manageChatroomMemberForm.chatroomId,
      users: manageChatroomMemberForm.chatroomMembers,
    });
    outConsoleLog('移除聊天室成员成功', res.data);
    Message.success('移除聊天室成员成功');
  } catch (error) {
    outConsoleLog('移除聊天室成员失败', error, 'error');
    Message.error('移除聊天室成员失败');
  }
};
/* 管理聊天室管理员 */
const addChatroomAdmin = async () => {
  if (!manageChatroomMemberForm.chatroomId) {
    Message.error('请输入聊天室ID');
    return;
  }
  if (!manageChatroomMemberForm.chatroomMembers?.length) {
    Message.error('请输入要添加的聊天室管理员');
    return;
  }
  const username = manageChatroomMemberForm.chatroomMembers[0];
  try {
    const res = await EMClient.setChatRoomAdmin({
      chatRoomId: manageChatroomMemberForm.chatroomId,
      username,
    });
    outConsoleLog('添加聊天室管理员成功', res.data);
    Message.success('添加聊天室管理员成功');
  } catch (error) {
    outConsoleLog('添加聊天室管理员失败', error, 'error');
    Message.error('添加聊天室管理员失败');
  }
};
const removeChatRoomAdmin = async () => {
  if (!manageChatroomMemberForm.chatroomId) {
    Message.error('请输入聊天室ID');
    return;
  }
  if (!manageChatroomMemberForm.chatroomMembers?.length) {
    Message.error('请输入要移除的聊天室管理员');
    return;
  }
  const username = manageChatroomMemberForm.chatroomMembers[0];
  try {
    const res = await EMClient.removeChatRoomAdmin({
      chatRoomId: manageChatroomMemberForm.chatroomId,
      username,
    });
    outConsoleLog('移除聊天室管理员成功', res.data);
    Message.success('移除聊天室管理员成功');
  } catch (error) {
    outConsoleLog('移除聊天室管理员失败', error, 'error');
    Message.error('移除聊天室管理员失败');
  }
};
/* 获取聊天室黑名单 */
const getChatRoomBlacklist = async () => {
  if (!manageChatroomMemberForm.chatroomId) {
    Message.error('请输入聊天室ID');
    return;
  }
  try {
    const res = await EMClient.getChatRoomBlocklist({
      chatRoomId: manageChatroomMemberForm.chatroomId,
    });
    outConsoleLog('获取聊天室黑名单成功', res.data);
    Message.success('获取聊天室黑名单成功');
  } catch (error) {
    outConsoleLog('获取聊天室黑名单失败', error, 'error');
    Message.error('获取聊天室黑名单失败');
  }
};
const addChatRoomBlacklist = async () => {
  if (!manageChatroomMemberForm.chatroomId) {
    Message.error('请输入聊天室ID');
    return;
  }
  if (!manageChatroomMemberForm.chatroomMembers?.length) {
    Message.error('请输入要添加的聊天室黑名单');
    return;
  }
  try {
    const res = await EMClient.blockChatRoomMembers({
      chatRoomId: manageChatroomMemberForm.chatroomId,
      usernames: manageChatroomMemberForm.chatroomMembers,
    });
    outConsoleLog('添加聊天室黑名单成功', res.data);
    Message.success('添加聊天室黑名单成功');
  } catch (error) {
    outConsoleLog('添加聊天室黑名单失败', error, 'error');
    Message.error('添加聊天室黑名单失败');
  }
};
const removeChatRoomBlacklist = async () => {
  if (!manageChatroomMemberForm.chatroomId) {
    Message.error('请输入聊天室ID');
    return;
  }
  if (!manageChatroomMemberForm.chatroomMembers?.length) {
    Message.error('请输入要移除的聊天室黑名单');
    return;
  }
  try {
    const res = await EMClient.unblockChatRoomMembers({
      chatRoomId: manageChatroomMemberForm.chatroomId,
      usernames: manageChatroomMemberForm.chatroomMembers,
    });
    outConsoleLog('移除聊天室黑名单成功', res.data);
    Message.success('移除聊天室黑名单成功');
  } catch (error) {
    outConsoleLog('移除聊天室黑名单失败', error, 'error');
    Message.error('移除聊天室黑名单失败');
  }
};
/* 管理禁言 */
const getChatRoomMuteList = async () => {
  if (!manageChatroomMemberForm.chatroomId) {
    Message.error('请输入聊天室ID');
    return;
  }
  try {
    const res = await EMClient.getChatRoomMutelist({
      chatRoomId: manageChatroomMemberForm.chatroomId,
    });
    outConsoleLog('获取聊天室禁言列表成功', res.data);
    Message.success('获取聊天室禁言列表成功');
  } catch (error) {
    outConsoleLog('获取聊天室禁言列表失败', error, 'error');
    Message.error('获取聊天室禁言列表失败');
  }
};
const getIsInChatroomMuteList = async () => {
  try {
    const res = await EMClient.isInChatRoomMutelist({
      chatRoomId: manageChatroomMemberForm.chatroomId
    })
    outConsoleLog('获取当前用户聊天室内禁言列表状态', res);
    Message.success('获取当前用户聊天室内禁言列表状态成功');
  } catch (error) {
    outConsoleLog('获取当前用户聊天室内禁言列表状态失败', error, 'error');
    Message.error('获取当前用户聊天室内禁言列表状态失败');
  }
}
const muteChatRoomMember = async () => {
  if (!manageChatroomMemberForm.chatroomId) {
    Message.error('请输入聊天室ID');
    return;
  }
  if (!manageChatroomMemberForm.chatroomMembers?.length) {
    Message.error('请输入要禁言的聊天室成员');
    return;
  }
  const username = manageChatroomMemberForm.chatroomMembers[0];
  try {
    const res = await EMClient.muteChatRoomMember({
      chatRoomId: manageChatroomMemberForm.chatroomId,
      username,
      muteDuration: -1000, // 禁言时长，单位为毫秒。若传 “-1,000” 表示永久禁言。,
    });
    outConsoleLog('禁言聊天室成员成功', res.data);
    Message.success('禁言聊天室成员成功');
  } catch (error) {
    outConsoleLog('禁言聊天室成员失败', error, 'error');
    Message.error('禁言聊天室成员失败');
  }
};
const unmuteChatRoomMember = async () => {
  if (!manageChatroomMemberForm.chatroomId) {
    Message.error('请输入聊天室ID');
    return;
  }
  if (!manageChatroomMemberForm.chatroomMembers?.length) {
    Message.error('请输入要解除禁言的聊天室成员');
    return;
  }
  const username = manageChatroomMemberForm.chatroomMembers[0];
  try {
    const res = await EMClient.unmuteChatRoomMember({
      chatRoomId: manageChatroomMemberForm.chatroomId,
      username,
    });
    outConsoleLog('解除聊天室成员禁言成功', res.data);
    Message.success('解除聊天室成员禁言成功');
  } catch (error) {
    outConsoleLog('解除聊天室成员禁言失败', error, 'error');
    Message.error('解除聊天室成员禁言失败');
  }
};
//全员禁言
const disableSendChatRoomMsg = async () => {
  if (!manageChatroomMemberForm.chatroomId) {
    Message.error('请输入聊天室ID');
    return;
  }
  try {
    const res = await EMClient.disableSendChatRoomMsg({
      chatRoomId: manageChatroomMemberForm.chatroomId,
    });
    outConsoleLog('开启聊天室全员禁言成功', res.data);
    Message.success('开启聊天室全员禁言成功');
  } catch (error) {
    outConsoleLog('开启聊天室全员禁言失败', error, 'error');
    Message.error('开启聊天室全员禁言失败');
  }
};
const enableSendChatRoomMsg = async () => {
  if (!manageChatroomMemberForm.chatroomId) {
    Message.error('请输入聊天室ID');
    return;
  }
  try {
    const res = await EMClient.enableSendChatRoomMsg({
      chatRoomId: manageChatroomMemberForm.chatroomId,
    });
    outConsoleLog('关闭聊天室全员禁言成功', res.data);
    Message.success('关闭聊天室全员禁言成功');
  } catch (error) {
    outConsoleLog('关闭聊天室全员禁言失败', error, 'error');
    Message.error('关闭聊天室全员禁言失败');
  }
};
/* 管理聊天室白名单 */
const getChatroomWhitelist = async () => {
  if (!manageChatroomMemberForm.chatroomId) {
    Message.error('请输入聊天室ID');
    return;
  }
  try {
    const res = await EMClient.getChatRoomAllowlist({
      chatRoomId: manageChatroomMemberForm.chatroomId,
      success(res) {
        console.log(res);
      },
      error(error) {
        console.log(error);
      },
    });
    outConsoleLog('获取聊天室白名单成功', res.data);
    Message.success('获取聊天室白名单成功');
  } catch (error) {
    outConsoleLog('获取聊天室白名单失败', error, 'error');
    Message.error('获取聊天室白名单失败');
  }
};
const addChatroomWhitelist = async () => {
  if (!manageChatroomMemberForm.chatroomId) {
    Message.error('请输入聊天室ID');
    return;
  }
  if (!manageChatroomMemberForm.chatroomMembers?.length) {
    Message.error('请输入要添加的聊天室白名单');
    return;
  }
  try {
    const res = await EMClient.addUsersToChatRoomAllowlist({
      chatRoomId: manageChatroomMemberForm.chatroomId,
      users: manageChatroomMemberForm.chatroomMembers,
    });
    outConsoleLog('添加聊天室白名单成功', res.data);
    Message.success('添加聊天室白名单成功');
  } catch (error) {
    outConsoleLog('添加聊天室白名单失败', error, 'error');
    Message.error('添加聊天室白名单失败');
  }
};
const removeChatroomWhitelist = async () => {
  if (!manageChatroomMemberForm.chatroomId) {
    Message.error('请输入聊天室ID');
    return;
  }
  if (!manageChatroomMemberForm.chatroomMembers?.length) {
    Message.error('请输入要移除的聊天室白名单');
    return;
  }
  const userName = manageChatroomMemberForm.chatroomMembers[0];
  try {
    const res = await EMClient.removeChatRoomAllowlistMember({
      chatRoomId: manageChatroomMemberForm.chatroomId,
      userName,
    });
    outConsoleLog('移除聊天室白名单成功', res.data);
    Message.success('移除聊天室白名单成功');
  } catch (error) {
    outConsoleLog('移除聊天室白名单失败', error, 'error');
    Message.error('移除聊天室白名单失败');
  }
};
const isInChatroomWhitelist = async () => {
  if (!manageChatroomMemberForm.chatroomId) {
    Message.error('请输入聊天室ID');
    return;
  }
  const userName = EMClient.context.userId;
  try {
    const res = await EMClient.isInChatRoomAllowlist({
      chatRoomId: manageChatroomMemberForm.chatroomId,
      userName,
    });
    outConsoleLog('检查当前用户是否在聊天室白名单中', res.data);
    if (res.data?.white) {
      Message.success('当前用户在聊天室白名单中');
    } else {
      Message.error('当前用户不在聊天室白名单中');
    }
  } catch (error) {
    outConsoleLog('检查当前用户是否在聊天室白名单中', error, 'error');
  }
};
</script>
<template>
  <a-form :model="manageChatroomMemberForm">
    <a-form-item label="聊天室ID" required>
      <a-input v-model="manageChatroomMemberForm.chatroomId" placeholder="请输入聊天室ID" />
    </a-form-item>
    <a-form-item label="聊天室成员">
      <a-input-tag v-model="manageChatroomMemberForm.chatroomMembers" placeholder="请输入聊天室成员" :max-tag-count="5"
        allow-clear size="small" />
      <template #extra>
        <div>聊天室成员组成的数组，回车键可输入多个</div>
      </template>
    </a-form-item>
    <a-form-item label="聊天室分页参数">
      <a-space :size="'medium'" wrap>
        <a-tooltip content="pageNum">
          <a-input-number v-model="manageChatroomMemberForm.pageNum" :min="0" :max="100" />
        </a-tooltip>
        <a-tooltip content="pageSize">
          <a-input-number v-model="manageChatroomMemberForm.pageSize" :min="1" :max="100" />
        </a-tooltip>
      </a-space>
    </a-form-item>
    <a-form-item label="聊天室基础操作">
      <a-space :size="'medium'" wrap>
        <a-button type="primary" @click="getChatroomMembers">获取聊天室成员列表</a-button>
        <a-button type="primary" @click="leaveChatroom">主动退出聊天室</a-button>
        <a-tooltip content="仅聊天室所有者和聊天室管理员可以调用 removeChatRoomMember 方法将指定的单个成员移出聊天室">
          <a-button type="primary" @click="removeChatroomMembers">移除聊天室成员</a-button>
        </a-tooltip>
      </a-space>
      <template #extra>
        <div>
          由于网络等原因，聊天室中的成员离线超过 2 分钟会自动退出聊天室。
        </div>
      </template>
    </a-form-item>
    <a-form-item label="管理聊天室管理员">
      <a-space :size="'medium'" wrap>
        <a-button type="primary" @click="addChatroomAdmin">添加聊天室管理员</a-button>
        <a-button type="primary" @click="removeChatRoomAdmin">移除聊天室管理员</a-button>
      </a-space>
    </a-form-item>
    <a-form-item label="管理聊天室黑名单">
      <a-space :size="'medium'" wrap>
        <a-button type="primary" @click="getChatRoomBlacklist">获取聊天室黑名单</a-button>
        <a-button type="primary" @click="addChatRoomBlacklist">添加聊天室黑名单</a-button>
        <a-button type="primary" @click="removeChatRoomBlacklist">移除聊天室黑名单</a-button>
      </a-space>
    </a-form-item>
    <a-form-item label="聊天室禁言时长">
      <a-tooltip content="单位为毫秒。若传 “-1,000” 表示永久禁言。">
        <a-input-number v-model="manageChatroomMemberForm.muteDuration" :min="-1000" :max="1000000000" />
      </a-tooltip>
      <template #extra>
        <div>
          聊天室所有者和管理员可以将指定聊天室成员添加或移出禁言列表，也可开启关闭全员禁言。全员禁言和单独的成员禁言不冲突，开启和关闭全员禁言，并不影响禁言列表。
        </div>
      </template>
    </a-form-item>
    <a-form-item label="管理聊天室禁言">
      <a-space :size="'medium'" wrap>
        <a-button type="primary" @click="getChatRoomMuteList">获取聊天室禁言列表</a-button>
        <a-button type="primary" @click="muteChatRoomMember">禁言聊天室成员</a-button>
        <a-button type="primary" @click="unmuteChatRoomMember">解除聊天室成员禁言</a-button>
        <a-button type="primary" @click="disableSendChatRoomMsg">开启聊天室全员禁言</a-button>
        <a-button type="primary" @click="enableSendChatRoomMsg">关闭聊天室全员禁言</a-button>
        <a-button type="primary" @click="getIsInChatroomMuteList">检查当前用户是否在聊天室禁言列表中</a-button>
      </a-space>
      <template #extra>
        <div>
          聊天室所有者可禁言聊天室所有成员，聊天室管理员可禁言聊天室普通成员。
        </div>
      </template>
    </a-form-item>
    <a-form-item label="管理聊天室白名单">
      <a-space :size="'medium'" wrap>
        <a-button type="primary" @click="getChatroomWhitelist">获取聊天室白名单</a-button>
        <a-tooltip content="仅可检查当前所登录的用户">
          <a-button type="primary" @click="isInChatroomWhitelist">检查当前用户是否在聊天室白名单中</a-button>
        </a-tooltip>
        <a-button type="primary" @click="addChatroomWhitelist">将成员加入聊天室白名单</a-button>
        <a-button type="primary" @click="removeChatroomWhitelist">将成员移出聊天室白名单</a-button>
      </a-space>
    </a-form-item>
  </a-form>
</template>

<style scoped></style>
