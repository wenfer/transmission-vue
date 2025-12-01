type TorrentBackend = 'transmission' | 'qbittorrent'

// 使用构建时注入的全局变量
export const torrentBackend: TorrentBackend = __TORRENT_BACKEND__
export const isTransmission = torrentBackend === 'transmission'
export const isQbittorrent = torrentBackend === 'qbittorrent'
export const torrentBackendName = isTransmission ? 'Transmission' : 'qBittorrent'

const defaultBase = isTransmission ? '/transmission/rpc' : '/api/v2'
export const torrentApiBase = defaultBase

console.log('[Torrent Client] Config:', {
  backend: torrentBackend,
  isTransmission,
  isQbittorrent,
  torrentApiBase,
  '__TORRENT_BACKEND__': __TORRENT_BACKEND__,
})
