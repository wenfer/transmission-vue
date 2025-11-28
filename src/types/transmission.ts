// Transmission RPC 类型定义

export interface RpcRequest {
  method: string
  arguments?: Record<string, any>
  tag?: number
}

export interface RpcResponse<T = any> {
  result: string
  arguments?: T
  tag?: number
}

export {
  TorrentStatusEnum,
  type TorrentStatus,
  type Torrent,
  type TorrentTracker,
  type TorrentTrackerStat,
  type TorrentFile,
  type TorrentFileStat,
} from './torrent'

export interface FreeSpaceResult {
  path: string
  'size-bytes': number
}

// 会话统计信息
export interface SessionTotals {
  uploadedBytes: number
  downloadedBytes: number
  filesAdded: number
  sessionCount: number
  secondsActive: number
}

export interface SessionStats {
  downloadSpeed: number
  uploadSpeed: number
  activeTorrentCount: number
  pausedTorrentCount: number
  torrentCount: number
  'cumulative-stats': SessionTotals
  'current-stats': SessionTotals
}

export interface PortTestResult {
  'port-is-open': boolean
}

// 会话配置信息
export interface SessionConfig {
  'alt-speed-down': number
  'alt-speed-enabled': boolean
  'alt-speed-up': number
  'alt-speed-time-begin': number
  'alt-speed-time-enabled': boolean
  'alt-speed-time-end': number
  'alt-speed-time-day': number
  'download-dir': string
  'incomplete-dir': string
  'incomplete-dir-enabled': boolean
  'rename-partial-files': boolean
  'start-added-torrents': boolean
  'trash-original-torrent-files': boolean
  'speed-limit-down': number
  'speed-limit-down-enabled': boolean
  'speed-limit-up': number
  'speed-limit-up-enabled': boolean
  'seedRatioLimit': number
  'seedRatioLimited': boolean
  'seedIdleLimit': number
  'seedIdleLimited': boolean
  'peer-limit-per-torrent': number
  'peer-limit-global': number
  'upload-slots-global'?: number
  'upload-slots-per-torrent'?: number
  'peer-port': number
  'peer-port-random-on-start': boolean
  'port-forwarding-enabled': boolean
  'dht-enabled': boolean
  'lpd-enabled': boolean
  'pex-enabled': boolean
  'utp-enabled': boolean
  encryption: 'required' | 'preferred' | 'tolerated'
  'download-queue-size': number
  'download-queue-enabled': boolean
  'seed-queue-size': number
  'seed-queue-enabled': boolean
  'queue-stalled-enabled': boolean
  'queue-stalled-minutes': number
  'max-active-torrents'?: number
  'dont-count-slow-torrents'?: boolean
  'web-ui-username'?: string
  'web-ui-password'?: string
  'web-ui-address'?: string
  'web-ui-port'?: number
  'web-ui-session-timeout'?: number
  'bypass-local-auth'?: boolean
  'web-ui-csrf-protection'?: boolean
  'web-ui-secure-cookie'?: boolean
  'web-ui-max-auth-fail-count'?: number
  'web-ui-ban-duration'?: number
  'alternative-webui-enabled'?: boolean
  'alternative-webui-path'?: string
  'rpc-version': number
  'rpc-version-minimum': number
  'rpc-version-semver'?: string
  'rpc-whitelist-enabled': boolean
  'rpc-whitelist': string
  'rpc-authentication-required': boolean
  'rpc-username': string
  version: string
  // 可以根据需要继续添加更多字段
}
