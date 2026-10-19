<script setup lang="ts">
import { Message } from '@arco-design/web-vue';
import type { FileItem } from '@arco-design/web-vue';
import type {
  Message as EMMessage,
  MessageChatConversationType,
} from 'easemob-websdk-5';
import { emClient5, isEMClient5Inited, receivedMessages5 } from '@/EaseIM5';
import { outConsoleLog } from '@/utils/consoleOutput';

interface IMessage5Params {
  targetId: string;
  chatType: MessageChatConversationType;
  messageType: 'text' | 'image' | 'file' | 'custom';
  content: string;
  customEvent: string;
  customParams: string;
}
const messageForm = useLocalStorage<IMessage5Params>('websdk5-message', {
  targetId: '',
  chatType: 'singleChat',
  messageType: 'text',
  content: '',
  customEvent: '',
  customParams: '',
});

const imageFile = ref<File | null>(null);
const attachmentFile = ref<File | null>(null);
const onImageChange = (fileList: FileItem[]) => {
  imageFile.value = fileList[0]?.file ?? null;
};
const onAttachmentChange = (fileList: FileItem[]) => {
  attachmentFile.value = fileList[0]?.file ?? null;
};

const requireClient = () => {
  const client = emClient5;
  if (!client || !isEMClient5Inited.value) {
    Message.warning('请先在【配置】页初始化 WebSDK 5.x');
    return null;
  }
  return client;
};

const sendMessage = async () => {
  const client = requireClient();
  if (!client) {
    return;
  }
  if (!messageForm.value.targetId) {
    Message.warning('请输入目标ID');
    return;
  }
  try {
    const { chatManager } = client;
    const locator = {
      conversationId: messageForm.value.targetId,
      conversationType: messageForm.value.chatType,
    };
    let message: EMMessage;
    switch (messageForm.value.messageType) {
      case 'image': {
        if (!imageFile.value) {
          Message.warning('请选择图片文件');
          return;
        }
        message = chatManager.createImageMessage({
          ...locator,
          data: imageFile.value,
        });
        break;
      }
      case 'file': {
        if (!attachmentFile.value) {
          Message.warning('请选择文件');
          return;
        }
        message = chatManager.createFileMessage({
          ...locator,
          data: attachmentFile.value,
        });
        break;
      }
      case 'custom': {
        if (!messageForm.value.customEvent) {
          Message.warning('请输入自定义事件名');
          return;
        }
        let params: Record<string, string> | undefined;
        if (messageForm.value.customParams) {
          try {
            params = JSON.parse(messageForm.value.customParams);
          } catch {
            Message.warning('自定义参数需为合法 JSON');
            return;
          }
        }
        message = chatManager.createCustomMessage({
          ...locator,
          event: messageForm.value.customEvent,
          params,
        });
        break;
      }
      default: {
        if (!messageForm.value.content) {
          Message.warning('请输入消息内容');
          return;
        }
        message = chatManager.createTextMessage({
          ...locator,
          content: messageForm.value.content,
        });
      }
    }
    const sent = await chatManager.sendMessage(message);
    outConsoleLog('WebSDK5-发送消息成功', sent);
    Message.success('发送成功');
  } catch (error) {
    outConsoleLog('WebSDK5-发送消息失败', error, 'error');
    Message.error('发送失败，请查看控制台');
  }
};

const recallMessageId = ref('');
const recallMessage = async () => {
  const client = requireClient();
  if (!client) {
    return;
  }
  if (!messageForm.value.targetId || !recallMessageId.value) {
    Message.warning('请输入目标ID和待撤回的消息ID');
    return;
  }
  try {
    const result = await client.chatManager.recallMessage({
      conversationId: messageForm.value.targetId,
      conversationType: messageForm.value.chatType,
      messageId: recallMessageId.value,
    });
    outConsoleLog('WebSDK5-撤回消息成功', result);
    Message.success('撤回成功');
  } catch (error) {
    outConsoleLog('WebSDK5-撤回消息失败', error, 'error');
    Message.error('撤回失败，请查看控制台');
  }
};

const historyForm = reactive({
  cursor: '',
  pageSize: 20,
  searchDirection: 'up' as 'up' | 'down',
});
const historyMessages = ref<EMMessage[]>([]);
const historyLoading = ref(false);
const getHistoryMessages = async () => {
  const client = requireClient();
  if (!client) {
    return;
  }
  if (!messageForm.value.targetId) {
    Message.warning('请输入目标ID');
    return;
  }
  try {
    historyLoading.value = true;
    const page = await client.chatManager.getHistoryMessages({
      conversationId: messageForm.value.targetId,
      conversationType: messageForm.value.chatType,
      cursor: historyForm.cursor || undefined,
      pageSize: historyForm.pageSize,
      searchDirection: historyForm.searchDirection,
    });
    historyMessages.value = [...page.items];
    historyForm.cursor = page.cursor;
    outConsoleLog('WebSDK5-获取漫游消息成功', page);
    Message.success(
      `获取到 ${page.items.length} 条漫游消息${
        page.hasMore ? '（还有更多）' : ''
      }`,
    );
  } catch (error) {
    outConsoleLog('WebSDK5-获取漫游消息失败', error, 'error');
    Message.error('获取漫游消息失败，请查看控制台');
  } finally {
    historyLoading.value = false;
  }
};

const readReceiptIds = ref('');
const sendMessageReadReceipts = async () => {
  const client = requireClient();
  if (!client) {
    return;
  }
  const messageIds = readReceiptIds.value
    .split(/[,，\s]+/)
    .map((id) => id.trim())
    .filter(Boolean);
  if (!messageForm.value.targetId || messageIds.length === 0) {
    Message.warning('请输入目标ID和消息ID列表');
    return;
  }
  try {
    await client.chatManager.sendMessageReadReceipts({
      conversationId: messageForm.value.targetId,
      conversationType: messageForm.value.chatType,
      messageIds,
    });
    outConsoleLog('WebSDK5-发送已读回执成功', messageIds);
    Message.success('已读回执已发送');
  } catch (error) {
    outConsoleLog('WebSDK5-发送已读回执失败', error, 'error');
    Message.error('发送已读回执失败，请查看控制台');
  }
};

const messageSummary = (msg: EMMessage) => {
  if (msg.type === 'text' && 'content' in msg.body) {
    return msg.body.content;
  }
  return `[${msg.type}]`;
};

defineOptions({
  name: 'Message5Page',
});
</script>

<template>
  <div class="m-10">
    <a-form :model="messageForm" layout="horizontal">
      <a-form-item label="聊天类型">
        <a-radio-group v-model="messageForm.chatType" type="button">
          <a-radio value="singleChat">单聊</a-radio>
          <a-radio value="groupChat">群聊</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="目标ID" required>
        <a-input
          v-model="messageForm.targetId"
          placeholder="单聊为对端用户ID，群聊为群组ID（发送/撤回/漫游/已读回执共用）"
        />
      </a-form-item>
      <a-form-item label="消息类型">
        <a-radio-group v-model="messageForm.messageType" type="button">
          <a-radio value="text">文本</a-radio>
          <a-radio value="image">图片</a-radio>
          <a-radio value="file">文件</a-radio>
          <a-radio value="custom">自定义</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item
        v-if="messageForm.messageType === 'text'"
        label="消息内容"
        required
      >
        <a-textarea
          v-model="messageForm.content"
          placeholder="请输入文本消息内容"
        />
      </a-form-item>
      <a-form-item v-if="messageForm.messageType === 'image'" label="图片文件">
        <a-upload
          :auto-upload="false"
          :limit="1"
          accept="image/*"
          @change="onImageChange"
        />
      </a-form-item>
      <a-form-item v-if="messageForm.messageType === 'file'" label="文件">
        <a-upload
          :auto-upload="false"
          :limit="1"
          @change="onAttachmentChange"
        />
      </a-form-item>
      <template v-if="messageForm.messageType === 'custom'">
        <a-form-item label="自定义事件名" required>
          <a-input
            v-model="messageForm.customEvent"
            placeholder="自定义事件名，如 gift"
          />
        </a-form-item>
        <a-form-item label="自定义参数">
          <a-textarea
            v-model="messageForm.customParams"
            placeholder='JSON 字符串，如 {"id":"rose"}（可选）'
          />
        </a-form-item>
      </template>
      <a-form-item>
        <a-button type="primary" @click="sendMessage">发送消息</a-button>
      </a-form-item>
    </a-form>
    <a-divider />
    <h3 class="mb-2 font-bold">撤回消息（recallMessage）</h3>
    <a-form :model="messageForm" layout="horizontal">
      <a-form-item label="消息ID" required>
        <a-input
          v-model="recallMessageId"
          placeholder="待撤回的消息ID（默认 2 分钟内可撤回）"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" status="warning" @click="recallMessage">
          撤回消息
        </a-button>
      </a-form-item>
    </a-form>
    <a-divider />
    <h3 class="mb-2 font-bold">漫游消息（getHistoryMessages）</h3>
    <a-form :model="historyForm" layout="horizontal">
      <a-form-item label="拉取方向">
        <a-radio-group v-model="historyForm.searchDirection" type="button">
          <a-radio value="up">向更早（up）</a-radio>
          <a-radio value="down">向更新（down）</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="每页条数">
        <a-input-number v-model="historyForm.pageSize" :min="1" :max="50" />
      </a-form-item>
      <a-form-item label="cursor">
        <a-input
          v-model="historyForm.cursor"
          placeholder="首次拉取留空；成功后自动填入下一页 cursor"
        />
      </a-form-item>
      <a-form-item>
        <a-space wrap>
          <a-button
            type="primary"
            :loading="historyLoading"
            @click="getHistoryMessages"
          >
            获取漫游消息
          </a-button>
          <a-button
            @click="
              historyForm.cursor = '';
              historyMessages = [];
            "
          >
            重置 cursor
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <a-list
      v-if="historyMessages.length"
      :data="historyMessages"
      :pagination-props="{ pageSize: 10 }"
      bordered
    >
      <template #item="{ item }">
        <a-list-item>
          <a-list-item-meta
            :title="`[${item.type}] ${item.from} → ${item.to}`"
            :description="messageSummary(item as EMMessage)"
          />
          <template #actions>
            <span>{{ new Date(item.timestamp).toLocaleString() }}</span>
          </template>
        </a-list-item>
      </template>
    </a-list>
    <a-divider />
    <h3 class="mb-2 font-bold">发送已读回执（sendMessageReadReceipts）</h3>
    <a-form :model="messageForm" layout="horizontal">
      <a-form-item label="消息ID列表" required>
        <a-textarea
          v-model="readReceiptIds"
          placeholder="同一会话内的消息ID，多个用逗号或空格分隔（1~50 条）"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="sendMessageReadReceipts">
          发送已读回执
        </a-button>
      </a-form-item>
    </a-form>
    <a-divider />
    <h3 class="mb-2 font-bold">
      最近收到的事件消息（来自 onMessage 监听，最多保留 50 条）
    </h3>
    <a-list
      :data="receivedMessages5"
      :pagination-props="{ pageSize: 10 }"
      bordered
    >
      <template #item="{ item }">
        <a-list-item>
          <a-list-item-meta
            :title="`[${item.type}] ${item.from} → ${item.to}`"
            :description="messageSummary(item as EMMessage)"
          >
            <template #avatar>
              <a-tag :color="item.direct === 'send' ? 'blue' : 'green'">
                {{ item.direct === 'send' ? '发送' : '接收' }}
              </a-tag>
            </template>
          </a-list-item-meta>
          <template #actions>
            <span>{{ new Date(item.timestamp).toLocaleString() }}</span>
          </template>
        </a-list-item>
      </template>
      <template #empty>
        <a-empty description="暂无收到消息，等待 onMessage 事件" />
      </template>
    </a-list>
  </div>
</template>
