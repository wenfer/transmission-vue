interface TrackerSite {
  name: string
  trackers: string[]
}

interface TrackerSitesConfig {
  sites: TrackerSite[]
}

// 构建 tracker host 到站点名称的映射
const trackerToSiteMap = new Map<string, string>()
let configLoaded = false
let configLoading: Promise<void> | null = null

/**
 * 异步加载 tracker 站点配置
 */
async function loadTrackerSitesConfig(): Promise<void> {
  if (configLoaded) return
  if (configLoading) return configLoading

  configLoading = (async () => {
    try {
      // 使用 BASE_URL 确保路径在开发和生产环境都正确
      const baseUrl = import.meta.env.BASE_URL || '/'
      const url = `${baseUrl}trackerSites.json`.replace(/\/+/g, '/').replace(':/', '://')

      const response = await fetch(url)
      if (!response.ok) {
        console.warn('Failed to load trackerSites.json, using empty config')
        configLoaded = true
        return
      }
      const config: TrackerSitesConfig = await response.json()

      // 清空并重新构建映射
      trackerToSiteMap.clear()
      config.sites.forEach(site => {
        site.trackers.forEach(tracker => {
          trackerToSiteMap.set(tracker.toLowerCase(), site.name)
        })
      })

      configLoaded = true
    } catch (error) {
      console.error('Error loading trackerSites.json:', error)
      configLoaded = true // 即使失败也标记为已加载，避免重复尝试
    }
  })()

  return configLoading
}

// 应用启动时立即开始加载配置
loadTrackerSitesConfig()

export const getTrackerHost = (announce: string): string => {
  try {
    const url = new URL(announce)
    return url.host || announce
  } catch {
    return announce
  }
}

/**
 * 获取 tracker 的显示名称
 * 如果配置中有站点映射则返回站点名称，否则返回 tracker host
 */
export const getTrackerDisplayName = (announce: string): string => {
  const host = getTrackerHost(announce)
  const siteName = trackerToSiteMap.get(host.toLowerCase())
  return siteName || host
}

/**
 * 根据站点名称或 tracker host 进行匹配
 */
export const matchesTrackerFilter = (announce: string, filter: string): boolean => {
  if (!filter) return true
  const host = getTrackerHost(announce)
  const siteName = trackerToSiteMap.get(host.toLowerCase())
  // 如果有站点名称，则按站点名称匹配，否则按 host 匹配
  return siteName ? siteName === filter : host === filter
}

/**
 * 确保配置已加载（用于需要等待配置的场景）
 */
export const ensureTrackerConfigLoaded = async (): Promise<void> => {
  await loadTrackerSitesConfig()
}

/**
 * 重新加载配置（用于动态更新配置的场景）
 */
export const reloadTrackerSitesConfig = async (): Promise<void> => {
  configLoaded = false
  configLoading = null
  trackerToSiteMap.clear()
  await loadTrackerSitesConfig()
}
