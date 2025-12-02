/**
 * 配置导出导入工具
 * 支持将配置导出为 JSON 文件，以及从 JSON 文件导入配置
 */

/**
 * 导出配置为 JSON 文件
 * @param config 配置对象
 * @param filename 文件名（不含扩展名）
 */
export function exportConfig(config: Record<string, any>, filename: string = 'config'): void {
  try {
    // 将配置对象转换为 JSON 字符串（格式化，方便阅读）
    const jsonStr = JSON.stringify(config, null, 2)

    // 创建 Blob 对象
    const blob = new Blob([jsonStr], { type: 'application/json' })

    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.json`

    // 触发下载
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出配置失败:', error)
    throw new Error('导出配置失败')
  }
}

/**
 * 从 JSON 文件导入配置
 * @returns Promise，resolve 时返回配置对象
 */
export function importConfig(): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    try {
      // 创建文件选择器
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json,application/json'

      input.onchange = async (event) => {
        try {
          const file = (event.target as HTMLInputElement).files?.[0]
          if (!file) {
            reject(new Error('未选择文件'))
            return
          }

          // 读取文件内容
          const text = await file.text()

          // 解析 JSON
          const config = JSON.parse(text)

          // 验证是否为对象
          if (typeof config !== 'object' || config === null) {
            reject(new Error('配置文件格式无效'))
            return
          }

          resolve(config)
        } catch (error) {
          console.error('读取配置文件失败:', error)
          if (error instanceof SyntaxError) {
            reject(new Error('配置文件 JSON 格式错误'))
          } else {
            reject(new Error('读取配置文件失败'))
          }
        } finally {
          // 清理
          document.body.removeChild(input)
        }
      }

      input.oncancel = () => {
        document.body.removeChild(input)
        reject(new Error('用户取消选择文件'))
      }

      // 触发文件选择
      document.body.appendChild(input)
      input.click()
    } catch (error) {
      console.error('导入配置失败:', error)
      reject(new Error('导入配置失败'))
    }
  })
}

/**
 * 验证并过滤配置对象，只保留指定的字段
 * @param config 原始配置对象
 * @param allowedFields 允许的��段列表
 * @returns 过滤后的配置对象
 */
export function filterConfig<T extends Record<string, any>>(
  config: Record<string, any>,
  allowedFields: (keyof T)[]
): Partial<T> {
  const filtered: Partial<T> = {}

  allowedFields.forEach((field) => {
    const key = field as string
    if (key in config && config[key] !== undefined) {
      (filtered as any)[field] = config[key]
    }
  })

  return filtered
}
