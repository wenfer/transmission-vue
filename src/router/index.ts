import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useConnectionStore } from '@/stores/connection'

const resolveBase = () => {
  const base = import.meta.env.BASE_URL || '/'
  if (base.startsWith('.') && typeof window !== 'undefined') {
    const url = new URL(base, window.location.href)
    return url.pathname
  }
  return base
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: '种子列表', requiresAuth: true },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/SettingsView.vue'),
        meta: { title: '设置', requiresAuth: true },
      },
      {
        path: 'stats',
        name: 'Stats',
        component: () => import('@/views/StatsView.vue'),
        meta: { title: '数据统计', requiresAuth: true },
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '连接服务器' },
  },
]

const router = createRouter({
  history: createWebHistory(resolveBase()),
  routes,
})

// 路由守卫：检查认证状态
router.beforeEach((to, _from, next) => {
  const connectionStore = useConnectionStore()

  // 页面需要认证但未连接
  if (to.meta.requiresAuth && !connectionStore.isConnected) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && connectionStore.isConnected) {
    // 已登录用户访问登录页，重定向到首页
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
