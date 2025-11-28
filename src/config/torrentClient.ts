type TorrentBackend = 'transmission' | 'qbittorrent'

const resolveBackend = (): TorrentBackend => {
  const envValue = (import.meta.env.VITE_TORRENT_BACKEND ||
    import.meta.env.MODE ||
    'transmission') as string
  return envValue.toLowerCase() === 'qbittorrent' ? 'qbittorrent' : 'transmission'
}

export const torrentBackend: TorrentBackend = resolveBackend()
export const isTransmission = torrentBackend === 'transmission'
export const isQbittorrent = torrentBackend === 'qbittorrent'
export const torrentBackendName = isTransmission ? 'Transmission' : 'qBittorrent'

const defaultBase = isTransmission ? '/transmission/rpc' : '/api/v2'
export const torrentApiBase =
  import.meta.env.VITE_TORRENT_API_BASE?.trim() || defaultBase
