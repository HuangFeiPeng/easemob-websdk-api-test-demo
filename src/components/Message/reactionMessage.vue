<script setup lang="ts">
import { Message } from '@arco-design/web-vue';
import { EasemobChat } from 'easemob-websdk';
import { EMClient } from '@/EaseIM';
interface IReactionMessageForm {
  messageIds: string[];
  reaction: string;
  chatType: Exclude<EasemobChat.ChatType, 'chatRoom'>;
  cursor?: string;
  pageSize?: number;
}
const reactionMessageForm = reactive<IReactionMessageForm>({
  messageIds: [],
  reaction: '',
  chatType: 'singleChat',
  pageSize: 20,
});
const getReactionList = async () => {
  if (!reactionMessageForm.messageIds.length) {
    Message.error('请输入消息ID');
    return;
  }
  try {
    const res = await EMClient.getReactionlist({
      chatType: reactionMessageForm.chatType,
      messageId: reactionMessageForm.messageIds,
    });
    console.log('获取消息的 Reaction 列表', res?.data);
    Message.success('获取消息的 Reaction 列表成功');
  } catch (error) {
    console.log(error);
    Message.error('获取消息的 Reaction 列表失败');
  }
};
const getReactionDetail = async () => {
  if (!reactionMessageForm.messageIds.length || !reactionMessageForm.reaction) {
    Message.error('请输入消息ID以及reaction');
    return;
  }
  try {
    const res = await EMClient.getReactionDetail({
      messageId: reactionMessageForm.messageIds[0],
      reaction: reactionMessageForm.reaction,
      cursor: reactionMessageForm.cursor,
      pageSize: reactionMessageForm.pageSize,
    });
    console.log('获取 Reaction 详情', res?.data);
    Message.success('获取 Reaction 详情成功');
  } catch (error) {
    console.log(error);
    Message.error('获取 Reaction 详情失败');
  }
};
const addReaction = async () => {
  if (!reactionMessageForm.messageIds.length ||!reactionMessageForm.reaction) {
    Message.error('请输入消息ID以及reaction');
    return;
  }
  try {
    const res = await EMClient.addReaction({
      messageId: reactionMessageForm.messageIds[0],
      reaction: reactionMessageForm.reaction,
    });
    console.log('添加Reaction', res);
    Message.success('添加Reaction成功');
  } catch (error) {
    console.log(error);
    Message.error('添加Reaction失败');
  }
};
const deleteReaction = async () => {
  if (!reactionMessageForm.messageIds.length ||!reactionMessageForm.reaction) {
    Message.error('请输入消息ID以及reaction');
    return;
  }
  try {
    const res = await EMClient.deleteReaction({
      messageId: reactionMessageForm.messageIds[0],
      reaction: reactionMessageForm.reaction,
    });
    console.log('删除Reaction', res);
    Message.success('删除Reaction成功');
  } catch (error) {
    console.log(error);
    Message.error('删除Reaction失败');
  }
};
</script>
<template>
  <a-form :model="reactionMessageForm">
    <a-form-item tooltip="输入要追加Reaction的消息Id" label="messageId">
      <a-input-tag
        v-model="reactionMessageForm.messageIds"
        placeholder="请输入消息ID,并回车!"
        :max-tag-count="5"
        allow-clear
        size="small"
      />
    </a-form-item>
    <a-form-item tooltip="输入要在此消息上追加的表情回复内容" label="reaction">
      <a-input
        v-model="reactionMessageForm.reaction"
        placeholder="请输入Reaction"
      />
    </a-form-item>
    <a-form-item label="cursor">
      <a-input
        v-model="reactionMessageForm.cursor"
        placeholder="请输入cursor"
      />
    </a-form-item>
    <a-form-item label="pageSize">
      <a-input-number
        v-model="reactionMessageForm.pageSize"
        placeholder="请输入pageSize"
      />
    </a-form-item>
    <a-form-item label="聊天类型">
      <a-radio-group v-model="reactionMessageForm.chatType">
        <a-radio value="singleChat">单聊(singleChat)</a-radio>
        <a-radio value="groupChat">群聊(groupChat)</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="getReactionList"> 获取消息的 Reaction 列表 </a-button>
      <a-button class="ml-3 mr-3" type="primary" @click="getReactionDetail"> 获取 Reaction 详情 </a-button>
      <a-button class="ml-3 mr-3" type="primary" @click="addReaction"> 添加Reaction </a-button>
      <a-button class="ml-3 mr-3" type="primary" @click="deleteReaction"> 删除Reaction </a-button>
    </a-form-item>
  </a-form>
</template>
