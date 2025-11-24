<template>
  <div class="stats-view">
    <div class="stats-header">
      <h2>数据统计</h2>
      <div class="header-actions">
        <span v-if="lastUpdated">最近更新：{{ lastUpdated }}</span>
        <el-button
          size="small"
          :loading="loading || systemStatusStore.loading"
          @click="loadData()"
        >
          刷新数据
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="summary-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="summary-card">
          <div class="summary-title">总上传量</div>
          <div class="summary-value">{{ formatBytes(totalUploaded) }}</div>
          <div class="summary-subtitle">自 Transmission 记录以来</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="summary-card">
          <div class="summary-title">总下载量</div>
          <div class="summary-value">{{ formatBytes(totalDownloaded) }}</div>
          <div class="summary-subtitle">自 Transmission 记录以来</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="summary-card">
          <div class="summary-title">下载限速</div>
          <div class="summary-value">{{ downloadLimitText }}</div>
          <div class="summary-subtitle">Session 设置 (KB/s)</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="summary-card">
          <div class="summary-title">上传限速</div>
          <div class="summary-value">{{ uploadLimitText }}</div>
          <div class="summary-subtitle">Session 设置 (KB/s)</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="summary-row secondary">
      <el-col :xs="24" :sm="12" :lg="12">
        <el-card class="summary-card summary-text-card">
          <div class="summary-title">下载目录</div>
          <div class="summary-value summary-text" :title="downloadDir || '未知'">
            {{ downloadDir || '未知' }}
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="12">
        <el-card class="summary-card summary-text-card">
          <div class="summary-title">记录天数</div>
          <div class="summary-value">
            {{ historyStore.dailyStats.length }}
          </div>
          <div class="summary-subtitle">从本地存储计算</div>
        </el-card>
      </el-col>
    </el-row>

    <div class="charts-section">
      <div class="chart-header">
        <div>
          <h3>流量图表</h3>
          <p>选择时间范围以查看上传/下载趋势</p>
        </div>
        <el-radio-group v-model="timeRange" size="small">
          <el-radio-button label="1">当天</el-radio-button>
          <el-radio-button label="7">最近7天</el-radio-button>
          <el-radio-button label="30">最近30天</el-radio-button>
        </el-radio-group>
      </div>
      <el-row :gutter="20">
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <span>{{ rangeLabel }}上传/下载趋势</span>
            </template>
            <div v-if="chartDailyStats.length" class="stacked-chart">
              <div
                v-for="item in chartDailyStats"
                :key="item.date"
                class="stacked-bar"
              >
                <div
                  class="bar download"
                  :style="{ height: `${getStackedHeight(item.downloaded)}%` }"
                  :title="`下载 ${formatBytes(item.downloaded)}`"
                />
                <div
                  class="bar upload"
                  :style="{ height: `${getStackedHeight(item.uploaded)}%` }"
                  :title="`上传 ${formatBytes(item.uploaded)}`"
                />
                <span class="bar-label">{{ item.date.slice(5) }}</span>
              </div>
            </div>
            <el-empty v-else description="暂无历史数据" />
          </el-card>
        </el-col>
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <span>{{ rangeLabel }}站点累计（Top 10）</span>
            </template>
            <div v-if="trackerChartData.length" class="grouped-chart">
              <div
                v-for="item in trackerChartData"
                :key="item.tracker"
                class="grouped-row"
              >
                <div class="tracker-label" :title="item.tracker">{{ item.tracker }}</div>
                <div class="grouped-bars">
                  <div
                    class="bar download"
                    :style="{ width: `${getTrackerWidth(item.downloaded)}%` }"
                    :title="`下载 ${formatBytes(item.downloaded)}`"
                  />
                  <div
                    class="bar upload"
                    :style="{ width: `${getTrackerWidth(item.uploaded)}%` }"
                    :title="`上传 ${formatBytes(item.uploaded)}`"
                  />
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无站点数据" />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="20" class="tables-row">
      <el-col :xs="24" :lg="12">
        <el-card class="stats-card">
          <template #header>
            <div class="card-header">
              <span>每日流量</span>
              <small>记录最近 {{ historyStore.dailyStats.length }} 天的数据</small>
            </div>
          </template>
          <el-table
            v-loading="loading"
            :data="tableDailyStats"
            size="small"
            empty-text="暂无历史数据"
          >
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column label="下载">
              <template #default="{ row }">
                {{ formatBytes(row.downloaded) }}
              </template>
            </el-table-column>
            <el-table-column label="上传">
              <template #default="{ row }">
                {{ formatBytes(row.uploaded) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="stats-card">
          <template #header>
            <div class="card-header">
              <span>Tracker 流量汇总</span>
              <small>按种子默认 Tracker 汇总</small>
            </div>
          </template>
          <el-table
            v-loading="loading"
            :data="trackerStats"
            size="small"
            empty-text="暂无种子数据"
          >
            <el-table-column prop="tracker" label="Tracker" min-width="180" />
            <el-table-column label="下载">
              <template #default="{ row }">
                {{ formatBytes(row.downloaded) }}
              </template>
            </el-table-column>
            <el-table-column label="上传">
              <template #default="{ row }">
                {{ formatBytes(row.uploaded) }}
              </template>
            </el-table-column>
            <el-table-column label="分享率">
              <template #default="{ row }">
                {{ (row.ratio || 0).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import * as api from '@/api/transmission'
import type { Torrent } from '@/types/transmission'
import { useStatsStore } from '@/stores/stats'
import { useSystemStatusStore } from '@/stores/systemStatus'
import { getTrackerHost } from '@/utils/torrent'

const loading = ref(false)
const torrents = ref<Torrent[]>([])
const timeRange = ref<'1' | '7' | '30'>('30')

const historyStore = useStatsStore()
const systemStatusStore = useSystemStatusStore()
const { sessionConfig, lastUpdated } = storeToRefs(systemStatusStore)

const totalUploaded = computed(() => historyStore.latestSnapshot?.uploaded || 0)
const totalDownloaded = computed(() => historyStore.latestSnapshot?.downloaded || 0)

const sortedDailyStatsAsc = computed(() =>
  [...historyStore.dailyStats].sort((a, b) => a.date.localeCompare(b.date))
)

const chartDailyStats = computed(() => {
  const data = sortedDailyStatsAsc.value
  if (!data.length) return []
  const limit = Number(timeRange.value)
  return data.slice(-Math.min(limit, data.length))
})

const tableDailyStats = computed(() => {
  return [...historyStore.dailyStats].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30)
})

const downloadDir = computed(() => sessionConfig.value?.['download-dir'] || '')

const downloadLimitText = computed(() => {
  const config = sessionConfig.value
  if (!config) return '未知'
  if (!config['speed-limit-down-enabled']) return '未启用'
  return `${config['speed-limit-down']} KB/s`
})

const uploadLimitText = computed(() => {
  const config = sessionConfig.value
  if (!config) return '未知'
  if (!config['speed-limit-up-enabled']) return '未启用'
  return `${config['speed-limit-up']} KB/s`
})

const trackerStats = computed(() => {
  const trackerMap = new Map<
    string,
    { tracker: string; uploaded: number; downloaded: number }
  >()
  torrents.value.forEach((torrent) => {
    const tracker = torrent.trackers?.[0]
    const host = tracker ? getTrackerHost(tracker.announce) : '未设置'
    if (!trackerMap.has(host)) {
      trackerMap.set(host, { tracker: host, uploaded: 0, downloaded: 0 })
    }
    const entry = trackerMap.get(host)!
    entry.uploaded += torrent.uploadedEver || 0
    entry.downloaded += torrent.downloadedEver || 0
  })
  return Array.from(trackerMap.values())
    .map((entry) => ({
      ...entry,
      ratio: entry.downloaded > 0 ? entry.uploaded / entry.downloaded : 0,
    }))
    .sort((a, b) => b.uploaded - a.uploaded)
})

const trackerChartData = computed(() => {
  const trackerDaily = [...historyStore.trackerDailyStats]
  if (!trackerDaily.length) return []
  const uniqueDates = Array.from(
    new Set(trackerDaily.map((item) => item.date).sort((a, b) => a.localeCompare(b)))
  )
  const limit = Number(timeRange.value)
  const selectedDates = uniqueDates.slice(-Math.min(limit, uniqueDates.length))
  const selectedDateSet = new Set(selectedDates)

  const aggregate = new Map<string, { uploaded: number; downloaded: number }>()
  trackerDaily.forEach((entry) => {
    if (!selectedDateSet.has(entry.date)) return
    if (!aggregate.has(entry.tracker)) {
      aggregate.set(entry.tracker, { uploaded: 0, downloaded: 0 })
    }
    const trackerEntry = aggregate.get(entry.tracker)!
    trackerEntry.uploaded += entry.uploaded
    trackerEntry.downloaded += entry.downloaded
  })

  return Array.from(aggregate.entries())
    .map(([tracker, value]) => ({ tracker, ...value }))
    .sort((a, b) => b.uploaded - a.uploaded)
    .slice(0, 10)
})

const loadTorrents = async () => {
  const torrentData = await api.getTorrents()
  torrents.value = torrentData.torrents
  const trackerAggregate: Record<string, { uploaded: number; downloaded: number }> = {}
  torrents.value.forEach((torrent) => {
    const tracker = torrent.trackers?.[0]
    const host = tracker ? getTrackerHost(tracker.announce) : '未设置'
    if (!trackerAggregate[host]) {
      trackerAggregate[host] = { uploaded: 0, downloaded: 0 }
    }
    trackerAggregate[host].uploaded += torrent.uploadedEver || 0
    trackerAggregate[host].downloaded += torrent.downloadedEver || 0
  })
  historyStore.recordTrackerSnapshot(trackerAggregate)
}

const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([systemStatusStore.load(), loadTorrents()])
  } catch (error: any) {
    ElMessage.error(`加载失败: ${error.message || error}`)
  } finally {
    loading.value = false
  }
}

const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

const stackedMaxValue = computed(() => {
  if (!chartDailyStats.value.length) return 1
  const totals = chartDailyStats.value.map((item) => item.uploaded + item.downloaded)
  return Math.max(...totals, 1)
})

const trackerMaxValue = computed(() => {
  if (!trackerChartData.value.length) return 1
  const values = trackerChartData.value.map((item) =>
    Math.max(item.uploaded, item.downloaded)
  )
  return Math.max(...values, 1)
})

const getStackedHeight = (value: number) => {
  if (!value) return 0
  return Math.max((value / stackedMaxValue.value) * 100, 4)
}

const getTrackerWidth = (value: number) => {
  if (!value) return 0
  return Math.max((value / trackerMaxValue.value) * 100, 6)
}

const rangeLabel = computed(() => {
  if (timeRange.value === '1') return '当天'
  if (timeRange.value === '7') return '最近 7 天'
  return '最近 30 天'
})

onMounted(async () => {
  systemStatusStore.start()
  try {
    await loadData()
  } catch (error: any) {
    ElMessage.error(`加载数据失败: ${error.message || error}`)
  }
})
</script>

<style scoped>
.stats-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #909399;
}

.summary-row {
  margin-top: 10px;
}

.summary-card {
  height: 100%;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.summary-text-card {
  justify-content: flex-start;
}

.summary-title {
  font-size: 14px;
  color: #909399;
}

.summary-value {
  font-size: 24px;
  font-weight: 600;
  margin-top: 8px;
}

.summary-text {
  font-size: 14px;
  font-weight: 400;
  word-break: break-all;
}

.summary-subtitle {
  margin-top: 6px;
  font-size: 12px;
  color: #a0a3a6;
}

.stats-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-weight: 600;
}

.card-header small {
  font-weight: normal;
  color: #909399;
}

.charts-section {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.chart-header h3 {
  margin: 0;
}

.chart-header p {
  margin: 0;
  color: #909399;
  font-size: 13px;
}

.chart-card {
  min-height: 320px;
}

.stacked-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 260px;
  padding: 8px 0;
}

.stacked-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.stacked-bar .bar {
  width: 24px;
  border-radius: 4px;
}

.stacked-bar .bar.download {
  background-color: #67c23a;
}

.stacked-bar .bar.upload {
  background-color: #409eff;
  margin-top: 4px;
}

.stacked-bar .bar-label {
  font-size: 12px;
  color: #606266;
}

.grouped-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 4px;
}

.grouped-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tracker-label {
  flex: 0 0 120px;
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grouped-bars {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.grouped-bars .bar {
  height: 10px;
  border-radius: 4px;
}

.grouped-bars .bar.download {
  background-color: #67c23a;
}

.grouped-bars .bar.upload {
  background-color: #409eff;
}
</style>
