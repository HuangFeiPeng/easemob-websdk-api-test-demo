<script setup lang="ts">
import { EasemobChat } from 'easemob-websdk';
import { EMClient } from '@/EaseIM';
import { Message } from '@arco-design/web-vue';
import { outConsoleLog } from '@/utils/consoleOutput';
interface IManageGroupForm {
  groupId: string;
  pageSize?: number;
  pageNum?: number;
  needAffiliations?: boolean;
  needRole?: boolean;
  groupIds?: string[];
}
interface ICreateGroupForm {
  groupname: string;
  desc: string;
  members: EasemobChat.UserId[];
  public: boolean;
  approval: boolean;
  allowinvites: boolean;
  inviteNeedConfirm: boolean;
  maxusers: number;
  ext?: string;
}
const manageGroupForm = reactive<IManageGroupForm>({
  groupId: '',
  pageSize: 20,
  pageNum: 0,
  needAffiliations: true,
  needRole: true,
});
const getGroupInfo = async () => {
  if (!manageGroupForm.groupId) {
    Message.error('请输出要获取的群组ID');
    return;
  }
  try {
    const res = await EMClient.getGroupInfo({
      groupId: manageGroupForm.groupId,
    });
    outConsoleLog('获取群组详情信息成功', res.data);
    Message.success('获取群组详情信息成功');
  } catch (error) {
    outConsoleLog('获取群组详情信息失败', error, 'error');
    Message.error('获取群组详情信息失败');
  }
};
const getJoinedGroups = async () => {
  try {
    const res = await EMClient.getJoinedGroups({
      pageSize: manageGroupForm.pageSize as number,
      pageNum: manageGroupForm.pageNum as number,
      needAffiliations: manageGroupForm.needAffiliations,
      needRole: manageGroupForm.needRole,
    });
    outConsoleLog('获取加入的群组列表成功', res);
    Message.success('获取加入的群组列表成功');
  } catch (error) {
    outConsoleLog('获取加入的群组列表失败', error, 'error');
    Message.error('获取加入的群组列表失败');
  }
};
const getGroupMembers = async () => {
  if (!manageGroupForm.groupId) {
    Message.error('请输出要获取的群组ID');
    return;
  }
  try {
    const res = await EMClient.listGroupMembers({
      groupId: manageGroupForm.groupId,
      pageSize: manageGroupForm.pageSize as number,
      pageNum: (manageGroupForm.pageNum as number) + 1,
    });
    outConsoleLog('获取群组成员列表成功', res);
    Message.success('获取群组成员列表成功');
  } catch (error) {
    outConsoleLog('获取群组成员列表失败', error, 'error');
    Message.error('获取群组成员列表失败');
  }
};
const createGroupForm = reactive<ICreateGroupForm>({
  groupname: '测试',
  desc: '',
  members: [],
  public: true,
  approval: false,
  allowinvites: false,
  inviteNeedConfirm: false,
  maxusers: 200,
  ext: '',
});
const createGroupModalVisible = ref(false);
const createNewGroup = async () => {
  const options = {
    data: {
      groupname: createGroupForm.groupname,
      desc: createGroupForm.desc,
      members: createGroupForm.members,
      public: createGroupForm.public,
      approval: createGroupForm.approval,
      allowinvites: createGroupForm.allowinvites,
      inviteNeedConfirm: createGroupForm.inviteNeedConfirm,
      maxusers: createGroupForm.maxusers,
      ext: createGroupForm.ext,
    },
  };
  try {
    const res = await EMClient.createGroup(options);
    outConsoleLog('创建群组成功', res.data);
    Message.success('创建群组成功');
  } catch (error) {
    outConsoleLog('创建群组失败', error, 'error');
    Message.error('创建群组失败');
  }
};
//解散群
const dissolveGroup = async () => {
  if (!manageGroupForm.groupId) {
    Message.error('请输出要解散的群组ID');
    return;
  }
  try {
    const res = await EMClient.destroyGroup({
      groupId: manageGroupForm.groupId,
    });
    outConsoleLog('解散群组成功', res);
    Message.success('解散群组成功');
  } catch (error) {
    outConsoleLog('解散群组失败', error, 'error');
    Message.error('解散群组失败');
  }
};
</script>
<template>
  <div class="w-80">
    <a-form :model="manageGroupForm">
      <a-form-item label="群组ID">
        <a-input v-model="manageGroupForm.groupId" placeholder="请输入群组ID" />
      </a-form-item>
      <a-form-item label="pageSize">
        <a-input-number
          v-model="manageGroupForm.pageSize"
          :min="1"
          :max="100"
        />
      </a-form-item>
      <a-form-item label="pageNum">
        <a-input-number v-model="manageGroupForm.pageNum" :min="0" :max="100" />
      </a-form-item>
      <a-form-item label="needAffiliations">
        <a-switch v-model="manageGroupForm.needAffiliations" />
      </a-form-item>
      <a-form-item label="needRole">
        <a-switch v-model="manageGroupForm.needRole" />
      </a-form-item>
      <a-form-item label="群操作">
        <a-space :size="'medium'">
          <a-tooltip
            content="对于公有群，用户即使不加入群也能获取群组详情，而对于私有群，用户只有加入了群组才能获取群详情"
          >
            <a-button type="primary" @click="getGroupInfo"
              >获取群组详情信息
            </a-button>
          </a-tooltip>
          <!-- <a-button type="primary" @click="getGroupInfo"
            >获取群组详情信息
            </a-button
          > -->
          <a-button type="primary" @click="getJoinedGroups"
            >获取加入的群组列表</a-button
          >
          <a-button type="primary" @click="getGroupMembers"
            >获取群成员列表</a-button
          >
          <a-button type="primary" @click="createGroupModalVisible = true"
            >创建群组</a-button
          >
          <a-button type="primary" @click="dissolveGroup">解散群组</a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <!-- 群组创建modal -->
    <a-modal
      v-model:visible="createGroupModalVisible"
      title="创建群组"
      :width="800"
      @ok="createNewGroup"
      @cancel="createGroupModalVisible = false"
    >
      <a-form :model="createGroupForm">
        <a-form-item label="群组名称">
          <a-input
            v-model="createGroupForm.groupname"
            placeholder="请输入群组名称"
          />
        </a-form-item>
        <a-form-item label="群组描述">
          <a-input
            v-model="createGroupForm.desc"
            placeholder="请输入群组描述"
          />
        </a-form-item>
        <a-form-item label="群组成员">
          <a-input-tag
            v-model="createGroupForm.members"
            placeholder="请输入邀请加入的群组成员ID"
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
        <a-form-item label="群组类型">
          <a-radio-group v-model="createGroupForm.public">
            <a-radio :value="true">公开</a-radio>
            <a-radio :value="false">私有</a-radio>
          </a-radio-group>
          <template #extra>
            <div>是否为公开群，true 表示公开，false 表示私有</div>
          </template>
        </a-form-item>
        <a-form-item v-show="createGroupForm.public" label="群组申请">
          <a-radio-group v-model="createGroupForm.approval">
            <a-radio :value="true">需要审批</a-radio>
            <a-radio :value="false">不需要审批</a-radio>
          </a-radio-group>
          <template #extra>
            <div>
              入群申请是否需群主或管理员审批，true 表示需要，false 表示不需要
            </div>
            <div>
              由于私有群不支持用户申请入群，只能通过邀请方式进群，因此该参数仅对公开群有效，即
              public 设置为 true 时，对私有群无效。
            </div>
          </template>
        </a-form-item>
        <a-form-item v-show="!createGroupForm.public" label="群组邀请">
          <a-radio-group v-model="createGroupForm.allowinvites">
            <a-radio :value="true">允许邀请</a-radio>
            <a-radio :value="false">不允许邀请</a-radio>
          </a-radio-group>
          <template #extra>
            <div>
              是否允许群成员邀请其他用户加入群，true 表示允许，false 表示不允许
            </div>
            <div>
              该参数仅对私有群有效，即 public 设置为 false 时，
              因为公开群（public：true）仅支持群主和群管理员邀请人入群，不支持普通群成员邀请人入群。
            </div>
          </template>
        </a-form-item>
        <a-form-item label="群组邀请确认">
          <a-radio-group v-model="createGroupForm.inviteNeedConfirm">
            <a-radio :value="true">需要确认</a-radio>
            <a-radio :value="false">不需要确认</a-radio>
          </a-radio-group>
          <template #extra>
            <div>
              邀请加群时是否需要受邀用户确认：true 表示需要，false 表示不需要
            </div>
          </template>
        </a-form-item>
        <a-form-item label="群组最大成员数">
          <a-input-number
            v-model="createGroupForm.maxusers"
            :min="1"
            :max="200"
          />
          <template #extra>
            <div>
              群组最大成员数，默认为 200。不同套餐支持的人数上限不同，详见
              产品价格。
            </div>
          </template>
        </a-form-item>
        <a-form-item label="群组扩展信息">
          <a-input
            v-model="createGroupForm.ext"
            placeholder="请输入群组扩展信息"
          />
          <template #extra>
            <div>
              群组扩展信息，最长 8kb。开发者可以在群组信息中自定义存储
              一些自定义的信息。
            </div>
          </template>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped></style>
