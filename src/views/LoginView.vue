<template>
  <div class="login-view">
    <el-card class="login-card">
      <template #header>
        <h2>连接 Transmission 服务器</h2>
      </template>
      <el-form :model="form" label-width="100px" @submit.prevent="handleLogin">
        <el-form-item label="服务器地址">
          <el-input v-model="form.url" placeholder="/transmission/rpc" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="可选" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="可选" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin">
            连接
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useConnectionStore } from '@/stores/connection'
import { transmissionClient } from '@/api/client'
import * as api from '@/api/transmission'

const router = useRouter()
const connectionStore = useConnectionStore()
const loading = ref(false)
const form = ref({
  url: '/transmission/rpc',
  username: '',
  password: '',
})

// 处理登录
const handleLogin = async () => {
  loading.value = true
  try {
    // 设置认证信息
    if (form.value.username && form.value.password) {
      transmissionClient.setAuth(form.value.username, form.value.password)
    }

    // 测试连接
    await api.testConnection()

    // 保存配置
    connectionStore.saveConfig(form.value)
    connectionStore.setConnected(true)

    ElMessage.success('连接成功')
    router.push('/')
  } catch (error: any) {
    ElMessage.error(`连接失败: ${error.message}`)
    connectionStore.setConnected(false)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 加载已保存的配置
  connectionStore.loadConfig()
  if (connectionStore.serverConfig) {
    form.value = { ...connectionStore.serverConfig }
  }
})
</script>

<style scoped>
.login-view {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
}

.login-card h2 {
  margin: 0;
  text-align: center;
}
</style>
