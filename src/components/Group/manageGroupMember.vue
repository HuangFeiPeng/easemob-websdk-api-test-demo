<script setup lang="ts">
import { EasemobChat } from 'easemob-websdk';
import { EMClient } from '@/EaseIM';
import { Message } from '@arco-design/web-vue';
import { outConsoleLog } from '@/utils/consoleOutput';
type TMockMemberAttributes = {
  key: string;
  value: string;
};
interface IManageGroupMemberForm {
  groupId: string;
  message?: string;
  groupUserIds: string[];
  checkedMemberAttributes?: [];
  memberAttributesKeys?: string[];
}
const mockMemberAttributes: TMockMemberAttributes[] = [
  {
    key: 'sex',
    value: 'male',
  },
  {
    key: 'age',
    value: '18',
  },
  {
    key: 'nickname',
    value: 'Tom',
  },
];
const manageGroupMemberForm = reactive<IManageGroupMemberForm>({
  groupId: '',
  message: 'I am Tom',
  groupUserIds: [],
  checkedMemberAttributes: [],
  memberAttributesKeys: [],
});
const joinGroup = async () => {
  const { groupId, message } = manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  if (!message) {
    Message.error('message 不可为空');
    return;
  }
  try {
    const res = await EMClient.joinGroup({
      groupId,
      message,
    });
    outConsoleLog('加入群组成功', res);
    Message.success('加入群组成功');
  } catch (error) {
    outConsoleLog('加入群组失败', error, 'error');
    Message.error('加入群组失败');
  }
};
const leaveGroup = async () => {
  const { groupId } = manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  try {
    const res = await EMClient.leaveGroup({
      groupId,
    });
    outConsoleLog('退出群组成功', res);
    Message.success('退出群组成功');
  } catch (error) {
    outConsoleLog('退出群组失败', error, 'error');
    Message.error('退出群组失败');
  }
};
const inviteGroupMembers = async () => {
  try {
    const res = await EMClient.inviteUsersToGroup({
      groupId: manageGroupMemberForm.groupId,
      users: manageGroupMemberForm.groupUserIds,
    });
    outConsoleLog('邀请群成员入群成功', res);
    Message.success('邀请群成员入群成功');
  } catch (error) {
    outConsoleLog('邀请群成员入群失败', error, 'error');
    Message.error('邀请群成员入群失败');
  }
};
/* 群成员自定义属性 */
const setGroupMemberAttributes = async () => {
  const { groupId, groupUserIds, checkedMemberAttributes } =
    manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  if (!groupUserIds.length) {
    Message.error('群成员ID不能为空');
    return;
  }
  if (!checkedMemberAttributes || checkedMemberAttributes.length === 0) {
    Message.error('群成员自定义属性不能为空');
    return;
  }

  const memberAttributes = checkedMemberAttributes.reduce(
    (prev, cur: string) => {
      const [key, value] = cur.split(': ');
      if (key && value) {
        prev[key] = value;
      }
      console.log(prev, cur);
      return prev;
    },
    {} as Record<string, string>,
  );
  console.log('memberAttributes', memberAttributes);
  const userId = groupUserIds[0];
  try {
    const res = await EMClient.setGroupMemberAttributes({
      groupId,
      userId,
      memberAttributes,
    });
    outConsoleLog('设置群成员自定义属性成功', res);
    Message.success('设置群成员自定义属性成功');
  } catch (error) {
    outConsoleLog('设置群成员自定义属性失败', error, 'error');
    Message.error('设置群成员自定义属性失败');
  }
};
const getGroupMemberAttributes = async () => {
  const { groupId, groupUserIds } = manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  if (!groupUserIds.length) {
    Message.error('群成员ID不能为空');
    return;
  }
  const userId = groupUserIds[0];
  try {
    const res = await EMClient.getGroupMemberAttributes({
      groupId,
      userId,
    });
    outConsoleLog('获取单个群成员的所有自定义属性成功', res.data);
    Message.success('获取单个群成员的所有自定义属性成功');
  } catch (error) {
    outConsoleLog('获取单个群成员的所有自定义属性失败', error, 'error');
    Message.error('获取单个群成员的所有自定义属性失败');
  }
};
const getGroupMembersAttributes = async () => {
  const { groupId, groupUserIds, memberAttributesKeys } = manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  if (!groupUserIds.length) {
    Message.error('群成员ID不能为空');
    return;
  }
  if (memberAttributesKeys && !memberAttributesKeys.length) {
    Message.error('群成员自定义属性key不能为空');
    return;
  }
  try {
    const res = await EMClient.getGroupMembersAttributes({
      groupId,
      userIds: groupUserIds,
      keys: memberAttributesKeys,
    });
    outConsoleLog('根据属性 key 获取多个群成员的自定义属性成功', res.data);
    Message.success('根据属性 key 获取多个群成员的自定义属性成功');
  } catch (error) {
    outConsoleLog(
      '根据属性 key 获取多个群成员的自定义属性失败',
      error,
      'error',
    );
    Message.error('根据属性 key 获取多个群成员的自定义属性失败');
  }
};
/* 管理群主以及管理员 */
const getGroupAdminList = async () => {
  const { groupId } = manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  try {
    const res = await EMClient.getGroupAdmin({
      groupId,
    });
    outConsoleLog('获取群组管理员列表成功', res.data);
    Message.success('获取群组管理员列表成功');
  } catch (error) {
    outConsoleLog('获取群组管理员列表失败', error, 'error');
    Message.error('获取群组管理员列表失败');
  }
};
const addGroupAdmin = async () => {
  const { groupId, groupUserIds } = manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  if (!groupUserIds.length) {
    Message.error('群成员ID不能为空');
    return;
  }
  const userId = groupUserIds[0];
  try {
    const res = await EMClient.setGroupAdmin({
      groupId,
      username: userId,
    });
    outConsoleLog('添加群组管理员成功', res);
    Message.success('添加群组管理员成功');
  } catch (error) {
    outConsoleLog('添加群组管理员失败', error, 'error');
    Message.error('添加群组管理员失败');
  }
};
const removeGroupAdmin = async () => {
  const { groupId, groupUserIds } = manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  if (!groupUserIds.length) {
    Message.error('群成员ID不能为空');
    return;
  }
  const userId = groupUserIds[0];
  try {
    const res = await EMClient.removeGroupAdmin({
      groupId,
      username: userId,
    });
    outConsoleLog('删除群组管理员成功', res);
    Message.success('删除群组管理员成功');
  } catch (error) {
    outConsoleLog('删除群组管理员失败', error, 'error');
    Message.error('删除群组管理员失败');
  }
};
const changeGroupOwner = async () => {
  const { groupId, groupUserIds } = manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  if (!groupUserIds.length) {
    Message.error('群成员ID不能为空');
    return;
  }
  const userId = groupUserIds[0];
  try {
    const res = await EMClient.changeGroupOwner({
      groupId,
      newOwner: userId,
    });
    outConsoleLog('转让群主成功', res);
    Message.success('转让群主成功');
  } catch (error) {
    outConsoleLog('转让群主失败', error, 'error');
    Message.error('转让群主失败');
  }
};
/* 管理群组白名单 */
const getGroupWhitelist = async () => {
  const { groupId } = manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  try {
    const res = await EMClient.getGroupAllowlist({
      groupId,
    });
    outConsoleLog('获取群组白名单成功', res.data);
    Message.success('获取群组白名单成功');
  } catch (error) {
    outConsoleLog('获取群组白名单失败', error, 'error');
    Message.error('获取群组白名单失败');
  }
};
const addGroupWhitelist = async () => {
  const { groupId, groupUserIds } = manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  if (!groupUserIds.length) {
    Message.error('群成员ID不能为空');
    return;
  }
  try {
    const res = await EMClient.addUsersToGroupAllowlist({
      groupId,
      users: groupUserIds,
    });
    outConsoleLog('添加群组白名单成功', res);
    Message.success('添加群组白名单成功');
  } catch (error) {
    outConsoleLog('添加群组白名单失败', error, 'error');
    Message.error('添加群组白名单失败');
  }
};
const removeGroupWhitelist = async () => {
  const { groupId, groupUserIds } = manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  if (!groupUserIds.length) {
    Message.error('群成员ID不能为空');
    return;
  }
  const userId = groupUserIds[0];
  try {
    const res = await EMClient.removeGroupAllowlistMember({
      groupId,
      userName: userId,
    });
    outConsoleLog('删除群组白名单成功', res);
    Message.success('删除群组白名单成功');
  } catch (error) {
    outConsoleLog('删除群组白名单失败', error, 'error');
    Message.error('删除群组白名单失败');
  }
};
const isInGroupWhitelist = async () => {
  const { groupId, groupUserIds } = manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  try {
    const res = await EMClient.isInGroupAllowlist({
      groupId,
      userName: EMClient.context.userId,
    });
    outConsoleLog('检查当前用户是否在群组白名单中', res);
    if (res.data?.white) {
      Message.success('当前用户在群组白名单中');
    } else {
      Message.error('当前用户不在群组白名单中');
    }
  } catch (error) {
    outConsoleLog('检查当前用户是否在群组白名单中', error, 'error');
  }
};
/* 管理群组黑名单 */
const getGroupBlacklist = async () => {
  const { groupId } = manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  try {
    const res = await EMClient.getGroupBlocklist({
      groupId,
    });
    outConsoleLog('获取群组黑名单成功', res.data);
    Message.success('获取群组黑名单成功');
  } catch (error) {
    outConsoleLog('获取群组黑名单失败', error, 'error');
    Message.error('获取群组黑名单失败');
  }
};
const addGroupBlacklist = async () => {
  const { groupId, groupUserIds } = manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  if (!groupUserIds.length) {
    Message.error('群成员ID不能为空');
    return;
  }
  try {
    const res = await EMClient.blockGroupMembers({
      groupId,
      usernames: groupUserIds,
    });
    outConsoleLog('添加群组黑名单成功', res);
    Message.success('添加群组黑名单成功');
  } catch (error) {
    outConsoleLog('添加群组黑名单失败', error, 'error');
    Message.error('添加群组黑名单失败');
  }
};
const removeGroupBlacklist = async () => {
  const { groupId, groupUserIds } = manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  if (!groupUserIds.length) {
    Message.error('群成员ID不能为空');
    return;
  }
  try {
    const res = await EMClient.unblockGroupMembers({
      groupId,
      usernames: groupUserIds,
    });
    outConsoleLog('删除群组黑名单成功', res);
    Message.success('删除群组黑名单成功');
  } catch (error) {
    outConsoleLog('删除群组黑名单失败', error, 'error');
    Message.error('删除群组黑名单失败');
  }
};
/* 管理群组禁言 */
const getGroupMuteList = async () => {
  const { groupId } = manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  try {
    const res = await EMClient.getGroupMutelist({
      groupId,
    });
    outConsoleLog('获取群组禁言列表成功', res.data);
    Message.success('获取群组禁言列表成功');
  } catch (error) {
    outConsoleLog('获取群组禁言列表失败', error, 'error');
    Message.error('获取群组禁言列表失败');
  }
};
const muteGroupMembers = async () => {
  const { groupId, groupUserIds } = manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  if (!groupUserIds.length) {
    Message.error('群成员ID不能为空');
    return;
  }
  try {
    const res = await EMClient.muteGroupMembers({
      groupId,
      usernames: groupUserIds,
      duration: 60 * 60 * 24 * 30,
    });
    outConsoleLog('禁言群成员成功', res);
    Message.success('禁言群成员成功');
  } catch (error) {
    outConsoleLog('禁言群成员失败', error, 'error');
    Message.error('禁言群成员失败');
  }
};
const unmuteGroupMembers = async () => {
  const { groupId, groupUserIds } = manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  if (!groupUserIds.length) {
    Message.error('群成员ID不能为空');
    return;
  }
  try {
    const res = await EMClient.unmuteGroupMembers({
      groupId,
      usernames: groupUserIds,
    });
    outConsoleLog('解除禁言群成员成功', res);
    Message.success('解除禁言群成员成功');
  } catch (error) {
    outConsoleLog('解除禁言群成员失败', error, 'error');
    Message.error('解除禁言群成员失败');
  }
};
const muteAllGroupMembers = async () => {
  const { groupId } = manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  try {
    const res = await EMClient.disableSendGroupMsg({
      groupId,
    });
    outConsoleLog('禁言所有群成员成功', res);
    Message.success('禁言所有群成员成功');
  } catch (error) {
    outConsoleLog('禁言所有群成员失败', error, 'error');
    Message.error('禁言所有群成员失败');
  }
};
const unmuteAllGroupMembers = async () => {
  const { groupId } = manageGroupMemberForm;
  if (!groupId) {
    Message.error('群组ID不能为空');
    return;
  }
  try {
    const res = await EMClient.enableSendGroupMsg({
      groupId,
    });
    outConsoleLog('解除禁言所有群成员成功', res);
    Message.success('解除禁言所有群成员成功');
  } catch (error) {
    outConsoleLog('解除禁言所有群成员失败', error, 'error');
    Message.error('解除禁言所有群成员失败');
  }
};
</script>
<template>
  <div>
    <a-form :model="manageGroupMemberForm">
      <a-form-item label="群组ID">
        <a-input
          v-model="manageGroupMemberForm.groupId"
          placeholder="请输入群组ID"
        />
      </a-form-item>
      <a-form-item label="群成员ID">
        <a-input-tag
          v-model="manageGroupMemberForm.groupUserIds"
          placeholder="请输入群成员ID"
          :max-tag-count="5"
          allow-clear
          size="small"
        />
        <template #extra>
          <div>
            群成员的用户 ID 组成的数组，不包含群主的用户 ID，回车键可输入多个
          </div>
        </template>
      </a-form-item>
      <a-form-item label="基础操作">
        <a-space :size="'medium'" wrap>
          <a-button type="primary" @click="joinGroup"> 加入群组 </a-button>
          <a-button type="primary" status="danger" @click="leaveGroup">
            退出群组
          </a-button>
          <!-- 邀请成员入群 -->
          <a-button type="primary" @click="inviteGroupMembers">
            邀请成员入群
          </a-button>
        </a-space>
      </a-form-item>
      <a-form-item label="mock群成员自定义属性">
        <a-select
          v-model="manageGroupMemberForm.checkedMemberAttributes"
          placeholder="请选择要设置的模拟群成员用户属性"
          multiple
        >
          <a-option v-for="(item, index) in mockMemberAttributes" :key="index">
            {{ item.key }}: {{ item.value }}
          </a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="群属性keys">
        <a-input-tag
          v-model="manageGroupMemberForm.memberAttributesKeys"
          placeholder="请输入群属性keys"
          :max-tag-count="5"
          allow-clear
          size="small"
        />
        <template #extra>
          <div>输入群成员自定义属性key，回车键可输入多个</div>
        </template>
      </a-form-item>
      <a-form-item label="群成员自定义属性">
        <a-space :size="'medium'" wrap>
          <a-button type="primary" @click="setGroupMemberAttributes">
            设置群成员自定义属性
          </a-button>
          <a-button type="primary" @click="getGroupMemberAttributes">
            获取单个群成员的所有自定义属性
          </a-button>
          <!-- 根据属性 key 获取多个群成员的自定义属性 -->
          <a-button type="primary" @click="getGroupMembersAttributes">
            根据属性 key 获取多个群成员的自定义属性
          </a-button>
        </a-space>
        <template #extra>
          <p>
            群成员可设置自定义属性（key-value），例如在群组中的昵称和头像等。
          </p>
          <li>
            单个群成员的自定义属性总长度不能超过 4 KB。对于单个自定义属性，属性
            key 不能超过 16 字节，value 不能超过 512 个字节，否则会报错。
          </li>
          <li>
            群主可修改所有群成员的自定义属性，其他群成员只能修改自己的自定义属性。
          </li>
        </template>
      </a-form-item>
      <a-form-item label="管理群主以及管理员">
        <a-space :size="'medium'" wrap>
          <a-button type="primary" @click="getGroupAdminList">
            获取群组管理员列表
          </a-button>
          <a-button type="primary" @click="addGroupAdmin">
            添加群组管理员
          </a-button>
          <a-button type="primary" @click="removeGroupAdmin">
            删除群组管理员
          </a-button>
          <a-button type="primary" @click="changeGroupOwner">
            转让群主
          </a-button>
        </a-space>
      </a-form-item>
      <a-form-item label="管理群组白名单">
        <a-space :size="'medium'" wrap>
          <a-button type="primary" @click="getGroupWhitelist">
            获取群组白名单
          </a-button>
          <a-button type="primary" @click="addGroupWhitelist">
            添加群组白名单
          </a-button>
          <a-button type="primary" @click="removeGroupWhitelist">
            删除群组白名单
          </a-button>
          <a-tooltip content="仅可检查当前所登录的用户">
            <a-button type="primary" @click="isInGroupWhitelist">
              检查当前用户是否在群组白名单中
            </a-button>
          </a-tooltip>
        </a-space>
        <template #extra>
          <div>群主和群组中的管理员默认会被加入群组白名单</div>
        </template>
      </a-form-item>
      <a-form-item label="管理群组黑名单">
        <a-space :size="'medium'" wrap>
          <a-button type="primary" @click="getGroupBlacklist"
            >获取群组黑名单</a-button
          >
          <a-button type="primary" @click="addGroupBlacklist"
            >添加群组黑名单</a-button
          >
          <a-button type="primary" @click="removeGroupBlacklist"
            >删除群组黑名单</a-button
          >
        </a-space>
        <template #extra>
          <p>
            仅群主和群管理员可以调用 blockGroupMembers
            方法将指定成员添加至群组黑名单。被加入黑名单后，该成员会收到
            removeMember
            事件。其他群成员会收到该成员退出群组的回调，如需该回调，请联系商务开通。黑名单中的成员会被移出群组，无法再收发群消息，只有先被移出黑名单才能重新加入群组。
          </p>
        </template>
      </a-form-item>
      <a-form-item label="管理群组禁言">
        <a-space :size="'medium'" wrap>
          <a-button type="primary" @click="getGroupMuteList">
            获取群组禁言列表
          </a-button>
          <a-button type="primary" @click="muteGroupMembers">
            禁言群成员
          </a-button>
          <a-button type="primary" @click="unmuteGroupMembers">
            解除群成员禁言
          </a-button>
          <a-button type="primary" @click="muteAllGroupMembers">
            开启全员禁言
          </a-button>
          <a-button type="primary" @click="unmuteAllGroupMembers">
            关闭全员禁言
          </a-button>
        </a-space>
        <template #extra>
          <p>
            群主和群管理员若对单个或多个群成员禁言或解除禁言，可将其添加至或移出群组禁言列表。此外，群主和群管理员也可开启或关闭全员禁言。
          </p>
          <p>
            全员禁言和单独的成员禁言不冲突，开启和关闭全员禁言，并不影响群组禁言列表。
          </p>
        </template>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped></style>
