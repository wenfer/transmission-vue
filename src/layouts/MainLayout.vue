<template>
  <el-container class="main-layout" :class="{ 'is-mobile': isMobile }">
    <el-header class="header">
      <div class="header-left">
        <el-button
          v-if="isMobile"
          class="menu-toggle"
          :icon="Menu"
          circle
          plain
          aria-label="展开导航菜单"
          @click="isMenuOpen = true"
        />
        <h1 class="title">{{ backendLabel }} Vue</h1>
        <span class="version-badge">v{{ frontendVersion }}</span>
      </div>
      <div class="header-right">
        <el-button :icon="Setting" circle plain @click="$router.push('/settings')" />
        <el-button :icon="SwitchButton" circle plain @click="handleLogout" title="退出登录" />
      </div>
    </el-header>

    <el-container class="content-container">
      <el-aside v-if="!isMobile" width="240px" class="aside">
        <div class="aside-content">
          <el-menu :default-active="$route.path" router @select="handleMenuSelect">
            <el-menu-item
              v-for="item in navigationItems"
              :key="item.index"
              :index="item.index"
            >
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.label }}</span>
            </el-menu-item>
          </el-menu>
          <SidebarStatus :metrics="statusMetrics" />
        </div>
      </el-aside>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>

    <el-drawer
      v-model="isMenuOpen"
      direction="ltr"
      size="70%"
      :with-header="false"
      class="mobile-drawer"
    >
      <div class="mobile-drawer-header">
        <h3>导航菜单</h3>
        <span class="drawer-version">v{{ frontendVersion }}</span>
      </div>
      <div class="drawer-body">
        <el-menu :default-active="$route.path" router @select="handleMenuSelect">
          <el-menu-item
            v-for="item in navigationItems"
            :key="item.index"
            :index="item.index"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </el-menu-item>
        </el-menu>
        <SidebarStatus :metrics="statusMetrics" />
      </div>
    </el-drawer>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Setting, List, TrendCharts, Menu, SwitchButton } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useSystemStatusStore } from '@/stores/systemStatus'
import { useConnectionStore } from '@/stores/connection'
import { useMediaQuery } from '@/utils/useMediaQuery'
import SidebarStatus from './components/SidebarStatus.vue'
import { torrentBackendName } from '@/config/torrentClient'

const router = useRouter()
const systemStatusStore = useSystemStatusStore()
const connectionStore = useConnectionStore()
const backendLabel = torrentBackendName
const { sessionStats, freeSpaceBytes, sessionConfig, lastUpdated } = storeToRefs(systemStatusStore)
const isMobile = useMediaQuery('(max-width: 768px)')
const isMenuOpen = ref(false)
const navigationItems = [
  { index: '/', label: '种子列表', icon: List },
  { index: '/settings', label: '设置', icon: Setting },
  { index: '/stats', label: '数据统计', icon: TrendCharts },
]

const uploadSpeedText = computed(() => formatSpeed(sessionStats.value?.uploadSpeed || 0))
const downloadSpeedText = computed(() => formatSpeed(sessionStats.value?.downloadSpeed || 0))
const freeSpaceText = computed(() =>
  freeSpaceBytes.value !== null ? formatBytes(freeSpaceBytes.value) : '未知'
)
const versionText = computed(() => sessionConfig.value?.version || '未知')
const lastUpdatedText = computed(() => lastUpdated.value || '—')
const frontendVersion = __APP_VERSION__ || 'dev'
const statusMetrics = computed(() => [
  { label: '上传速度', value: uploadSpeedText.value },
  { label: '下载速度', value: downloadSpeedText.value },
  { label: '可用空间', value: freeSpaceText.value },
  { label: '版本', value: versionText.value },
  { label: '更新', value: lastUpdatedText.value },
  { label: '前端', value: frontendVersion },
])

onMounted(() => {
  systemStatusStore.start()
})

onBeforeUnmount(() => {
  systemStatusStore.stop()
})

watch(isMobile, (mobile) => {
  if (!mobile) {
    isMenuOpen.value = false
  }
})

const handleMenuSelect = () => {
  if (isMobile.value) {
    isMenuOpen.value = false
  }
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 停止定时刷新
    systemStatusStore.stop()

    // 清除连接状态
    connectionStore.setConnected(false)

    // 跳转到登录页
    router.push('/login')
  } catch (error) {
    // 用户取消
  }
}

const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

const formatSpeed = (bytes: number): string => {
  if (!bytes) return '0 B/s'
  return `${formatBytes(bytes)}/s`
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  background-color: #f0f2f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #409eff;
  color: white;
  padding: 12px 20px;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.version-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 12px;
}

.header-right {
  display: flex;
  gap: 8px;
}

.menu-toggle {
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.status-label {
  font-size: 12px;
  opacity: 0.85;
}

.status-value {
  font-size: 14px;
  font-weight: 600;
}

.content-container {
  height: calc(100vh - 60px);
}

.aside {
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.main {
  background-color: #fff;
  padding: 20px;
}

.aside-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.mobile-drawer :deep(.el-drawer__body) {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.mobile-drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px 12px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 12px;
}

.mobile-drawer-header h3 {
  margin: 0;
  font-size: 16px;
}

.drawer-version {
  font-size: 12px;
  color: #909399;
}

.drawer-body {
  display: flex;
  flex-direction: column;
  height: calc(100% - 72px);
  padding-bottom: 20px;
}

@media (max-width: 768px) {
  .main-layout {
    height: auto;
    min-height: 100vh;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    padding: 12px 16px;
    gap: 12px;
  }

  .status-cards {
    width: 100%;
  }

  .content-container {
    height: auto;
    min-height: calc(100vh - 60px);
    flex-direction: column;
  }

  .main {
    padding: 16px 12px 32px;
  }
}
</style>
