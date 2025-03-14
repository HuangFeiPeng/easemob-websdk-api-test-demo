<script setup lang="ts">
import { EasemobChat } from 'easemob-websdk';
import { EMClient } from '@/EaseIM';
import { Message } from '@arco-design/web-vue';
import { outConsoleLog } from '@/utils/consoleOutput';
interface IManageChatroomForm {
  chatroomId: string;
  chatroomExt?: string;
  leaveOtherChatrooms?: boolean;
  pageSize?: number;
  pageNum?: number;
}
interface ICreateChatroomForm {
  chatroomName: string;
  chatroomDescription: string;
  chatroomMaxuser: number;
  chatroomMembers?: string[];
}
const manageChatroomForm = reactive<IManageChatroomForm>({
  chatroomId: '',
  chatroomExt: '',
  leaveOtherChatrooms: false,
  pageSize: 20,
  pageNum: 1,
});
const createChatroomForm = reactive<ICreateChatroomForm>({
  chatroomName: '',
  chatroomDescription: '',
  chatroomMaxuser: 200,
  chatroomMembers: [],
});
const createChatroomModalVisible = ref(false);
const createNewChatroom = async () => {
  if (
    !createChatroomForm.chatroomName ||
    !createChatroomForm.chatroomDescription
  ) {
    Message.error('聊天室名称和聊天室描述不能为空');
    return;
  }
  const options = {
    name: createChatroomForm.chatroomName,
    description: createChatroomForm.chatroomDescription,
    maxusers: createChatroomForm.chatroomMaxuser,
    members: createChatroomForm.chatroomMembers,
    token: EMClient.context.accessToken,
  };
  try {
    const res = await EMClient.createChatRoom(options);
    outConsoleLog('创建聊天室成功', res.data);
    Message.success('创建聊天室成功');
  } catch (error) {
    outConsoleLog('创建聊天室失败', error, 'error');
    Message.error('创建聊天室失败');
  } finally {
    createChatroomForm.chatroomName = '';
    createChatroomForm.chatroomDescription = '';
    createChatroomForm.chatroomMembers = [];
  }
};
const getJoinedChatrooms = async () => {
  try {
    const res = await EMClient.getJoinedChatRooms({
      pageSize: manageChatroomForm.pageSize as number,
      pageNum: manageChatroomForm.pageNum as number,
    });
    outConsoleLog('获取加入的聊天室列表成功', res.data);
    Message.success('获取加入的聊天室列表成功');
  } catch (error) {
    outConsoleLog('获取加入的聊天室列表失败', error, 'error');
    Message.error('获取加入的聊天室列表失败');
  }
};
const getChatroomInfo = async () => {
  if (!manageChatroomForm.chatroomId) {
    Message.error('请输入聊天室ID');
    return;
  }
  try {
    const res = await EMClient.getChatRoomDetails({
      chatRoomId: manageChatroomForm.chatroomId,
    });
    outConsoleLog('获取聊天室详情信息成功', res.data);
    Message.success('获取聊天室详情信息成功');
  } catch (error) {
    outConsoleLog('获取聊天室详情信息失败', error, 'error');
    Message.error('获取聊天室详情信息失败');
  }
};
const joinChatroom = async () => {
  if (!manageChatroomForm.chatroomId) {
    Message.error('请输入聊天室ID');
    return;
  }
  try {
    const res = await EMClient.joinChatRoom({
      roomId: manageChatroomForm.chatroomId,
      ext: manageChatroomForm.chatroomExt,
      leaveOtherRooms: manageChatroomForm.leaveOtherChatrooms,
    });
    outConsoleLog('加入聊天室成功', res);
    Message.success('加入聊天室成功');
  } catch (error) {
    outConsoleLog('加入聊天室失败', error, 'error');
    Message.error('加入聊天室失败');
  }
};
const leaveChatroom = async () => {
  if (!manageChatroomForm.chatroomId) {
    Message.error('请输入聊天室ID');
    return;
  }
  try {
    const res = await EMClient.leaveChatRoom({
      roomId: manageChatroomForm.chatroomId,
    });
    outConsoleLog('退出聊天室成功', res);
  } catch (error) {
    outConsoleLog('退出聊天室失败', error, 'error');
    Message.error('退出聊天室失败');
  }
};
const destoryChatroom = async () => {
  if (!manageChatroomForm.chatroomId) {
    Message.error('请输入聊天室ID');
    return;
  }
  try {
    const res = await EMClient.destroyChatRoom({
      chatRoomId: manageChatroomForm.chatroomId,
      token: EMClient.context.accessToken,
    });
    outConsoleLog('聊天室销毁成功', res);
    Message.success('聊天室销毁成功');
  } catch (error) {
    outConsoleLog('聊天室销毁失败', error, 'error');
    Message.error('聊天室销毁失败');
  }
};
</script>
<template>
  <a-form :model="manageChatroomForm">
    <a-form-item label="聊天室ID">
      <a-input
        v-model="manageChatroomForm.chatroomId"
        placeholder="请输入聊天室ID"
      />
    </a-form-item>
    <a-form-item label="聊天室扩展信息">
      <a-input
        v-model="manageChatroomForm.chatroomExt"
        placeholder="请输入聊天室扩展信息"
      />
      <template #extra>
        <div>加入聊天室时携带的扩展信息，不填默认为空字符串</div>
      </template>
    </a-form-item>
    <a-form-item label="离开其他聊天室">
      <a-switch v-model="manageChatroomForm.leaveOtherChatrooms" />
      <template #extra>
        <div>加入聊天室时，是否离开已加入的其他聊天室</div>
      </template>
    </a-form-item>
    <a-form-item label="聊天室分页参数">
      <a-space :size="'medium'" wrap>
        <a-tooltip content="pageNum">
          <a-input-number
            v-model="manageChatroomForm.pageNum"
            :min="0"
            :max="100"
          />
        </a-tooltip>
        <a-tooltip content="pageSize">
          <a-input-number
            v-model="manageChatroomForm.pageSize"
            :min="1"
            :max="100"
          />
        </a-tooltip>
      </a-space>
    </a-form-item>
    <a-form-item label="创建聊天室">
      <a-button type="primary" @click="createChatroomModalVisible = true"
        >创建聊天室</a-button
      >
    </a-form-item>
    <a-form-item label="聊天室操作">
      <a-space :size="'medium'" wrap>
        <a-button type="primary" @click="getJoinedChatrooms">
          获取加入的聊天室列表
        </a-button>
        <a-button type="primary" @click="getChatroomInfo">
          获取聊天室详情信息
        </a-button>
        <a-button type="primary" @click="joinChatroom">加入聊天室</a-button>
        <a-button type="primary" status="danger" @click="leaveChatroom"
          >退出聊天室</a-button
        >
        <a-button type="primary" status="danger" @click="destoryChatroom"
          >解散聊天室</a-button
        >
      </a-space>
    </a-form-item>
  </a-form>
  <!-- 创建聊天室 -->
  <a-modal
    v-model:visible="createChatroomModalVisible"
    title="创建聊天室"
    :width="800"
    @ok="createNewChatroom"
    @cancel="createChatroomModalVisible = false"
  >
    <a-form :model="createChatroomForm">
      <a-form-item label="聊天室名称" required>
        <a-input
          v-model="createChatroomForm.chatroomName"
          placeholder="请输入聊天室名称"
        />
      </a-form-item>
      <a-form-item label="聊天室描述" required>
        <a-input
          v-model="createChatroomForm.chatroomDescription"
          placeholder="请输入聊天室描述"
        />
      </a-form-item>
      <a-form-item label="聊天室最大成员数">
        <a-input-number
          v-model="createChatroomForm.chatroomMaxuser"
          :min="2"
          :max="5000"
        />
      </a-form-item>
      <a-form-item label="聊天室成员">
        <a-input-tag
          v-model="createChatroomForm.chatroomMembers"
          placeholder="请输入聊天室成员"
          :max-tag-count="5"
          allow-clear
          size="small"
        />
        <template #extra>
          <div>聊天室成员，不填默认为空数组，输入后回车键入所需内容。</div>
        </template>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<style scoped></style>
