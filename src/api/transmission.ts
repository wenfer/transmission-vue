import { transmissionClient } from './client'
import type {
  Torrent,
  SessionStats,
  SessionConfig,
  FreeSpaceResult,
  PortTestResult,
} from '@/types/transmission'

/**
 * 获取种子列表
 */
export const getTorrents = (fields?: string[]) => {
  const defaultFields = [
    'id',
    'name',
    'status',
    'totalSize',
    'percentDone',
    'rateDownload',
    'rateUpload',
    'uploadRatio',
    'eta',
    'peersConnected',
    'peersSendingToUs',
    'peersGettingFromUs',
    'addedDate',
    'doneDate',
    'error',
    'errorString',
    'downloadDir',
    'hashString',
    'trackers',
    'uploadedEver',
    'downloadedEver',
    'activityDate',
    'labels',
  ]

  return transmissionClient.request<{ torrents: Torrent[] }>('torrent-get', {
    fields: fields || defaultFields,
  })
}

/**
 * 添加种子（通过文件内容）
 */
export const addTorrent = (params: {
  filename?: string // 磁力链接或 URL
  metainfo?: string // base64 编码的种子文件内容
  downloadDir?: string
  paused?: boolean
}) => {
  return transmissionClient.request('torrent-add', params)
}

/**
 * 启动种子
 */
export const startTorrents = (ids: number[]) => {
  return transmissionClient.request('torrent-start', { ids })
}

/**
 * 暂停种子
 */
export const stopTorrents = (ids: number[]) => {
  return transmissionClient.request('torrent-stop', { ids })
}

/**
 * 删除种子
 */
export const removeTorrents = (ids: number[], deleteLocalData = false) => {
  return transmissionClient.request('torrent-remove', {
    ids,
    'delete-local-data': deleteLocalData,
  })
}

/**
 * 获取会话统计信息
 */
export const getSessionStats = () => {
  return transmissionClient.request<SessionStats>('session-stats')
}

/**
 * 获取会话配置
 */
export const getSession = () => {
  return transmissionClient.request<SessionConfig>('session-get')
}

/**
 * 设置会话配置
 */
export const setSession = (params: Partial<SessionConfig>) => {
  return transmissionClient.request('session-set', params)
}

/**
 * 测试当前监听端口是否开放
 */
export const testPort = () => {
  return transmissionClient.request<PortTestResult>('port-test')
}

/**
 * 获取指定路径的可用空间
 */
export const getFreeSpace = (path: string) => {
  return transmissionClient.request<FreeSpaceResult>('free-space', {
    path,
  })
}

/**
 * 验证连接（测试 RPC 是否可用）
 */
export const testConnection = () => {
  return transmissionClient.request('session-get')
}
