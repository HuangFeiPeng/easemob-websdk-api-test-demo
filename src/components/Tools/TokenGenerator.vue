<template>
  <div class="token-generator">
    <a-form layout="vertical" class="token-form" :model="form">
      <a-form-item label="AppKey" required>
        <a-input v-model="form.appkey" placeholder="请输入AppKey (格式: xxx#xxx)" />
      </a-form-item>

      <a-form-item label="Client ID" required>
        <a-input v-model="form.clientId" placeholder="请输入Client ID" />
      </a-form-item>

      <a-form-item label="Client Secret" required>
        <a-input-password v-model="form.clientSecret" placeholder="请输入Client Secret" />
      </a-form-item>


      <a-form-item label="User ID" required>
        <a-input v-model="form.userId" placeholder="请输入User ID" />
      </a-form-item>

      <a-form-item label="TTL (过期时间，单位：秒)" extra="默认值为十分钟">
        <a-input-number v-model="form.ttl" :min="1" :max="86400" placeholder="请输入过期时间" />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" @click="generateToken" :loading="generating">
          生成动态Token
        </a-button>
      </a-form-item>
    </a-form>

    <div v-if="token" class="token-result">
      <a-divider orientation="left">生成结果</a-divider>
      <div class="token-content">
        <a-textarea v-model="token" :rows="4" readonly placeholder="生成的Token将显示在这里" class="token-textarea" />
      </div>
      <a-button type="primary" size="small" @click="copyToken" :disabled="!token" class="copy-button">
          <template #icon>
            <icon-copy />
          </template>
          复制Token
        </a-button>
    </div>

    <!-- Token解析验证区域 -->
    <a-divider orientation="left" class="mt-10">Token解析验证</a-divider>
    <div class="token-verify">
      <a-form layout="vertical" class="verify-form" :model="verifyForm">
        <a-form-item label="动态Token" required>
          <a-textarea v-model="verifyForm.token" :rows="4" placeholder="请输入要解析验证的动态Token" class="token-textarea" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="verifyToken" :loading="verifying">
            解析验证Token
          </a-button>
        </a-form-item>
      </a-form>

      <div v-if="verifyResult" class="verify-result">
        <a-divider orientation="left">解析结果</a-divider>
        <div class="result-content">
          <a-descriptions bordered :column="1">
            <a-descriptions-item label="验证状态">
              <a-tag :color="verifyResult.isValid ? 'green' : 'red'">
                {{ verifyResult.isValid ? '有效' : '无效' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item v-if="verifyResult.isValid" label="用户ID">
              {{ verifyResult.userId }}
            </a-descriptions-item>
            <a-descriptions-item v-if="verifyResult.isValid" label="过期时间">
              {{ formatDate(verifyResult.expireTime as number) }}
            </a-descriptions-item>
            <a-descriptions-item v-if="verifyResult.isValid" label="剩余时间">
              <a-tag :color="verifyResult.isExpired ? 'red' : 'blue'">
                {{ verifyResult.isExpired ? '已过期' : verifyResult.remainingTime }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item v-if="!verifyResult.isValid" label="错误信息">
              {{ verifyResult.errorMessage }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconCopy } from '@arco-design/web-vue/es/icon';
import CryptoJS from 'crypto-js';

// 表单数据
const form = ref({
  clientId: '',
  clientSecret: '',
  appkey: '',
  userId: '',
  ttl: 600 // 默认10分钟
});

// 生成状态和结果
const generating = ref(false);
const token = ref('');

// 验证表单数据
const verifyForm = ref({
  token: ''
});

// 验证状态和结果
const verifying = ref(false);

// 验证结果类型定义
interface VerifyResult {
  isValid: boolean;
  userId?: string;
  expireTime?: number;
  isExpired?: boolean;
  remainingTime?: string;
  errorMessage?: string;
}

const verifyResult = ref<VerifyResult | null>(null);

// SHA256哈希函数
const sha256 = (str: string): string => {
  return CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex);
};

// 生成动态Token
const generateToken = () => {
  // 表单验证
  if (!form.value.clientId || !form.value.clientSecret || !form.value.appkey || !form.value.userId) {
    Message.error('请填写所有必填字段');
    return;
  }

  try {
    generating.value = true;

    // a. 获取当前时间戳（秒）
    const curTime = Math.floor(Date.now() / 1000);

    // b. 设置过期时间
    const ttl = form.value.ttl;

    // c. 生成signature
    const str = form.value.clientId + form.value.appkey + form.value.userId + curTime + ttl + form.value.clientSecret;
    const signature = sha256(str);

    // d. 组装为JSON
    const jsonObj = {
      signature,
      appkey: form.value.appkey,
      userId: form.value.userId,
      curTime,
      ttl
    };
    const jsonStr = JSON.stringify(jsonObj);

    // e. 加上token类型前缀
    const tokenWithPrefix = `dt-${jsonStr}`;

    // f. 进行base64编码（URL安全）
    let tokenBase64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(tokenWithPrefix));
    // 转换为URL安全的Base64
    tokenBase64 = tokenBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    token.value = tokenBase64;
    Message.success('Token生成成功');
  } catch (error) {
    console.error('生成Token失败:', error);
    Message.error('生成Token失败，请检查输入参数');
  } finally {
    generating.value = false;
  }
};

// 复制Token
const copyToken = () => {
  if (!token.value) return;

  navigator.clipboard.writeText(token.value)
    .then(() => {
      Message.success('Token已复制到剪贴板');
    })
    .catch(err => {
      console.error('复制失败:', err);
      Message.error('复制失败，请手动复制');
    });
};

// Base64解码函数
const base64Decode = (str: string): string => {
  // 处理URL安全的base64
  str = str.replace(/[-_]/g, (c) => c === '-' ? '+' : '/');
  // 移除所有非base64字符
  str = str.replace(/[^A-Za-z0-9+/]/g, '');
  // 补全padding
  while (str.length % 4) {
    str += '=';
  }
  return CryptoJS.enc.Base64.parse(str).toString(CryptoJS.enc.Utf8);
};

// 格式化日期函数
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

// 计算剩余时间函数
const calculateRemainingTime = (expireTime: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const remaining = expireTime - now;
  
  if (remaining <= 0) {
    return '已过期';
  }
  
  const days = Math.floor(remaining / (24 * 60 * 60));
  const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((remaining % (60 * 60)) / 60);
  const seconds = remaining % 60;
  
  let result = '';
  if (days > 0) result += `${days}天 `;
  if (hours > 0) result += `${hours}小时 `;
  if (minutes > 0) result += `${minutes}分钟 `;
  result += `${seconds}秒`;
  
  return result;
};

// 解析验证Token函数
const verifyToken = () => {
  if (!verifyForm.value.token.trim()) {
    Message.error('请输入要解析的Token');
    return;
  }
  
  try {
    verifying.value = true;
    verifyResult.value = null;
    
    const tokenStr = verifyForm.value.token.trim();
    
    // 1. 解码Base64
    const decoded = base64Decode(tokenStr);
    
    // 2. 检查前缀
    if (!decoded.startsWith('dt-')) {
      throw new Error('无效的Token格式：缺少dt-前缀');
    }
    
    // 3. 解析JSON
    const jsonStr = decoded.substring(3);
    const tokenObj = JSON.parse(jsonStr);
    
    // 4. 验证必要字段
    if (!tokenObj.signature || !tokenObj.appkey || !tokenObj.userId || !tokenObj.curTime || !tokenObj.ttl) {
      throw new Error('无效的Token格式：缺少必要字段');
    }
    
    // 5. 计算过期时间
    const expireTime = tokenObj.curTime + tokenObj.ttl;
    const now = Math.floor(Date.now() / 1000);
    const isExpired = expireTime <= now;
    
    // 6. 计算剩余时间
    const remainingTime = calculateRemainingTime(expireTime);
    
    // 7. 返回验证结果
    verifyResult.value = {
      isValid: true,
      userId: tokenObj.userId,
      expireTime,
      isExpired,
      remainingTime
    };
    
    Message.success('Token解析验证成功');
  } catch (error) {
    console.error('Token解析验证失败:', error);
    verifyResult.value = {
      isValid: false,
      errorMessage: error instanceof Error ? error.message : 'Token解析失败，请检查格式'
    };
    Message.error('Token解析验证失败');
  } finally {
    verifying.value = false;
  }
};
</script>

<style scoped>
.token-generator {
  width: 100%;
}

.token-form {
  max-width: 600px;
}

.token-result {
  margin-top: 24px;
  min-width: 600px;
}

.token-content {
  position: relative;
}

.token-textarea {
  margin-bottom: 8px;
}

.copy-button {
  display: block;
  margin-left: auto;
  margin-top: 8px;
}

/* Token解析验证样式 */
.token-verify {
  width: 100%;
}

.verify-form {
  max-width: 600px;
}

.verify-result {
  margin-top: 24px;
  min-width: 600px;
}

.result-content {
  background-color: #fafafa;
  padding: 16px;
  border-radius: 4px;
}
</style>