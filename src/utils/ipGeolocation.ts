/**
 * IP 地理位置查询工具
 * 使用免费 API 查询 IP 所在国家，并提供本地缓存
 */

interface GeoLocationResult {
  countryCode: string // 国家代码，如 'CN', 'US'
  country: string // 国家名称
  flag: string // 国旗 emoji
}

// 内存缓存
const geoCache = new Map<string, GeoLocationResult>()

// 国家代码到国旗 emoji 的映射
const countryCodeToFlag = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return '🌐'

  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))

  return String.fromCodePoint(...codePoints)
}

// 国家代码到中文名称的映射（常用国家）
const countryNames: Record<string, string> = {
  'CN': '中国',
  'US': '美国',
  'JP': '日本',
  'KR': '韩国',
  'TW': '台湾',
  'HK': '香港',
  'SG': '新加坡',
  'GB': '英国',
  'DE': '德国',
  'FR': '法国',
  'CA': '加拿大',
  'AU': '澳大利亚',
  'RU': '俄罗斯',
  'NL': '荷兰',
  'SE': '瑞典',
  'IN': '印度',
  'BR': '巴西',
  'IT': '意大利',
  'ES': '西班牙',
  'MY': '马来西亚',
  'TH': '泰国',
  'PH': '菲律宾',
  'VN': '越南',
  'ID': '印度尼西亚',
  'UA': '乌克兰',
  'PL': '波兰',
  'TR': '土耳其',
  'MX': '墨西哥',
  'AR': '阿根廷',
  'CL': '智利',
  'NZ': '新西兰',
  'ZA': '南非',
  'CH': '瑞士',
  'AT': '奥地利',
  'BE': '比利时',
  'NO': '挪威',
  'DK': '丹麦',
  'FI': '芬兰',
  'IE': '爱尔兰',
  'PT': '葡萄牙',
  'GR': '希腊',
  'CZ': '捷克',
  'HU': '匈牙利',
  'RO': '罗马尼亚',
}

/**
 * 验证 IP 地址格式
 */
const isValidIP = (ip: string): boolean => {
  // IPv4
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  // IPv6 简化验证
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/

  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

/**
 * 判断是否为内网 IP
 */
const isPrivateIP = (ip: string): boolean => {
  // 常见内网 IP 段
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./,
    /^::1$/, // IPv6 loopback
    /^fe80:/, // IPv6 link-local
    /^fc00:/, // IPv6 unique local
  ]

  return privateRanges.some(range => range.test(ip))
}

/**
 * 使用 ip-api.com 查询 IP 地理位置（免费，无需 API key）
 */
const queryIPAPI = async (ip: string): Promise<GeoLocationResult | null> => {
  try {
    // 使用 https 协议（ip-api.com 支持 https，但免费版有限制）
    // 如果当前页面是 https，使用 https；否则使用 http
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
    const response = await fetch(`${protocol}//ip-api.com/json/${ip}?fields=status,countryCode,country`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.warn(`IP API 请求失败: ${response.status}`)
      return null
    }

    const data = await response.json()

    if (data.status === 'success' && data.countryCode) {
      return {
        countryCode: data.countryCode,
        country: countryNames[data.countryCode] || data.country || data.countryCode,
        flag: countryCodeToFlag(data.countryCode),
      }
    }

    return null
  } catch (error) {
    console.warn('IP 地理位置查询失败:', error)
    return null
  }
}

/**
 * 获取 IP 的地理位置信息
 * @param ip IP 地址
 * @returns 地理位置信息，如果查询失败则返回 null
 */
export const getIPGeolocation = async (ip: string): Promise<GeoLocationResult | null> => {
  // 验证 IP 格式
  if (!isValidIP(ip)) {
    return null
  }

  // 检查是否为内网 IP
  if (isPrivateIP(ip)) {
    return {
      countryCode: 'LAN',
      country: '局域网',
      flag: '🏠',
    }
  }

  // 检查缓存
  if (geoCache.has(ip)) {
    return geoCache.get(ip)!
  }

  // 查询 API
  const result = await queryIPAPI(ip)

  // 缓存结果（即使失败也缓存，避免重复查询）
  if (result) {
    geoCache.set(ip, result)
  } else {
    // 查询失败时缓存一个默认值
    const defaultResult: GeoLocationResult = {
      countryCode: 'UN',
      country: '未知',
      flag: '🌐',
    }
    geoCache.set(ip, defaultResult)
    return defaultResult
  }

  return result
}

/**
 * 批量查询 IP 地理位置（带延迟，避免触发 API 限制）
 * @param ips IP 地址数组
 * @param delayMs 每次查询之间的延迟（毫秒）
 * @returns 地理位置信息数组
 */
export const batchGetIPGeolocation = async (
  ips: string[],
  delayMs: number = 100
): Promise<Map<string, GeoLocationResult | null>> => {
  const results = new Map<string, GeoLocationResult | null>()

  for (const ip of ips) {
    // 先检查缓存
    if (geoCache.has(ip)) {
      results.set(ip, geoCache.get(ip)!)
      continue
    }

    // 查询并延迟
    const result = await getIPGeolocation(ip)
    results.set(ip, result)

    // 添加延迟（除了最后一个）
    if (ip !== ips[ips.length - 1]) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return results
}

/**
 * 清除缓存
 */
export const clearGeoCache = (): void => {
  geoCache.clear()
}

/**
 * 获取缓存统计
 */
export const getGeoCacheStats = () => {
  return {
    size: geoCache.size,
    ips: Array.from(geoCache.keys()),
  }
}
