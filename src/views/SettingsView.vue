<template>
  <div class="settings-view">
    <el-card header="全局设置">
      <el-form v-loading="loading" :model="settings" label-width="180px" class="settings-form">
        <section class="settings-section">
          <div class="section-header">
            <h3>下载与文件</h3>
            <p>配置默认存储目录与文件处理策略</p>
          </div>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="下载目录">
                <el-input v-model="settings['download-dir']" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="未完成目录">
                <el-switch v-model="settings['incomplete-dir-enabled']" />
                <el-input
                  v-model="settings['incomplete-dir']"
                  :disabled="!settings['incomplete-dir-enabled']"
                  placeholder=".../Incomplete"
                  class="inline-input"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :md="8">
              <el-form-item label="新增种子自动开始">
                <el-switch v-model="settings['start-added-torrents']" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="8">
              <el-form-item label="重命名部分文件">
                <el-switch v-model="settings['rename-partial-files']" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="8">
              <el-form-item label="删除原始种子文件">
                <el-switch v-model="settings['trash-original-torrent-files']" />
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="settings-section">
          <div class="section-header">
            <h3>速度与分享</h3>
            <p>控制全局限速、备用限速及分享策略</p>
          </div>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="下载限速 (KB/s)">
                <el-switch v-model="settings['speed-limit-down-enabled']" />
                <el-input-number
                  v-model="settings['speed-limit-down']"
                  :disabled="!settings['speed-limit-down-enabled']"
                  :min="0"
                  class="inline-number"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="上传限速 (KB/s)">
                <el-switch v-model="settings['speed-limit-up-enabled']" />
                <el-input-number
                  v-model="settings['speed-limit-up']"
                  :disabled="!settings['speed-limit-up-enabled']"
                  :min="0"
                  class="inline-number"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :md="6">
              <el-form-item label="启用备用限速">
                <el-switch v-model="settings['alt-speed-enabled']" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="6">
              <el-form-item label="备用下载 (KB/s)">
                <el-input-number v-model="settings['alt-speed-down']" :min="0" class="full-width" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="6">
              <el-form-item label="备用上传 (KB/s)">
                <el-input-number v-model="settings['alt-speed-up']" :min="0" class="full-width" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="6">
              <el-form-item label="备用限速计划">
                <el-switch v-model="settings['alt-speed-time-enabled']" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :md="6">
              <el-form-item label="开始时间">
                <el-time-select
                  v-model="altSpeedBeginTime"
                  start="00:00"
                  end="23:30"
                  step="00:30"
                  :disabled="!settings['alt-speed-time-enabled']"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="6">
              <el-form-item label="结束时间">
                <el-time-select
                  v-model="altSpeedEndTime"
                  start="00:00"
                  end="23:30"
                  step="00:30"
                  :disabled="!settings['alt-speed-time-enabled']"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="生效星期">
                <el-select
                  v-model="altSpeedDays"
                  multiple
                  collapse-tags
                  :disabled="!settings['alt-speed-time-enabled']"
                  placeholder="选择生效的天"
                  class="full-width"
                >
                  <el-option
                    v-for="day in dayOptions"
                    :key="day.value"
                    :label="day.label"
                    :value="day.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="分享率限制">
                <el-switch v-model="settings['seedRatioLimited']" />
                <el-input-number
                  v-model="settings['seedRatioLimit']"
                  :disabled="!settings['seedRatioLimited']"
                  :min="0"
                  :step="0.1"
                  class="inline-number"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="做种空闲限制 (分钟)">
                <el-switch v-model="settings['seedIdleLimited']" />
                <el-input-number
                  v-model="settings['seedIdleLimit']"
                  :disabled="!settings['seedIdleLimited']"
                  :min="0"
                  class="inline-number"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="settings-section">
          <div class="section-header">
            <h3>连接与端口</h3>
            <p>控制 Peer 端口、网络协议支持及安全性</p>
          </div>
          <div class="connection-grid">
            <div class="connection-card">
              <label>Peer 端口</label>
              <el-input-number v-model="settings['peer-port']" :min="1" :max="65535" />
            </div>
            <div class="connection-card">
              <label>端口映射</label>
              <el-switch v-model="settings['port-forwarding-enabled']" />
            </div>
            <div class="connection-card">
              <label>启动时随机端口</label>
              <el-switch v-model="settings['peer-port-random-on-start']" />
            </div>
            <div class="connection-card port-test-card">
              <label>端口连通性</label>
              <div class="port-test">
                <el-button size="small" :loading="testingPort" @click="handleTestPort">
                  测试端口
                </el-button>
                <el-tag
                  v-if="portTestResult !== null"
                  :type="portTestResult ? 'success' : 'danger'"
                  effect="plain"
                >
                  {{ portTestResult ? '端口开放' : '端口关闭' }}
                </el-tag>
                <span v-if="portTestMessage" class="port-test-message">{{ portTestMessage }}</span>
              </div>
            </div>
            <div class="connection-card">
              <label>全局 Peer 上限</label>
              <el-input-number v-model="settings['peer-limit-global']" :min="1" />
            </div>
            <div class="connection-card">
              <label>单种 Peer 上限</label>
              <el-input-number v-model="settings['peer-limit-per-torrent']" :min="1" />
            </div>
            <div class="connection-card">
              <label>加密策略</label>
              <el-select v-model="settings.encryption" class="full-width">
                <el-option
                  v-for="option in encryptionOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </div>
            <div class="connection-card protocol-card">
              <label>协议支持</label>
              <div class="protocol-toggles">
                <div class="protocol-row">
                  <el-tag size="small">DHT</el-tag>
                  <el-switch v-model="settings['dht-enabled']" />
                </div>
                <div class="protocol-row">
                  <el-tag size="small">PEX</el-tag>
                  <el-switch v-model="settings['pex-enabled']" />
                </div>
                <div class="protocol-row">
                  <el-tag size="small">LPD</el-tag>
                  <el-switch v-model="settings['lpd-enabled']" />
                </div>
                <div class="protocol-row">
                  <el-tag size="small">uTP</el-tag>
                  <el-switch v-model="settings['utp-enabled']" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="settings-section">
          <div class="section-header">
            <h3>队列与调度</h3>
            <p>限制同时运行的任务数量并检测卡住的任务</p>
          </div>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="下载队列大小">
                <el-switch v-model="settings['download-queue-enabled']" />
                <el-input-number
                  v-model="settings['download-queue-size']"
                  :disabled="!settings['download-queue-enabled']"
                  :min="0"
                  class="inline-number"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="做种队列大小">
                <el-switch v-model="settings['seed-queue-enabled']" />
                <el-input-number
                  v-model="settings['seed-queue-size']"
                  :disabled="!settings['seed-queue-enabled']"
                  :min="0"
                  class="inline-number"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="检测卡住任务">
                <el-switch v-model="settings['queue-stalled-enabled']" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="卡住最小分钟">
                <el-input-number v-model="settings['queue-stalled-minutes']" :min="0" />
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="settings-section">
          <div class="section-header">
            <h3>RPC 与访问控制</h3>
            <p>限制哪些客户端可以访问 Transmission 并设置认证信息</p>
          </div>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="需要认证">
                <el-switch v-model="settings['rpc-authentication-required']" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="用户名">
                <el-input v-model="settings['rpc-username']" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="启用白名单">
                <el-switch v-model="settings['rpc-whitelist-enabled']" />
              </el-form-item>
            </el-col>
            <el-col :xs="24">
              <el-form-item label="访问白名单（逗号分隔）">
                <el-input
                  v-model="settings['rpc-whitelist']"
                  type="textarea"
                  :rows="3"
                  placeholder="127.0.0.1,192.168.*.*"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :md="8">
              <el-form-item label="Transmission 版本">
                <span class="readonly-value">{{ settings.version || '未知' }}</span>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="8">
              <el-form-item label="RPC 版本">
                <span class="readonly-value">{{ settings['rpc-version'] ?? '未知' }}</span>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="8">
              <el-form-item label="RPC 最低版本">
                <span class="readonly-value">{{ settings['rpc-version-minimum'] ?? '未知' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <el-form-item class="actions">
          <el-button type="primary" @click="saveSettings">保存设置</el-button>
          <el-button @click="loadSettings">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import * as api from '@/api/transmission'
import type { SessionConfig } from '@/types/transmission'

const loading = ref(false)
const settings = ref<Partial<SessionConfig>>({})
const encryptionOptions = [
  { label: '需要 (required)', value: 'required' },
  { label: '优先 (preferred)', value: 'preferred' },
  { label: '允许明文 (tolerated)', value: 'tolerated' },
]
const dayOptions = [
  { label: '周一', value: 2 },
  { label: '周二', value: 4 },
  { label: '周三', value: 8 },
  { label: '周四', value: 16 },
  { label: '周五', value: 32 },
  { label: '周六', value: 64 },
  { label: '周日', value: 1 },
]
const testingPort = ref(false)
const portTestResult = ref<boolean | null>(null)
const portTestMessage = ref('')

const editableFields: (keyof SessionConfig)[] = [
  'download-dir',
  'incomplete-dir',
  'incomplete-dir-enabled',
  'rename-partial-files',
  'start-added-torrents',
  'trash-original-torrent-files',
  'speed-limit-down',
  'speed-limit-down-enabled',
  'speed-limit-up',
  'speed-limit-up-enabled',
  'alt-speed-enabled',
  'alt-speed-down',
  'alt-speed-up',
  'alt-speed-time-begin',
  'alt-speed-time-enabled',
  'alt-speed-time-end',
  'alt-speed-time-day',
  'seedRatioLimited',
  'seedRatioLimit',
  'seedIdleLimited',
  'seedIdleLimit',
  'peer-limit-per-torrent',
  'peer-limit-global',
  'peer-port',
  'peer-port-random-on-start',
  'port-forwarding-enabled',
  'dht-enabled',
  'lpd-enabled',
  'pex-enabled',
  'utp-enabled',
  'encryption',
  'download-queue-size',
  'download-queue-enabled',
  'seed-queue-size',
  'seed-queue-enabled',
  'queue-stalled-enabled',
  'queue-stalled-minutes',
  'rpc-whitelist',
  'rpc-whitelist-enabled',
  'rpc-authentication-required',
  'rpc-username',
]

const minutesToTime = (minutes?: number) => {
  if (minutes === undefined) return '00:00'
  const mins = Math.max(0, Math.min(1439, minutes))
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const timeToMinutes = (time: string) => {
  const [hStr = '0', mStr = '0'] = (time || '').split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  if (Number.isNaN(h) || Number.isNaN(m)) return 0
  return h * 60 + m
}

const altSpeedBeginTime = computed({
  get: () => minutesToTime(settings.value['alt-speed-time-begin']),
  set: (value: string) => {
    settings.value['alt-speed-time-begin'] = timeToMinutes(value)
  },
})

const altSpeedEndTime = computed({
  get: () => minutesToTime(settings.value['alt-speed-time-end']),
  set: (value: string) => {
    settings.value['alt-speed-time-end'] = timeToMinutes(value)
  },
})

const altSpeedDays = computed({
  get: () => {
    const dayMask = settings.value['alt-speed-time-day'] ?? 0
    return dayOptions.filter((day) => (dayMask & day.value) !== 0).map((day) => day.value)
  },
  set: (values: number[]) => {
    settings.value['alt-speed-time-day'] = values.reduce((sum, val) => sum + val, 0)
  },
})

// 加载设置
const loadSettings = async () => {
  loading.value = true
  try {
    const result = await api.getSession()
    settings.value = result
  } catch (error: any) {
    ElMessage.error(`加载失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

// 保存设置
const saveSettings = async () => {
  loading.value = true
  try {
    const payload: Partial<SessionConfig> = {}
    editableFields.forEach((key) => {
      const value = settings.value[key]
      if (value !== undefined) {
        ;(payload as Record<string, any>)[key as string] = value
      }
    })
    await api.setSession(payload)
    ElMessage.success('保存成功')
    loadSettings()
  } catch (error: any) {
    ElMessage.error(`保存失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const handleTestPort = async () => {
  testingPort.value = true
  portTestMessage.value = ''
  try {
    const result = await api.testPort()
    portTestResult.value = result['port-is-open']
    portTestMessage.value = result['port-is-open']
      ? '端口开放，可以接受外部连接'
      : '端口关闭，请检查路由或防火墙'
    if (result['port-is-open']) {
      ElMessage.success('端口开放')
    } else {
      ElMessage.warning('端口未开放，请检查映射')
    }
  } catch (error: any) {
    portTestResult.value = null
    portTestMessage.value = '测试失败'
    ElMessage.error(`测试失败: ${error.message || error}`)
  } finally {
    testingPort.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings-view {
  max-width: 1100px;
  margin: 0 auto;
}

.settings-form .inline-input {
  margin-left: 12px;
  flex: 1;
}

.settings-form .inline-number {
  margin-left: 12px;
}

.full-width {
  width: 100%;
}

.readonly-value {
  font-weight: 500;
}

.actions {
  margin-top: 20px;
}

.settings-section {
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 24px;
  background: #fff;
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
}

.section-header p {
  margin: 0;
  color: #909399;
  font-size: 13px;
}

.protocol-toggles {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.port-test {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.port-test-message {
  color: #909399;
  font-size: 12px;
}

.connection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.connection-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 120px;
}

.connection-card label {
  font-weight: 600;
  color: #606266;
}

.protocol-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
