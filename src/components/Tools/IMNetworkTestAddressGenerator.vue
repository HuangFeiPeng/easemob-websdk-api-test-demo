<template>
  <div class="tool-content im-network-test-generator">
    <h2>IM网络工程测试地址生成器</h2>
    <a-card class="generator-card">
      <a-form layout="responsive" label-align="right" :label-col="{ xs: 8, sm: 6, md: 5 }" :wrapper-col="{ xs: 16, sm: 18, md: 19 }" :model="formData">
        <a-form-item label="服务器:">
          <a-radio-group v-model="formData.serverType" name="serverType">
            <a-radio value="domestic">国内</a-radio>
            <a-radio value="overseas">海外</a-radio>
          </a-radio-group>

        </a-form-item>
            <a-form-item label="AppKey:" required>
          <a-input v-model="formData.appKey" placeholder="请输入AppKey" />
        </a-form-item>
        <a-form-item label="用户ID:" required>
          <a-input v-model="formData.userId" placeholder="请输入用户ID" />
        </a-form-item>
        
        <a-form-item label="Token:" required>
          <a-input v-model="formData.token" placeholder="请输入Token" />
        </a-form-item>
        
        <a-form-item label="生成链接:">
          <a-input-group>
            <a-input v-model="generatedLink" placeholder="生成的链接" readonly />
            <a-button type="primary" @click="copyLink">
              <template #icon>
                <icon-copy />
              </template>
              复制
            </a-button>
          </a-input-group>
        </a-form-item>
        
        <a-form-item label="">
          <div class="qr-code-container">
            <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="二维码" class="qr-code" />
            <div v-else class="qr-code-placeholder">
              <span>二维码将显示在这里</span>
            </div>
          </div>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { IconCopy } from '@arco-design/web-vue/es/icon';

// 表单数据
const formData = ref({
  serverType: 'domestic',
  userId: '',
  token: '',
  appKey: ''
});
const generatedLink = ref('');
const qrCodeUrl = ref('');

// 监听表单数据变化，自动生成链接
watch(() => [formData.value.serverType, formData.value.userId, formData.value.token, formData.value.appKey], () => {
  generateLink();
});

// 生成测试链接
const generateLink = () => {
  if (!formData.value.userId || !formData.value.token || !formData.value.appKey) {
    generatedLink.value = '';
    qrCodeUrl.value = '';
    return;
  }
  
  // 根据服务器类型选择不同的完整域名
  const baseUrl = formData.value.serverType === 'domestic' 
    ? 'https://downloads.easemob.com/downloads/WEB_SDK/tools/index.html' 
    : 'https://tools.easemob.com/';
  
  // 生成链接
  generatedLink.value = `${baseUrl}?username=${encodeURIComponent(formData.value.userId)}&accessToken=${encodeURIComponent(formData.value.token)}&appKey=${encodeURIComponent(formData.value.appKey)}&serverType=${encodeURIComponent(formData.value.serverType)}`;
  
  // 生成二维码（这里使用第三方服务生成二维码，实际项目中可能需要使用专门的二维码生成库）
  generateQrCode(generatedLink.value);
};

// 生成二维码
const generateQrCode = (url: string) => {
  // 使用草料二维码API生成二维码（实际项目中建议使用专门的二维码生成库）
  qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
};

// 复制链接到剪贴板
const copyLink = () => {
  if (generatedLink.value) {
    navigator.clipboard.writeText(generatedLink.value)
      .then(() => {
        // 使用arco-design的消息提示组件
        (window as any).$message?.success('链接已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
        (window as any).$message?.error('复制失败，请手动复制');
      });
  }
};
</script>

<style scoped>
.im-network-test-generator {
  width: 100%;
  padding: 0 16px;
  box-sizing: border-box;
}

.im-network-test-generator h2 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 18px;
  color: var(--arco-color-primary);
}

.generator-card {
  box-shadow: 0 2px 8px var(--arco-color-shadow);
  width: 100%;
}

.qr-code-container {
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.qr-code {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-code-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--arco-color-bg-2);
  border: 1px solid var(--arco-color-border-2);
  border-radius: var(--arco-border-radius-small);
  color: var(--arco-color-text-3);
  font-size: 14px;
}

/* H5布局优化 */
@media (max-width: 768px) {
  .im-network-test-generator {
    padding: 0 12px;
  }
  
  .im-network-test-generator h2 {
    font-size: 16px;
    margin-bottom: 16px;
  }
  
  .qr-code-container {
    width: 120px;
    height: 120px;
  }
  
  .qr-code-placeholder span {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .qr-code-container {
    width: 100px;
    height: 100px;
  }
}
</style>