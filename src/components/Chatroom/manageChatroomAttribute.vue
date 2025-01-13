<script setup lang="ts">
import { EasemobChat } from 'easemob-websdk';
import { EMClient } from '@/EaseIM';
import { Message } from '@arco-design/web-vue';
import { outConsoleLog } from '@/utils/consoleOutput';

interface ChatroomAttributeForm {
  chatroomId: string;
  chatroomName?: string;
  chatroomDescription?: string;
  chatroomAnnouncement?: string;
  chatroomMaxusers?: number;
  chatroomAttributeKeys?: string[];
  chatroomAttributeValue?: string;
  chatroomAutoDelete?: boolean;
  chatroomIsForced?: boolean;
}
const chatroomAttributeForm = reactive<ChatroomAttributeForm>({
  chatroomId: '',
  chatroomName: '',
  chatroomDescription: '',
  chatroomAnnouncement: '',
  chatroomMaxusers: 2000,
  chatroomAttributeKeys: [],
  chatroomAttributeValue: '',
  chatroomAutoDelete: false,
  chatroomIsForced: false,
});
//为方便聊天室的信息回显，这里需要一个函数来获取聊天室的信息
const getChatroomInfo = async () => {
  if (!chatroomAttributeForm.chatroomId) {
    Message.error('聊天室ID不能为空');
    return;
  }
  try {
    const res = await EMClient.getChatRoomDetails({
      chatRoomId: chatroomAttributeForm.chatroomId,
    });
    outConsoleLog('聊天室回显详情获取成功', res.data);
    Message.success('聊天室回显详情获取成功');
    if (res?.data?.length === 0) {
      Message.error('聊天室不存在');
      return;
    }
    if (res.data) {
      const chatRoomDetail = res?.data[0];
      chatroomAttributeForm.chatroomName = chatRoomDetail.name;
      chatroomAttributeForm.chatroomDescription = chatRoomDetail.description;
      chatroomAttributeForm.chatroomMaxusers = chatRoomDetail.maxusers;
    }
  } catch (error) {
    outConsoleLog('获取聊天室详情失败', error, 'error');
    Message.error('获取聊天室详情失败');
  }
};
const updateChatroomInfo = async () => {
  if (!chatroomAttributeForm.chatroomId) {
    Message.error('聊天室ID不能为空');
    return;
  }
  interface IUpdateChatroomInfo {
    chatRoomId: string;
    chatRoomName: string;
    description: string;
    maxusers: number;
  }
  const options: IUpdateChatroomInfo = {
    chatRoomId: chatroomAttributeForm.chatroomId,
    chatRoomName: chatroomAttributeForm.chatroomName || '',
    description: chatroomAttributeForm.chatroomDescription || '',
    maxusers: chatroomAttributeForm.chatroomMaxusers || 2000,
  };
  try {
    const res = await EMClient.modifyChatRoom(options);
    outConsoleLog('更新聊天室详情成功', res.data);
    Message.success('更新聊天室详情成功');
  } catch (error) {
    outConsoleLog('更新聊天室详情失败', error, 'error');
    Message.error('更新聊天室详情失败');
  }
};
const getChatroomAnnouncement = async () => {
  if (!chatroomAttributeForm.chatroomId) {
    Message.error('聊天室ID不能为空');
    return;
  }
  try {
    const res = await EMClient.fetchChatRoomAnnouncement({
      roomId: chatroomAttributeForm.chatroomId,
    });
    outConsoleLog('获取聊天室公告成功', res.data);
    Message.success('获取聊天室公告成功');
  } catch (error) {
    outConsoleLog('获取聊天室公告失败', error, 'error');
    Message.error('获取聊天室公告失败');
  }
};
const updateChatroomAnnouncement = async () => {
  if (!chatroomAttributeForm.chatroomId) {
    Message.error('聊天室ID不能为空');
    return;
  }
  if (!chatroomAttributeForm.chatroomAnnouncement) {
    Message.error('聊天室公告不能为空');
    return;
  }
  try {
    const res = await EMClient.updateChatRoomAnnouncement({
      roomId: chatroomAttributeForm.chatroomId,
      announcement: chatroomAttributeForm.chatroomAnnouncement,
      success(res) {
        outConsoleLog('更新聊天室公告成功', res.data);
      },
      error(res) {
        outConsoleLog('更新聊天室公告失败', res.data);
      },
    });
    outConsoleLog('更新聊天室公告成功', res.data);
    Message.success('更新聊天室公告成功');
  } catch (error) {
    outConsoleLog('更新聊天室公告失败', error, 'error');
    Message.error('更新聊天室公告失败');
  }
};
</script>
<template>
  <a-form :model="chatroomAttributeForm">
    <a-form-item label="聊天室ID" required>
      <a-input
        v-model="chatroomAttributeForm.chatroomId"
        @blur="getChatroomInfo"
        placeholder="请输入聊天室ID"
      />
    </a-form-item>
    <a-form-item label="聊天室名称" required>
      <a-input
        v-model="chatroomAttributeForm.chatroomName"
        placeholder="请输入聊天室名称"
      />
    </a-form-item>
    <a-form-item label="聊天室描述" required>
      <a-input
        v-model="chatroomAttributeForm.chatroomDescription"
        placeholder="请输入聊天室描述"
      />
    </a-form-item>
    <a-form-item label="聊天室公告">
      <a-input
        v-model="chatroomAttributeForm.chatroomAnnouncement"
        placeholder="请输入聊天室公告"
      />
    </a-form-item>
    <a-form-item label="聊天室最大成员数" required>
      <a-input-number
        v-model="chatroomAttributeForm.chatroomMaxusers"
        :min="2"
      />
    </a-form-item>
    <a-form-item label="聊天室属性键">
      <a-input-tag
        v-model="chatroomAttributeForm.chatroomAttributeKeys"
        placeholder="请输入聊天室属性键"
        :max-tag-count="5"
        allow-clear
        size="small"
      />
      <template #extra>
        <div>聊天室属性键组成的数组，不包含自己的用户 ID，回车键可输入多个</div>
      </template>
    </a-form-item>
    <a-form-item label="聊天室属性值">
      <a-input
        v-model="chatroomAttributeForm.chatroomAttributeValue"
        placeholder="请输入聊天室属性值"
      />
    </a-form-item>
    <a-form-item label="聊天室自动删除">
      <a-switch v-model="chatroomAttributeForm.chatroomAutoDelete" />
    </a-form-item>
    <a-form-item label="聊天室强制加入">
      <a-switch v-model="chatroomAttributeForm.chatroomIsForced" />
    </a-form-item>
    <a-form laebl="聊天室基本属性操作">
      <a-form-item>
        <a-space :size="'medium'" wrap>
          <a-tooltip
            content="仅聊天室所有者和管理员可以调用 modifyChatRoom 修改聊天室名称、描述和最大成员数量。"
          >
            <a-button type="primary" @click="updateChatroomInfo">
              更新聊天室详情
            </a-button>
          </a-tooltip>
          <a-tooltip
            content="仅聊天室所有者和管理员可以调用 setChatRoomAttribute 设置聊天室属性。"
          >
            <a-button type="primary" @click="getChatroomAnnouncement">
              获取聊天室公告
            </a-button>
          </a-tooltip>
          <a-tooltip
            content="仅聊天室所有者和管理员可以调用 setChatRoomAttribute 设置聊天室属性。"
          >
            <a-button type="primary" @click="updateChatroomAnnouncement">
              更新聊天室公告
            </a-button>
          </a-tooltip>
        </a-space>
      </a-form-item>
    </a-form>
  </a-form>
</template>

<style scoped></style>
