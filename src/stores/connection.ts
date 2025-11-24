import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ServerConfig {
  url: string
  username: string
  password: string
}

export const useConnectionStore = defineStore('connection', () => {
  const isConnected = ref(false)
  const serverConfig = ref<ServerConfig>({
    url: '/transmission/rpc',
    username: '',
    password: '',
  })

  // 从 localStorage 加载配置
  const loadConfig = () => {
    const savedConfig = localStorage.getItem('serverConfig')
    if (savedConfig) {
      serverConfig.value = JSON.parse(savedConfig)
    }
  }

  // 保存配置到 localStorage
  const saveConfig = (config: ServerConfig) => {
    serverConfig.value = config
    localStorage.setItem('serverConfig', JSON.stringify(config))
  }

  // 设置连接状态
  const setConnected = (status: boolean) => {
    isConnected.value = status
  }

  return {
    isConnected,
    serverConfig,
    loadConfig,
    saveConfig,
    setConnected,
  }
})
