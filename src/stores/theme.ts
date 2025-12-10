import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeType = 'green' | 'blue' | 'pink'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeType>('green')

  // 从 localStorage 加载主题
  const loadTheme = () => {
    const savedTheme = localStorage.getItem('app-theme') as ThemeType | 'fresh' | 'default'
    // 兼容旧的主题名称
    if (savedTheme === 'fresh' || savedTheme === 'default') {
      currentTheme.value = 'green'
      localStorage.setItem('app-theme', 'green')
    } else if (savedTheme === 'green' || savedTheme === 'blue' || savedTheme === 'pink') {
      currentTheme.value = savedTheme
      applyTheme(savedTheme)
    }
  }

  // 应用主题到 HTML 根元素
  const applyTheme = (theme: ThemeType) => {
    document.documentElement.setAttribute('data-theme', theme)
  }

  // 切换主题
  const setTheme = (theme: ThemeType) => {
    currentTheme.value = theme
    localStorage.setItem('app-theme', theme)
    applyTheme(theme)
  }

  // 监听主题变化
  watch(currentTheme, (newTheme) => {
    applyTheme(newTheme)
  })

  return {
    currentTheme,
    loadTheme,
    setTheme,
  }
})
