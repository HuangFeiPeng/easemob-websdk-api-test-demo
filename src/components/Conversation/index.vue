<script setup lang="ts">
import { EasemobChat } from 'easemob-websdk';
import { Message } from '@arco-design/web-vue';
import { EMClient, WebSDK } from '@/EaseIM';
import { outConsoleLog } from '@/utils/consoleOutput';
// enum MarkType {
// 		mark_0,
// 		mark_1,
// 		mark_2,
// 		mark_3,
// 		mark_4,
// 		mark_5,
// 		mark_6,
// 		mark_7,
// 		mark_8,
// 		mark_9,
// 		mark_10,
// 		mark_11,
// 		mark_12,
// 		mark_13,
// 		mark_14,
// 		mark_15,
// 		mark_16,
// 		mark_17,
// 		mark_18,
// 		mark_19,
// 	}
interface IConversationForm {
  conversationId: string;
  pageSize?: number;
  cursor?: string;
  chatType: Exclude<EasemobChat.ChatType, 'chatRoom'>;
  deleteRoam?: boolean;
  conversationMark?: EasemobChat.MarkType;
}

const conversationForm = reactive<IConversationForm>({
  pageSize: 20,
  cursor: '',
  chatType: 'singleChat',
  deleteRoam: false,
  conversationId: '',
  conversationMark: 0,
});
const getConversationList = async () => {
  try {
    const res = await EMClient.getServerConversations({
      pageSize: conversationForm.pageSize,
      cursor: conversationForm.cursor,
    });
    outConsoleLog('获取会话列表', res.data);
    Message.success('获取会话列表成功');
  } catch (error) {
    outConsoleLog('获取会话列表失败', error, 'error');
    Message.error('获取会话列表失败');
  }
};
const deleteConversation = async () => {
  if (!conversationForm.conversationId) {
    Message.error('请输出要删除的会话ID');
    return;
  }
  try {
    const res = await EMClient.deleteConversation({
      channel: conversationForm.conversationId,
      chatType: conversationForm.chatType,
      deleteRoam: !!conversationForm.deleteRoam,
    });
    outConsoleLog('删除会话', res);
    Message.success('删除会话成功');
  } catch (error) {
    outConsoleLog('删除会话失败', error, 'error');
    Message.error('删除会话失败');
  }
};
const sendChannelAck = async () => {
  if (!conversationForm.conversationId) {
    Message.error('请输出要发送的会话ID');
    return;
  }
  const option: EasemobChat.CreateChannelMsgParameters = {
    type: 'channel',
    chatType: conversationForm.chatType,
    to: conversationForm.conversationId,
  };
  const msg = WebSDK.message.create(option);
  try {
    const res = await EMClient.send(msg);
    outConsoleLog('发送会话已读回执', res);
    Message.success('发送会话已读回执成功');
  } catch (error) {
    outConsoleLog('发送会话已读回执失败', error, 'error');
    Message.error('发送会话已读回执失败');
  }
};
/* 置顶会话操作 */
const pinConversation = async () => {
  if (!conversationForm.conversationId) {
    Message.error('请输出要置顶的会话ID');
    return;
  }
  try {
    const res = await EMClient.pinConversation({
      conversationId: conversationForm.conversationId,
      conversationType: conversationForm.chatType,
      isPinned: true,
    });
    outConsoleLog('置顶会话', res);
    Message.success('置顶会话成功');
  } catch (error) {
    outConsoleLog('置顶会话失败', error, 'error');
    Message.error('置顶会话失败');
  }
};
const unpinConversation = async () => {
  if (!conversationForm.conversationId) {
    Message.error('请输出要取消置顶的会话ID');
    return;
  }
  try {
    const res = await EMClient.pinConversation({
      conversationId: conversationForm.conversationId,
      conversationType: conversationForm.chatType,
      isPinned: false,
    });
    outConsoleLog('取消置顶会话', res);
    Message.success('取消置顶会话成功');
  } catch (error) {
    outConsoleLog('取消置顶会话失败', error, 'error');
    Message.error('取消置顶会话失败');
  }
};
const getConversationPinMessage = async () => {
  try {
    const res = await EMClient.getServerPinnedConversations({
      pageSize: conversationForm.pageSize,
      cursor: conversationForm.cursor,
    });
    outConsoleLog('获取服务端的置顶会话列表', res);
    Message.success('获取服务端的置顶会话列表成功');
  } catch (error) {
    outConsoleLog('获取服务端的置顶会话列表失败', error, 'error');
    Message.error('获取服务端的置顶会话列表失败');
  }
};
/* 会话标记操作 */
const addConversationMark = async () => {
  if (!conversationForm.conversationId) {
    Message.error('请输出要标记的会话ID');
    return;
  }
  try {
    const res = await EMClient.addConversationMark({
      // 实际可一次追加多个会话的标记，此处仅标记一个。
      conversations: [
        {
          conversationId: conversationForm.conversationId,
          conversationType: conversationForm.chatType,
        },
      ],
      mark: conversationForm.conversationMark as EasemobChat.MarkType,
    });
    outConsoleLog('标记会话', res);
    Message.success('标记会话成功');
  } catch (error) {
    outConsoleLog('标记会话失败', error, 'error');
    Message.error('标记会话失败');
  }
};
const removeConversationMark = async () => {
  if (!conversationForm.conversationId) {
    Message.error('请输出要取消标记的会话ID');
    return;
  }
  try {
    const res = await EMClient.removeConversationMark({
      // 实际可一次取消多个会话的标记，此处仅取消一个。
      conversations: [
        {
          conversationId: conversationForm.conversationId,
          conversationType: conversationForm.chatType,
        },
      ],
      mark: conversationForm.conversationMark as EasemobChat.MarkType,
    });
    outConsoleLog('取消标记会话', res);
    Message.success('取消标记会话成功');
  } catch (error) {
    outConsoleLog('取消标记会话失败', error, 'error');
    Message.error('取消标记会话失败');
  }
};
const getConversationListByMark = async () => {
  try {
    const res = await EMClient.getServerConversationsByFilter({
      pageSize: conversationForm.pageSize,
      cursor: conversationForm.cursor,
      filter: {
        mark: conversationForm.conversationMark as EasemobChat.MarkType,
      },
    });
    outConsoleLog('根据会话标记从服务器分页查询会话列表', res);
    Message.success('根据会话标记从服务器分页查询会话列表成功');
  } catch (error) {
    outConsoleLog('根据会话标记从服务器分页查询会话列表失败', error, 'error');
    Message.error('根据会话标记从服务器分页查询会话列表失败');
  }
};
</script>
<template>
  <div class="w-11/12">
    <a-form
      :model="conversationForm"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-item label="conversationId">
        <a-input v-model="conversationForm.conversationId" />
      </a-form-item>
      <a-form-item label="pageSize">
        <a-input-number
          v-model="conversationForm.pageSize"
          :min="1"
          :max="50"
        />
      </a-form-item>
      <a-form-item label="cursor">
        <a-input v-model="conversationForm.cursor" />
      </a-form-item>
      <a-form-item label="聊天类型">
        <a-radio-group v-model="conversationForm.chatType">
          <a-radio value="singleChat">单聊</a-radio>
          <a-radio value="groupChat">群聊</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="删除会话是否漫游消息">
        <a-switch v-model="conversationForm.deleteRoam" />
      </a-form-item>
      <a-form-item label="会话列表基础操作">
        <a-button type="primary" @click="getConversationList"
          >获取会话列表</a-button
        >
        <a-button class="ml-3" type="primary" @click="deleteConversation"
          >删除会话</a-button
        >
        <a-button class="ml-3" type="primary" @click="sendChannelAck"
          >发送会话已读回执</a-button
        >
      </a-form-item>
      <a-form-item label="置顶会话操作">
        <a-button type="primary" @click="pinConversation">置顶会话</a-button>
        <a-button class="ml-3" type="primary" @click="unpinConversation"
          >取消置顶</a-button
        >
        <a-button class="ml-3" type="primary" @click="getConversationPinMessage"
          >获取服务端的置顶会话列表</a-button
        >
      </a-form-item>
      <a-form-item label="会话标记操作">
        <a-button type="primary" @click="getConversationListByMark"
          >根据会话标记从服务器分页查询会话列表</a-button
        >
        <a-button class="ml-3" type="primary" @click="addConversationMark"
          >标记会话</a-button
        >
        <a-button class="ml-3" type="primary" @click="removeConversationMark"
          >取消标记会话</a-button
        >
      </a-form-item>
      <a-form-item label="会话标记值">
        <a-select
          v-model="conversationForm.conversationMark"
          :style="{ width: '360px' }"
          placeholder="Please select ..."
        >
          <a-option v-for="(item, index) in 20" :key="item" :value="index">{{
            index
          }}</a-option>
        </a-select>
      </a-form-item>
    </a-form>
    {{ conversationForm }}
  </div>
</template>
