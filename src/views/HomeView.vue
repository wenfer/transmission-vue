<template>
  <div class="home-view">
    <div class="toolbar">
      <div class="actions-group">
        <el-button type="primary" :icon="Plus" @click="showAddDialog = true">
          添加种子
        </el-button>
        <el-button :icon="Refresh" @click="loadTorrents()">刷新</el-button>
        <el-button
          :icon="VideoPlay"
          :disabled="!hasSelection"
          @click="startSelected"
        >
          开始选中
        </el-button>
        <el-button
          :icon="VideoPause"
          :disabled="!hasSelection"
          @click="stopSelected"
        >
          暂停选中
        </el-button>
        <el-button
          type="danger"
          :icon="Delete"
          :disabled="!hasSelection"
          @click="removeSelected"
        >
          删除选中
        </el-button>
      </div>
      <div class="filters">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索种子..."
          :prefix-icon="Search"
          style="width: 260px"
          clearable
        />
        <el-select
          v-model="statusFilter"
          placeholder="状态"
          style="width: 140px"
          clearable
          @clear="statusFilter = 'all'"
        >
          <el-option
            v-for="status in statusOptions"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>
        <el-select
          v-model="trackerFilter"
          placeholder="Tracker"
          style="width: 200px"
          clearable
          @clear="trackerFilter = ''"
        >
          <el-option label="全部 Tracker" value="" />
          <el-option
            v-for="tracker in trackerOptions"
            :key="tracker.value"
            :label="tracker.label"
            :value="tracker.value"
          />
        </el-select>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="displayedTorrents"
      stripe
      style="width: 100%; margin-top: 20px"
      row-key="id"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @row-contextmenu="handleRowContextMenu"
    >
      <el-table-column type="selection" width="48" />
      <el-table-column prop="name" label="名称" min-width="260" sortable="custom" show-overflow-tooltip />
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="percentDone" label="进度" width="120" sortable="custom">
        <template #default="{ row }">
          <el-progress
            :percentage="Math.round(row.percentDone * 100)"
            :status="row.percentDone === 1 ? 'success' : undefined"
          />
        </template>
      </el-table-column>
      <el-table-column prop="totalSize" label="大小" width="140" sortable="custom">
        <template #default="{ row }">
          {{ formatBytes(row.totalSize) }}
        </template>
      </el-table-column>
      <el-table-column prop="uploadRatio" label="分享率" width="110" sortable="custom">
        <template #default="{ row }">
          {{ formatRatio(row.uploadRatio) }}
        </template>
      </el-table-column>
      <el-table-column prop="defaultTracker" label="默认 Tracker" min-width="180" sortable="custom">
        <template #default="{ row }">
          {{ getDefaultTracker(row) }}
        </template>
      </el-table-column>
      <el-table-column prop="peersDownloading" label="下载" width="90" sortable="custom">
        <template #default="{ row }">
          {{ getPeersDownloading(row) }}
        </template>
      </el-table-column>
      <el-table-column prop="peersUploading" label="上传" width="90" sortable="custom">
        <template #default="{ row }">
          {{ getPeersUploading(row) }}
        </template>
      </el-table-column>
      <el-table-column prop="rateDownload" label="下载速度" width="120" sortable="custom">
        <template #default="{ row }">
          {{ formatSpeed(row.rateDownload) }}
        </template>
      </el-table-column>
      <el-table-column prop="rateUpload" label="上传速度" width="120" sortable="custom">
        <template #default="{ row }">
          {{ formatSpeed(row.rateUpload) }}
        </template>
      </el-table-column>
      <el-table-column prop="uploadedEver" label="已上传" width="140" sortable="custom">
        <template #default="{ row }">
          {{ formatBytes(row.uploadedEver || 0) }}
        </template>
      </el-table-column>
      <el-table-column prop="activityDate" label="最后活动" width="170" sortable="custom">
        <template #default="{ row }">
          {{ formatLastActivity(row.activityDate) }}
        </template>
      </el-table-column>
      <el-table-column label="标签" min-width="160">
        <template #default="{ row }">
          <template v-if="row.labels?.length">
            <el-tag v-for="label in row.labels" :key="label" size="small" class="label-tag">
              {{ label }}
            </el-tag>
          </template>
          <span v-else>—</span>
        </template>
      </el-table-column>
    </el-table>

    <div
      v-if="contextMenu.visible"
      class="context-menu"
      :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
      @click.stop
    >
      <button
        v-if="contextMenu.torrent?.status === TorrentStatusEnum.STOPPED"
        @click="handleContextAction('start')"
      >
        开始
      </button>
      <button
        v-else
        @click="handleContextAction('stop')"
      >
        暂停
      </button>
      <button class="danger" @click="handleContextAction('delete')">删除</button>
    </div>

    <!-- 添加种子对话框 -->
    <el-dialog v-model="showAddDialog" title="添加种子" width="500px">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="种子来源">
          <el-radio-group v-model="addForm.type">
            <el-radio label="magnet">磁力链接</el-radio>
            <el-radio label="file">种子文件</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="addForm.type === 'magnet'" label="磁力链接">
          <el-input
            v-model="addForm.magnet"
            type="textarea"
            :rows="3"
            placeholder="magnet:?xt=urn:btih:..."
          />
        </el-form-item>
        <el-form-item v-else label="种子文件">
          <el-upload
            :auto-upload="false"
            :limit="1"
            accept=".torrent"
            :on-change="handleFileChange"
          >
            <el-button :icon="Upload">选择文件</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="下载目录">
          <el-input v-model="addForm.downloadDir" placeholder="留空使用默认目录" />
        </el-form-item>
        <el-form-item label="自动开始">
          <el-switch v-model="addForm.paused" :active-value="false" :inactive-value="true" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddTorrent">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import {
  Plus,
  Refresh,
  Search,
  VideoPlay,
  VideoPause,
  Delete,
  Upload,
} from '@element-plus/icons-vue'
import * as api from '@/api/transmission'
import type { Torrent, TorrentStatus } from '@/types/transmission'
import { TorrentStatusEnum } from '@/types/transmission'
import { getTrackerHost } from '@/utils/torrent'

const REFRESH_INTERVAL = 5000
type StatusFilter = 'all' | TorrentStatus

const statusTextMap: Record<TorrentStatus, string> = {
  [TorrentStatusEnum.STOPPED]: '已停止',
  [TorrentStatusEnum.CHECK_WAIT]: '等待校验',
  [TorrentStatusEnum.CHECK]: '校验中',
  [TorrentStatusEnum.DOWNLOAD_WAIT]: '等待下载',
  [TorrentStatusEnum.DOWNLOAD]: '下载中',
  [TorrentStatusEnum.SEED_WAIT]: '等待做种',
  [TorrentStatusEnum.SEED]: '做种中',
}

const statusOptions: { label: string; value: StatusFilter }[] = [
  { label: '全部状态', value: 'all' },
  { label: statusTextMap[TorrentStatusEnum.STOPPED], value: TorrentStatusEnum.STOPPED },
  { label: statusTextMap[TorrentStatusEnum.CHECK_WAIT], value: TorrentStatusEnum.CHECK_WAIT },
  { label: statusTextMap[TorrentStatusEnum.CHECK], value: TorrentStatusEnum.CHECK },
  { label: statusTextMap[TorrentStatusEnum.DOWNLOAD_WAIT], value: TorrentStatusEnum.DOWNLOAD_WAIT },
  { label: statusTextMap[TorrentStatusEnum.DOWNLOAD], value: TorrentStatusEnum.DOWNLOAD },
  { label: statusTextMap[TorrentStatusEnum.SEED_WAIT], value: TorrentStatusEnum.SEED_WAIT },
  { label: statusTextMap[TorrentStatusEnum.SEED], value: TorrentStatusEnum.SEED },
]

let refreshTimer: number | undefined

const loading = ref(false)
const torrents = ref<Torrent[]>([])
const searchKeyword = ref('')
const showAddDialog = ref(false)
const addForm = ref({
  type: 'magnet',
  magnet: '',
  file: null as File | null,
  downloadDir: '',
  paused: false,
})
const statusFilter = ref<StatusFilter>('all')
const trackerFilter = ref('')
const selectedTorrents = ref<Torrent[]>([])

type SortOrder = 'ascending' | 'descending' | null

const sortState = ref<{ prop: string; order: SortOrder }>({
  prop: '',
  order: null,
})

const hasSelection = computed(() => selectedTorrents.value.length > 0)

const contextMenu = ref<{
  visible: boolean
  x: number
  y: number
  torrent: Torrent | null
}>({
  visible: false,
  x: 0,
  y: 0,
  torrent: null,
})

const getDefaultTracker = (torrent: Torrent): string => {
  const tracker = torrent.trackers?.[0]
  return tracker ? getTrackerHost(tracker.announce) : '—'
}

const getPeersDownloading = (torrent: Torrent): number => {
  return torrent.peersSendingToUs ?? 0
}

const getPeersUploading = (torrent: Torrent): number => {
  return torrent.peersGettingFromUs ?? 0
}

const formatRatio = (ratio: number): string => {
  return (ratio ?? 0).toFixed(2)
}

const formatLastActivity = (timestamp: number): string => {
  if (!timestamp) return '—'
  return dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm')
}

// 筛选后的种子列表
const filteredTorrents = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  return torrents.value.filter((torrent) => {
    const matchesKeyword = keyword ? torrent.name.toLowerCase().includes(keyword) : true
    const matchesStatus =
      statusFilter.value === 'all' || torrent.status === statusFilter.value
    const matchesTracker =
      !trackerFilter.value ||
      (torrent.trackers ?? []).some(
        (tracker) => getTrackerHost(tracker.announce) === trackerFilter.value
      )
    return matchesKeyword && matchesStatus && matchesTracker
  })
})

const getSortValue = (torrent: Torrent, prop?: string) => {
  switch (prop) {
    case 'name':
      return torrent.name.toLowerCase()
    case 'status':
      return torrent.status
    case 'percentDone':
      return torrent.percentDone
    case 'totalSize':
      return torrent.totalSize
    case 'uploadRatio':
      return torrent.uploadRatio
    case 'defaultTracker':
      return getDefaultTracker(torrent)
    case 'peersDownloading':
      return getPeersDownloading(torrent)
    case 'peersUploading':
      return getPeersUploading(torrent)
    case 'rateDownload':
      return torrent.rateDownload
    case 'rateUpload':
      return torrent.rateUpload
    case 'uploadedEver':
      return torrent.uploadedEver ?? 0
    case 'activityDate':
      return torrent.activityDate ?? 0
    default:
      return (torrent as Record<string, any>)[prop || ''] ?? 0
  }
}

const displayedTorrents = computed(() => {
  const base = filteredTorrents.value
  const { prop, order } = sortState.value
  if (!prop || !order) return base
  return [...base].sort((a, b) => {
    const aVal = getSortValue(a, prop)
    const bVal = getSortValue(b, prop)
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const compare = aVal.localeCompare(bVal)
      return order === 'ascending' ? compare : -compare
    }
    const compare = Number(aVal) - Number(bVal)
    return order === 'ascending' ? compare : -compare
  })
})

const trackerOptions = computed(() => {
  const hosts = new Set<string>()
  torrents.value.forEach((torrent) => {
    torrent.trackers?.forEach((tracker) => {
      const host = getTrackerHost(tracker.announce)
      if (host) {
        hosts.add(host)
      }
    })
  })
  return Array.from(hosts)
    .sort((a, b) => a.localeCompare(b))
    .map((host) => ({ label: host, value: host }))
})

const selectedIds = computed(() => selectedTorrents.value.map((torrent) => torrent.id))

const handleSortChange = ({
  prop,
  order,
}: {
  column: any
  prop: string
  order: SortOrder
}) => {
  sortState.value = {
    prop: prop || '',
    order: order || null,
  }
}

const handleSelectionChange = (selection: Torrent[]) => {
  selectedTorrents.value = selection
}

const handleRowContextMenu = (row: Torrent, _column: any, event: MouseEvent) => {
  event.preventDefault()
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    torrent: row,
  }
}

const hideContextMenu = () => {
  contextMenu.value.visible = false
  contextMenu.value.torrent = null
}

// 加载种子列表
const loadTorrents = async (options: { silent?: boolean } = {}) => {
  if (!options.silent) {
    loading.value = true
  }
  try {
    const result = await api.getTorrents()
    torrents.value = result.torrents
  } catch (error: any) {
    ElMessage.error(`加载失败: ${error.message}`)
  } finally {
    if (!options.silent) {
      loading.value = false
    }
  }
}

const startAutoRefresh = () => {
  stopAutoRefresh()
  refreshTimer = window.setInterval(() => {
    loadTorrents({ silent: true })
  }, REFRESH_INTERVAL)
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    window.clearInterval(refreshTimer)
    refreshTimer = undefined
  }
}

const startSelected = async () => {
  if (!selectedIds.value.length) return
  try {
    await api.startTorrents(selectedIds.value)
    ElMessage.success('已开始选中种子')
    loadTorrents()
  } catch (error: any) {
    ElMessage.error(`操作失败: ${error.message}`)
  }
}

const stopSelected = async () => {
  if (!selectedIds.value.length) return
  try {
    await api.stopTorrents(selectedIds.value)
    ElMessage.success('已暂停选中种子')
    loadTorrents()
  } catch (error: any) {
    ElMessage.error(`操作失败: ${error.message}`)
  }
}

const removeSelected = async () => {
  if (!selectedIds.value.length) return
  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${selectedIds.value.length} 个种子？`,
      '删除选中',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await api.removeTorrents(selectedIds.value, false)
    ElMessage.success('已删除选中种子')
    loadTorrents()
  } catch (error: any) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(`删除失败: ${error.message}`)
    }
  }
}

const handleContextAction = (action: 'start' | 'stop' | 'delete') => {
  const torrent = contextMenu.value.torrent
  if (!torrent) return
  hideContextMenu()
  if (action === 'start') {
    startTorrent(torrent.id)
    return
  }
  if (action === 'stop') {
    stopTorrent(torrent.id)
    return
  }
  if (action === 'delete') {
    removeTorrent(torrent.id)
  }
}

// 开始种子
const startTorrent = async (id: number) => {
  try {
    await api.startTorrents([id])
    ElMessage.success('已开始')
    loadTorrents()
  } catch (error: any) {
    ElMessage.error(`操作失败: ${error.message}`)
  }
}

// 暂停种子
const stopTorrent = async (id: number) => {
  try {
    await api.stopTorrents([id])
    ElMessage.success('已暂停')
    loadTorrents()
  } catch (error: any) {
    ElMessage.error(`操作失败: ${error.message}`)
  }
}

// 删除种子
const removeTorrent = async (id: number) => {
  try {
    await ElMessageBox.confirm('是否同时删除本地文件？', '删除种子', {
      confirmButtonText: '删除文件',
      cancelButtonText: '仅删除种子',
      distinguishCancelAndClose: true,
      type: 'warning',
    })
    // 删除文件
    await api.removeTorrents([id], true)
    ElMessage.success('已删除')
    loadTorrents()
  } catch (action) {
    if (action === 'cancel') {
      // 仅删除种子
      await api.removeTorrents([id], false)
      ElMessage.success('已删除')
      loadTorrents()
    }
  }
}

// 文件选择
const handleFileChange = (file: any) => {
  addForm.value.file = file.raw
}

// 添加种子
const handleAddTorrent = async () => {
  try {
    const params: any = {
      paused: addForm.value.paused,
    }

    if (addForm.value.downloadDir) {
      params.downloadDir = addForm.value.downloadDir
    }

    if (addForm.value.type === 'magnet') {
      if (!addForm.value.magnet) {
        ElMessage.warning('请输入磁力链接')
        return
      }
      params.filename = addForm.value.magnet
    } else {
      if (!addForm.value.file) {
        ElMessage.warning('请选择种子文件')
        return
      }
      // 读取文件并转换为 base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = btoa(
          new Uint8Array(e.target!.result as ArrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        )
        params.metainfo = base64
        await api.addTorrent(params)
        ElMessage.success('添加成功')
        showAddDialog.value = false
        loadTorrents()
      }
      reader.readAsArrayBuffer(addForm.value.file)
      return
    }

    await api.addTorrent(params)
    ElMessage.success('添加成功')
    showAddDialog.value = false
    loadTorrents()
  } catch (error: any) {
    ElMessage.error(`添加失败: ${error.message}`)
  }
}

// 获取状态文本
const getStatusText = (status: TorrentStatus): string => {
  return statusTextMap[status] || '未知'
}

// 获取状态类型
const getStatusType = (status: TorrentStatus): string => {
  const typeMap: Record<TorrentStatus, string> = {
    [TorrentStatusEnum.STOPPED]: 'info',
    [TorrentStatusEnum.CHECK_WAIT]: 'warning',
    [TorrentStatusEnum.CHECK]: 'warning',
    [TorrentStatusEnum.DOWNLOAD_WAIT]: 'warning',
    [TorrentStatusEnum.DOWNLOAD]: 'success',
    [TorrentStatusEnum.SEED_WAIT]: 'warning',
    [TorrentStatusEnum.SEED]: 'success',
  }
  return typeMap[status] || 'info'
}

// 格式化字节
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

// 格式化速度
const formatSpeed = (bytes: number): string => {
  if (bytes === 0) return '0 B/s'
  return `${formatBytes(bytes)}/s`
}

onMounted(() => {
  loadTorrents()
  startAutoRefresh()
  window.addEventListener('click', hideContextMenu)
  window.addEventListener('scroll', hideContextMenu, true)
})

onBeforeUnmount(() => {
  stopAutoRefresh()
  window.removeEventListener('click', hideContextMenu)
  window.removeEventListener('scroll', hideContextMenu, true)
})
</script>

<style scoped>
.home-view {
  height: 100%;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.actions-group {
  display: flex;
  gap: 10px;
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  margin-left: auto;
  flex: 1 1 320px;
  justify-content: flex-end;
}

.label-tag {
  margin-right: 4px;
  margin-bottom: 4px;
}

.context-menu {
  position: fixed;
  background-color: #fff;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 8px 0;
  z-index: 2000;
  min-width: 120px;
}

.context-menu button {
  display: block;
  width: 100%;
  padding: 6px 16px;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.context-menu button:hover {
  background-color: #f5f7fa;
}

.context-menu button.danger {
  color: #f56c6c;
}
</style>
