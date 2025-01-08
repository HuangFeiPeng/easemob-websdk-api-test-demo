<script setup lang="ts">
import { EasemobChat } from 'easemob-websdk';
import { EMClient } from '@/EaseIM';
import { Message } from '@arco-design/web-vue';
import type { Upload, FileItem } from '@arco-design/web-vue';
import { outConsoleLog } from '@/utils/consoleOutput';
interface IGroupAttributeForm {
  groupId: string;
  groupName?: string;
  description?: string;
  ext?: string;
  announcement?: string;
  fileId?: string;
  groupFile?: object;
  fileName?: string;
  pageSize?: number;
  pageNum?: number;
}
const manageGroupAttributeFrom: IGroupAttributeForm = reactive({
  groupId: '',
  groupName: '',
  description: '',
  ext: '',
  announcement: '',
  fileId: '',
  fileName: '',
  groupFile: {},
  pageSize: 20,
  pageNum: 0,
});
const getGroupInfo = async () => {
  if (!manageGroupAttributeFrom.groupId) {
    Message.error('请输入群组ID');
    return;
  }
  try {
    const res = await EMClient.getGroupInfo({
      groupId: manageGroupAttributeFrom.groupId,
    });
    outConsoleLog('获取群组信息成功', res.data);
    Message.success('获取群组信息成功');
  } catch (error) {
    outConsoleLog('获取群组信息失败', error, 'error');
    Message.error('获取群组信息失败');
  }
};
const updateGroupInfo = async () => {
  if (!manageGroupAttributeFrom.groupId) {
    Message.error('请输入群组ID');
    return;
  }
  if (
    !manageGroupAttributeFrom.groupName &&
    !manageGroupAttributeFrom.description &&
    !manageGroupAttributeFrom.ext
  ) {
    Message.error('请输入要修改的群组信息');
    return;
  }
  interface IUpdateGroupInfo {
    groupId: string;
    groupName?: string;
    description?: string;
    ext?: string;
  }
  const options: IUpdateGroupInfo = {
    groupId: manageGroupAttributeFrom.groupId,
  };
  if (manageGroupAttributeFrom.groupName) {
    options['groupName'] = manageGroupAttributeFrom.groupName;
  }
  if (manageGroupAttributeFrom.description) {
    options['description'] = manageGroupAttributeFrom.description;
  }
  if (manageGroupAttributeFrom.ext) {
    options['ext'] = manageGroupAttributeFrom.ext;
  }
  console.log('object', options);
  try {
    const res = await EMClient.modifyGroup(options);
    outConsoleLog('更新群组信息成功', res);
    Message.success('更新群组信息成功');
  } catch (error) {
    outConsoleLog('更新群组信息失败', error, 'error');
    Message.error('更新群组信息失败');
  }
};
const fetchGroupAnnouncement = async () => {
  if (!manageGroupAttributeFrom.groupId) {
    Message.error('请输入群组ID');
    return;
  }
  try {
    const res = await EMClient.fetchGroupAnnouncement({
      groupId: manageGroupAttributeFrom.groupId,
    });
    outConsoleLog('获取群组公告成功', res.data);
    Message.success('获取群组公告成功');
  } catch (error) {
    outConsoleLog('获取群组公告失败', error, 'error');
    Message.error('获取群组公告失败');
  }
};
const updateGroupAnnouncement = async () => {
  if (!manageGroupAttributeFrom.groupId) {
    Message.error('请输入群组ID');
    return;
  }
  if (!manageGroupAttributeFrom.announcement) {
    Message.error('请输入要设置的群组公告');
    return;
  }
  try {
    const res = await EMClient.updateGroupAnnouncement({
      groupId: manageGroupAttributeFrom.groupId,
      announcement: manageGroupAttributeFrom.announcement,
    });
    outConsoleLog('更新群组公告成功', res.data);
    Message.success('更新群组公告成功');
  } catch (error) {
    outConsoleLog('更新群组公告失败', error, 'error');
    Message.error('更新群组公告失败');
  }
};
const fileDataRef = ref();
const fileObj = ref<EasemobChat.FileObj>();
const getFile = () => {
  const file = fileDataRef.value.files[0];
  if (!file) {
    Message.error('请选择要上传的文件');
    return;
  }
  fileObj.value = {
    url: '',
    filename: file.name,
    data: file,
    filetype: file.type,
  };
  uploadGroupFile();
};
const chooseFileData = () => {
  fileDataRef.value.click();
};
const getGroupFileList = async () => {
  if (!manageGroupAttributeFrom.groupId) {
    Message.error('请输入群组ID');
    return;
  }
  try {
    const res = await EMClient.getGroupSharedFilelist({
      groupId: manageGroupAttributeFrom.groupId,
      pageSize: (manageGroupAttributeFrom.pageSize as number) || 20,
      pageNum: manageGroupAttributeFrom.pageNum as number,
    });
    outConsoleLog('获取群组文件列表成功', res.data);
    Message.success('获取群组文件列表成功');
  } catch (error) {
    outConsoleLog('获取群组文件列表失败', error, 'error');
    Message.error('获取群组文件列表失败');
  }
};
const uploadGroupFile = async () => {
  if (!manageGroupAttributeFrom.groupId) {
    Message.error('请输入群组ID');
    return;
  }
  if (!fileObj.value) {
    Message.error('请选择要上传的文件');
    return;
  }
  EMClient.uploadGroupSharedFile({
    groupId: manageGroupAttributeFrom.groupId,
    file: fileObj.value,
    onFileUploadComplete(data) {
      outConsoleLog('文件上传完成...', data);
      Message.success('文件上传成功');
      fileDataRef.value.value = null;
    },
    onFileUploadProgress(data) {
      outConsoleLog('文件上传进度展示...', data);
      Message.info(`文件上传中...`);
    },
    onFileUploadError(error) {
      outConsoleLog('文件上传失败', error, 'error');
      Message.error('文件上传失败');
      fileDataRef.value.value = null;
    },
  });
};
const downloadGroupFile = async () => {
  if (!manageGroupAttributeFrom.groupId) {
    Message.error('请输入群组ID');
    return;
  }
  if (!manageGroupAttributeFrom.fileId) {
    Message.error('请输入群组文件ID');
    return;
  }
  EMClient.downloadGroupSharedFile({
    groupId: manageGroupAttributeFrom.groupId,
    fileId: manageGroupAttributeFrom.fileId,
    onFileDownloadComplete(data) {
      outConsoleLog('文件下载完成...', data);
      Message.success('文件下载成功');
      downloadFile(data, 'iShot_2025-01-02_16.02.12.png');
    },
    onFileDownloadError(err) {
      outConsoleLog('文件下载失败', err, 'error');
      Message.error('文件下载失败');
    },
  });
};
//删除群共享文件
const deleteGroupFile = async () => {
  if (!manageGroupAttributeFrom.groupId) {
    Message.error('请输入群组ID');
    return;
  }
  if (!manageGroupAttributeFrom.fileId) {
    Message.error('请输入群组文件ID');
    return;
  }
  try {
    const res = await EMClient.deleteGroupSharedFile({
      groupId: manageGroupAttributeFrom.groupId,
      fileId: manageGroupAttributeFrom.fileId,
    });
    outConsoleLog('删除群组文件成功', res.data);
    Message.success('删除群组文件成功');
  } catch (error) {
    outConsoleLog('删除群组文件失败', error, 'error');
    Message.error('删除群组文件失败');
  }
};
//下载Blob文件
const downloadFile = (data: Blob, fileName: string) => {
  const blob = new Blob([data]);
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};
//40951490-cda3-11ef-b0cd-bff9258c6008
//iShot_2025-01-02_16.02.12.png
</script>
<template>
  <div>
    <a-form :model="manageGroupAttributeFrom">
      <a-form-item label="群组ID" required>
        <a-input
          v-model="manageGroupAttributeFrom.groupId"
          placeholder="请输入群组ID"
        />
      </a-form-item>
      <a-form-item label="群组名称">
        <a-input
          v-model="manageGroupAttributeFrom.groupName"
          placeholder="请输入群组名称"
        />
        <template #extra>
          <div>
            群名称的长度限制为 128 个字符。群描述的长度限制为 512 个字符。
          </div>
        </template>
      </a-form-item>
      <a-form-item label="群组描述">
        <a-input
          v-model="manageGroupAttributeFrom.description"
          placeholder="请输入群组描述"
        />
      </a-form-item>
      <a-form-item label="群组扩展属性">
        <a-input
          v-model="manageGroupAttributeFrom.ext"
          placeholder="请输入群组扩展属性"
        />
      </a-form-item>
      <a-form-item label="群组公告">
        <a-input
          v-model="manageGroupAttributeFrom.announcement"
          placeholder="请输入群组公告"
        />
      </a-form-item>
      <a-form-item label="群组文件ID">
        <a-input
          v-model="manageGroupAttributeFrom.fileId"
          placeholder="请输入群组文件ID"
        />
      </a-form-item>
      <a-form-item label="群组文件名">
        <a-input
          v-model="manageGroupAttributeFrom.fileName"
          placeholder="请输入群组文件名"
        />
        <template #extra>
          <div>
            下载下来的为Blob文件，调用a标签的download下载时需要指定文件名
          </div>
        </template>
      </a-form-item>
      <a-form-item label="群文件分页查询">
        <a-space :size="'medium'" wrap>
          <a-tooltip content="分页页码">
            <a-input-number
              v-model="manageGroupAttributeFrom.pageNum"
              placeholder="请输入分页页面"
            />
          </a-tooltip>
          <a-tooltip content="每页数量">
            <a-input-number
              v-model="manageGroupAttributeFrom.pageSize"
              placeholder="请输入每页数量"
            />
          </a-tooltip>
        </a-space>
      </a-form-item>
      <a-form-item label="群组信息操作">
        <a-space :size="'medium'" wrap>
          <a-button type="primary" @click="getGroupInfo">
            获取群组信息
          </a-button>
          <a-button type="primary" @click="updateGroupInfo">
            更新群组信息
          </a-button>
        </a-space>
      </a-form-item>
      <a-form-item label="管理群组公告">
        <a-space :size="'medium'" wrap>
          <a-tooltip
            content="所有群成员均可调用 fetchGroupAnnouncement 方法获取群公告"
          >
            <a-button type="primary" @click="fetchGroupAnnouncement"
              >获取群公告
            </a-button>
          </a-tooltip>
          <a-tooltip
            content="仅群主和群管理员可以调用 updateGroupAnnouncement 方法设置和更新群公告。群公告的长度限制为 512 个字符"
          >
            <a-button type="primary" @click="updateGroupAnnouncement"
              >设置群公告</a-button
            >
          </a-tooltip>
        </a-space>
      </a-form-item>
      <a-form-item label="群组文件操作">
        <input
          ref="fileDataRef"
          type="file"
          @change="getFile"
          style="display: none"
        />
        <a-space :size="'medium'" wrap>
          <a-button type="primary" @click="getGroupFileList">
            获取群共享文件列表
          </a-button>
          <a-button type="primary" @click="chooseFileData">
            上传群组文件
          </a-button>
          <a-button type="primary" @click="downloadGroupFile">
            下载群组文件
          </a-button>
          <a-tooltip
            content="群主和群管理员可删除全部群共享文件，群成员只能删除自己上传的群文件。"
          >
            <a-button type="primary" @click="deleteGroupFile">
              删除群共享文件
            </a-button>
          </a-tooltip>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped></style>
