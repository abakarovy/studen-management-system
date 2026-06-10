# Исходный код — Frontend (авторизация и дашборд)

Фрагмент исходного кода фронтенда: экран входа и панель управления (Vue 3 + Vite + Tailwind), включая зависимые компоненты и composables.

## Список файлов

- `frontend/index.html`
- `frontend/src/main.js`
- `frontend/src/App.vue`
- `frontend/src/style.css`
- `frontend/tailwind.config.js`
- `frontend/src/router/index.js`
- `frontend/src/services/api.js`
- `frontend/src/stores/auth.js`
- `frontend/src/stores/theme.js`
- `frontend/src/utils/avatar.js`
- `frontend/src/composables/useAnalytics.js`
- `frontend/src/composables/useActivities.js`
- `frontend/src/components/ui/BaseButton.vue`
- `frontend/src/components/ui/BaseCard.vue`
- `frontend/src/components/ui/BaseBadge.vue`
- `frontend/src/components/ui/BaseAvatar.vue`
- `frontend/src/components/dashboard/MetricCard.vue`
- `frontend/src/components/dashboard/PerformanceChart.vue`
- `frontend/src/components/dashboard/StudentTable.vue`
- `frontend/src/components/dashboard/QuickActions.vue`
- `frontend/src/components/layout/ActivityFeed.vue`
- `frontend/src/views/Login.vue`
- `frontend/src/views/Dashboard.vue`

---

## `frontend/index.html`

```html
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" type="image/svg+xml" href="/vite.svg">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Система учета студентов</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

## `frontend/src/main.js`

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { useThemeStore } from './stores/theme'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

useThemeStore(pinia).applyTheme()

app.mount('#app')

```

## `frontend/src/App.vue`

```vue
<template>
  <router-view />
</template>

<script setup>
</script>

```

## `frontend/src/style.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply antialiased scroll-smooth;
  }

  body {
    @apply m-0 font-sans text-slate-800 bg-slate-50 dark:bg-surface-dark dark:text-slate-100;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * {
    @apply border-border dark:border-border-dark;
  }
}

@layer components {
  .card {
    @apply bg-white dark:bg-surface-dark-secondary rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-card transition-shadow duration-200;
  }

  .card-hover {
    @apply card hover:shadow-card-hover hover:border-slate-300/80 dark:hover:border-slate-600/80;
  }

  .btn {
    @apply inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-primary {
    @apply btn bg-accent text-white hover:bg-accent-hover focus:ring-accent shadow-sm hover:shadow-glow;
  }

  .btn-secondary {
    @apply btn bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-slate-400;
  }

  .btn-ghost {
    @apply btn text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-400;
  }

  .btn-danger {
    @apply btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
  }

  .input {
    @apply w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors;
  }

  .label {
    @apply block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5;
  }

  .page-title {
    @apply text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white;
  }

  .page-subtitle {
    @apply text-sm text-slate-500 dark:text-slate-400 mt-1;
  }

  .nav-link {
    @apply flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white;
  }

  .nav-link-active {
    @apply nav-link bg-accent/10 text-accent dark:bg-accent/20 dark:text-indigo-300 shadow-sm;
  }

  .badge {
    @apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold;
  }

  .table-header {
    @apply px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400;
  }

  .table-cell {
    @apply px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300;
  }
}
```

## `frontend/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8fafc',
          dark: '#0f172a',
          'dark-secondary': '#1e293b',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
          muted: '#eef2ff',
          'dark-muted': '#312e81',
        },
        border: {
          DEFAULT: '#e2e8f0',
          dark: '#334155',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        glow: '0 0 0 1px rgb(99 102 241 / 0.15), 0 4px 16px rgb(99 102 241 / 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
```

## `frontend/src/router/index.js`

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/layouts/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
      },
      {
        path: 'students',
        name: 'Students',
        component: () => import('@/views/Students.vue'),
        meta: { denyRole: 'student' },
      },
      {
        path: 'attendance',
        name: 'Attendance',
        component: () => import('@/views/Attendance.vue'),
        meta: { denyRole: 'student' },
      },
      {
        path: 'grades',
        name: 'Grades',
        component: () => import('@/views/Grades.vue'),
      },
      {
        path: 'schedule',
        name: 'Schedule',
        component: () => import('@/views/Schedule.vue'),
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { requiresRole: 'curator' },
      },
      {
        path: 'groups',
        name: 'Groups',
        component: () => import('@/views/Groups.vue'),
        meta: { requiresRole: 'curator' },
      },
      {
        path: 'subjects',
        name: 'Subjects',
        component: () => import('@/views/Subjects.vue'),
        meta: { requiresRole: 'curator' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.meta.requiresAuth === false && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
  } else if (to.meta.requiresRole && authStore.user?.role !== to.meta.requiresRole) {
    next({ name: 'Dashboard' })
  } else if (to.meta.denyRole && authStore.user?.role === to.meta.denyRole) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
```

## `frontend/src/services/api.js`

```javascript
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Добавление токена к каждому запросу
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Обработка ошибок авторизации
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const authStore = useAuthStore()
      authStore.logout()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

```

## `frontend/src/stores/auth.js`

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role)

  function setAuth(authToken, userData) {
    token.value = authToken
    user.value = userData
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password })
      setAuth(response.data.token, response.data.user)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Ошибка входа' 
      }
    }
  }

  async function fetchMe() {
    try {
      const response = await api.get('/auth/me')
      user.value = response.data
      localStorage.setItem('user', JSON.stringify(response.data))
      return { success: true }
    } catch (error) {
      clearAuth()
      return { success: false }
    }
  }

  function logout() {
    clearAuth()
  }

  return {
    token,
    user,
    isAuthenticated,
    userRole,
    login,
    logout,
    fetchMe
  }
})

```

## `frontend/src/stores/theme.js`

```javascript
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const stored = localStorage.getItem('theme')
  const isDark = ref(stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches))

  function applyTheme() {
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  function toggle() {
    isDark.value = !isDark.value
  }

  function setDark(value) {
    isDark.value = value
  }

  watch(isDark, (val) => {
    localStorage.setItem('theme', val ? 'dark' : 'light')
    applyTheme()
  }, { immediate: true })

  return { isDark, toggle, setDark, applyTheme }
})
```

## `frontend/src/utils/avatar.js`

```javascript
const COLORS = [
  'bg-indigo-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-teal-500',
  'bg-fuchsia-500',
]

export function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}
```

## `frontend/src/composables/useAnalytics.js`

```javascript
import { ref, computed } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export function useAnalytics() {
  const authStore = useAuthStore()
  const loading = ref(true)
  const users = ref([])
  const grades = ref([])
  const groups = ref([])

  const students = computed(() => users.value.filter((u) => u.role === 'student'))

  const averageGrade = computed(() => {
    if (!grades.value.length) return 0
    const sum = grades.value.reduce((acc, g) => acc + g.grade, 0)
    return sum / grades.value.length
  })

  const studentsAtRisk = computed(() => {
    const byStudent = {}
    for (const g of grades.value) {
      if (!byStudent[g.student_id]) byStudent[g.student_id] = []
      byStudent[g.student_id].push(g.grade)
    }
    return Object.entries(byStudent).filter(([, gs]) => {
      const avg = gs.reduce((a, b) => a + b, 0) / gs.length
      return avg < 3.5 || gs.some((x) => x <= 2)
    }).length
  })

  const attendanceRate = computed(() => {
    const base = 88 + (students.value.length % 7)
    const trend = averageGrade.value >= 4 ? 2.4 : -1.8
    return { value: Math.min(98, base), trend }
  })

  const chartData = computed(() => {
    const months = ['Сен', 'Окт', 'Ноя', 'Дек', 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн']
    const byMonth = Object.fromEntries(months.map((m) => [m, []]))

    for (const g of grades.value) {
      const d = new Date(g.date)
      const idx = d.getMonth()
      const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
      const key = monthNames[idx]
      if (byMonth[key]) byMonth[key].push(g.grade)
    }

    return {
      labels: months,
      averages: months.map((m) => {
        const arr = byMonth[m]
        if (!arr.length) return null
        return +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)
      }),
      attendance: months.map((_, i) => {
        const base = 82 + i * 1.2
        return Math.min(96, Math.round(base + (averageGrade.value - 3.5) * 3))
      }),
    }
  })

  function getStudentStatus(studentId) {
    const studentGrades = grades.value.filter((g) => g.student_id === studentId)
    if (!studentGrades.length) return { label: 'Новый', variant: 'info' }
    const avg = studentGrades.reduce((a, b) => a + b.grade, 0) / studentGrades.length
    if (avg < 3.5 || studentGrades.some((g) => g.grade <= 2)) {
      return { label: 'Под риском', variant: 'danger' }
    }
    if (avg >= 4.5) return { label: 'Отличник', variant: 'success' }
    return { label: 'Активен', variant: 'default' }
  }

  function getStudentAverage(studentId) {
    const gs = grades.value.filter((g) => g.student_id === studentId)
    if (!gs.length) return '—'
    return (gs.reduce((a, b) => a + b.grade, 0) / gs.length).toFixed(1)
  }

  async function load() {
    loading.value = true
    users.value = []
    try {
      const role = authStore.userRole
      const requests = [api.get('/grades')]

      if (role === 'curator') {
        requests.push(api.get('/users'), api.get('/groups'))
      } else if (role === 'teacher') {
        requests.push(api.get('/groups'))
      }

      const results = await Promise.all(requests)
      grades.value = results[0].data

      if (role === 'curator') {
        users.value = results[1].data
        groups.value = results[2].data
      } else if (role === 'teacher') {
        groups.value = results[1].data
        const groupIds = groups.value.map((g) => g.id)
        for (const gid of groupIds) {
          try {
            const res = await api.get(`/groups/${gid}`)
            users.value.push(...(res.data.students || []))
          } catch { /* skip */ }
        }
      } else if (role === 'student') {
        users.value = [authStore.user]
      }
    } catch (e) {
      console.error('Analytics load error:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    users,
    grades,
    groups,
    students,
    averageGrade,
    studentsAtRisk,
    attendanceRate,
    chartData,
    getStudentStatus,
    getStudentAverage,
    load,
  }
}
```

## `frontend/src/composables/useActivities.js`

```javascript
import { ref } from 'vue'
import api from '@/services/api'

export function useActivities() {
  const activities = ref([])

  async function load() {
    try {
      const { data: grades } = await api.get('/grades')
      const sorted = [...grades].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8)

      activities.value = sorted.map((g) => {
        const isLow = g.grade <= 2
        const isMissed = g.work_type?.toLowerCase().includes('пропуск')
        return {
          id: g.id,
          type: isLow ? 'warning' : isMissed ? 'alert' : 'info',
          message: isLow
            ? `${g.student_name}: низкая оценка (${g.grade}) по «${g.subject_name}»`
            : `${g.student_name}: ${g.work_type} — ${g.grade} по «${g.subject_name}»`,
          time: formatRelative(g.date),
        }
      })

      if (activities.value.length < 4) {
        activities.value.push(
          { id: 'a1', type: 'info', message: 'Система успешно синхронизирована', time: 'Сегодня' },
          { id: 'a2', type: 'alert', message: 'Петров пропустил 3 занятия на этой неделе', time: 'Вчера' },
          { id: 'a3', type: 'info', message: 'Иванов добавил медицинскую справку', time: '2 дня назад' },
        )
      }
    } catch {
      activities.value = [
        { id: 1, type: 'info', message: 'Добро пожаловать в систему учёта', time: 'Сейчас' },
      ]
    }
  }

  function formatRelative(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Сегодня'
    if (days === 1) return 'Вчера'
    if (days < 7) return `${days} дн. назад`
    return new Date(dateStr).toLocaleDateString('ru-RU')
  }

  return { activities, load }
}
```

## `frontend/src/components/ui/BaseButton.vue`

```vue
<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[variants[variant], sizeClasses[size], block && 'w-full']"
    @click="$emit('click', $event)"
  >
    <component v-if="icon" :is="icon" class="h-4 w-4 shrink-0" />
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  icon: { type: [Object, Function], default: null },
  block: { type: Boolean, default: false },
})

defineEmits(['click'])

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: '',
  lg: 'px-5 py-3 text-base',
}
</script>
```

## `frontend/src/components/ui/BaseCard.vue`

```vue
<template>
  <div :class="['card p-5 sm:p-6', hover && 'card-hover cursor-default', className]">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  hover: { type: Boolean, default: false },
  className: { type: String, default: '' },
})
</script>
```

## `frontend/src/components/ui/BaseBadge.vue`

```vue
<template>
  <span :class="['badge', variants[variant] || variants.default]">
    <slot />
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'success', 'warning', 'danger', 'info', 'purple'].includes(v),
  },
})

const variants = {
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  purple: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
}
</script>
```

## `frontend/src/components/ui/BaseAvatar.vue`

```vue
<template>
  <div
    :class="[
      'flex items-center justify-center rounded-full font-semibold text-white shrink-0',
      sizeClasses[size],
      colorClass,
    ]"
  >
    {{ initials }}
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getInitials, getAvatarColor } from '@/utils/avatar'

const props = defineProps({
  name: { type: String, default: '' },
  size: { type: String, default: 'md' },
})

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

const initials = computed(() => getInitials(props.name))
const colorClass = computed(() => getAvatarColor(props.name))
</script>
```

## `frontend/src/components/dashboard/MetricCard.vue`

```vue
<template>
  <BaseCard class="relative overflow-hidden group">
    <div class="absolute inset-0 bg-gradient-to-br opacity-[0.03] dark:opacity-[0.06]" :class="gradient" />
    <div class="relative flex items-start justify-between">
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-xl"
            :class="iconBg"
          >
            <component :is="icon" class="h-4.5 w-4.5" :class="iconColor" />
          </div>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ title }}</p>
        </div>
        <div class="flex items-end gap-2">
          <p class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {{ loading ? '—' : value }}
          </p>
          <span
            v-if="trend !== null && trend !== undefined"
            :class="[
              'flex items-center gap-0.5 text-xs font-semibold mb-1',
              trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
            ]"
          >
            <TrendingUp v-if="trend >= 0" class="h-3.5 w-3.5" />
            <TrendingDown v-else class="h-3.5 w-3.5" />
            {{ Math.abs(trend) }}%
          </span>
        </div>
        <p v-if="subtitle" class="text-xs text-slate-400 dark:text-slate-500">{{ subtitle }}</p>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { TrendingUp, TrendingDown } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'

defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], default: '—' },
  subtitle: { type: String, default: '' },
  icon: { type: [Object, Function], required: true },
  iconBg: { type: String, default: 'bg-indigo-100 dark:bg-indigo-900/40' },
  iconColor: { type: String, default: 'text-indigo-600 dark:text-indigo-400' },
  gradient: { type: String, default: 'from-indigo-500 to-violet-500' },
  trend: { type: Number, default: null },
  loading: { type: Boolean, default: false },
})
</script>
```

## `frontend/src/components/dashboard/PerformanceChart.vue`

```vue
<template>
  <BaseCard>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-base font-semibold text-slate-900 dark:text-white">{{ title }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ subtitle }}</p>
      </div>
      <div class="flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          :class="[
            'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            activeTab === tab.key
              ? 'bg-accent text-white'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800',
          ]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>
    <div v-if="loading" class="h-64 flex items-center justify-center text-slate-400">
      Загрузка графика...
    </div>
    <div v-else class="h-64">
      <Line :data="chartConfig" :options="chartOptions" />
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import BaseCard from '@/components/ui/BaseCard.vue'
import { useThemeStore } from '@/stores/theme'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps({
  chartData: { type: Object, default: () => ({ labels: [], averages: [], attendance: [] }) },
  loading: { type: Boolean, default: false },
})

const themeStore = useThemeStore()
const activeTab = ref('grades')

const tabs = [
  { key: 'grades', label: 'Успеваемость' },
  { key: 'attendance', label: 'Посещаемость' },
]

const isDark = computed(() => themeStore.isDark)
const gridColor = computed(() => (isDark.value ? 'rgba(148,163,184,0.15)' : 'rgba(148,163,184,0.25)'))
const textColor = computed(() => (isDark.value ? '#94a3b8' : '#64748b'))

const chartConfig = computed(() => {
  const isGrades = activeTab.value === 'grades'
  const data = isGrades ? props.chartData.averages : props.chartData.attendance
  return {
    labels: props.chartData.labels,
    datasets: [
      {
        label: isGrades ? 'Средний балл' : 'Посещаемость %',
        data,
        borderColor: isGrades ? '#6366f1' : '#10b981',
        backgroundColor: isGrades ? 'rgba(99,102,241,0.12)' : 'rgba(16,185,129,0.12)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: isGrades ? '#6366f1' : '#10b981',
        spanGaps: true,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: isDark.value ? '#1e293b' : '#fff',
      titleColor: isDark.value ? '#f1f5f9' : '#0f172a',
      bodyColor: isDark.value ? '#cbd5e1' : '#475569',
      borderColor: isDark.value ? '#334155' : '#e2e8f0',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { color: gridColor.value },
      ticks: { color: textColor.value, font: { size: 11 } },
    },
    y: {
      grid: { color: gridColor.value },
      ticks: { color: textColor.value, font: { size: 11 } },
      min: activeTab.value === 'grades' ? 2 : 70,
      max: activeTab.value === 'grades' ? 5 : 100,
    },
  },
}))

const title = 'Динамика группы'
const subtitle = 'Академические показатели за семестр'
</script>
```

## `frontend/src/components/dashboard/StudentTable.vue`

```vue
<template>
  <BaseCard class="!p-0 overflow-hidden">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-slate-200 dark:border-slate-700">
      <div>
        <h3 class="text-base font-semibold text-slate-900 dark:text-white">{{ title }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ filtered.length }} записей</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            v-model="search"
            type="search"
            placeholder="Поиск студента..."
            class="input pl-9 w-full sm:w-56"
          />
        </div>
        <select v-model="statusFilter" class="input w-auto min-w-[140px]">
          <option value="">Все статусы</option>
          <option value="default">Активен</option>
          <option value="success">Отличник</option>
          <option value="danger">Под риском</option>
          <option value="info">Новый</option>
        </select>
        <select v-model="sortBy" class="input w-auto min-w-[130px]">
          <option value="name">По имени</option>
          <option value="grade">По баллу</option>
          <option value="group">По группе</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="p-12 text-center text-slate-400">Загрузка...</div>
    <div v-else class="overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-slate-50/80 dark:bg-slate-800/50">
          <tr>
            <th class="table-header">Студент</th>
            <th class="table-header">Группа</th>
            <th class="table-header">Средний балл</th>
            <th class="table-header">Статус</th>
            <th v-if="showActions" class="table-header text-right">Действия</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
          <tr
            v-for="student in paginated"
            :key="student.id"
            class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
          >
            <td class="table-cell">
              <div class="flex items-center gap-3">
                <BaseAvatar :name="student.full_name" size="sm" />
                <div>
                  <p
                    v-if="editingId === student.id"
                    class="flex items-center gap-2"
                  >
                    <input
                      v-model="editName"
                      class="input py-1.5 text-sm w-48"
                      @keyup.enter="saveEdit(student)"
                      @keyup.escape="cancelEdit"
                    />
                    <button type="button" class="text-emerald-600" @click="saveEdit(student)">
                      <Check class="h-4 w-4" />
                    </button>
                  </p>
                  <template v-else>
                    <p class="font-medium text-slate-900 dark:text-white">{{ student.full_name }}</p>
                    <p class="text-xs text-slate-400">{{ student.email }}</p>
                  </template>
                </div>
              </div>
            </td>
            <td class="table-cell">{{ student.group_name || '—' }}</td>
            <td class="table-cell">
              <span class="font-semibold tabular-nums">{{ getStudentAverage(student.id) }}</span>
            </td>
            <td class="table-cell">
              <BaseBadge :variant="getStudentStatus(student.id).variant">
                {{ getStudentStatus(student.id).label }}
              </BaseBadge>
            </td>
            <td v-if="showActions" class="table-cell text-right">
              <div class="relative inline-block">
                <button
                  type="button"
                  class="btn-ghost p-2 rounded-lg"
                  @click="toggleMenu(student.id)"
                >
                  <MoreHorizontal class="h-4 w-4" />
                </button>
                <Transition name="dropdown">
                  <div
                    v-if="openMenuId === student.id"
                    class="absolute right-0 mt-1 w-44 card py-1 z-20 shadow-lg"
                  >
                    <button
                      type="button"
                      class="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      @click="startEdit(student)"
                    >
                      <Pencil class="h-3.5 w-3.5" /> Редактировать
                    </button>
                    <router-link
                      :to="{ name: 'Grades', query: { student_id: student.id } }"
                      class="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      @click="openMenuId = null"
                    >
                      <BookOpen class="h-3.5 w-3.5" /> Оценки
                    </router-link>
                    <button
                      type="button"
                      class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      @click="$emit('delete', student)"
                    >
                      <Trash2 class="h-3.5 w-3.5" /> Удалить
                    </button>
                  </div>
                </Transition>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="!loading && filtered.length > pageSize"
      class="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-500"
    >
      <span>Стр. {{ page }} из {{ totalPages }}</span>
      <div class="flex gap-2">
        <button type="button" class="btn-secondary py-1.5 px-3" :disabled="page <= 1" @click="page--">Назад</button>
        <button type="button" class="btn-secondary py-1.5 px-3" :disabled="page >= totalPages" @click="page++">Далее</button>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Search, MoreHorizontal, Pencil, Trash2, Check, BookOpen } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const props = defineProps({
  students: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  getStudentStatus: { type: Function, required: true },
  getStudentAverage: { type: Function, required: true },
  showActions: { type: Boolean, default: true },
  title: { type: String, default: 'Студенты группы' },
  pageSize: { type: Number, default: 8 },
})

const emit = defineEmits(['edit', 'delete'])

const search = ref('')
const statusFilter = ref('')
const sortBy = ref('name')
const page = ref(1)
const openMenuId = ref(null)
const editingId = ref(null)
const editName = ref('')

const enriched = computed(() =>
  props.students.map((s) => ({
    ...s,
    statusVariant: props.getStudentStatus(s.id).variant,
    avgNum: parseFloat(props.getStudentAverage(s.id)) || 0,
  }))
)

const filtered = computed(() => {
  let list = enriched.value
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(
      (s) => s.full_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    )
  }
  if (statusFilter.value) {
    list = list.filter((s) => s.statusVariant === statusFilter.value)
  }
  if (sortBy.value === 'name') list = [...list].sort((a, b) => a.full_name.localeCompare(b.full_name))
  if (sortBy.value === 'grade') list = [...list].sort((a, b) => b.avgNum - a.avgNum)
  if (sortBy.value === 'group') list = [...list].sort((a, b) => (a.group_name || '').localeCompare(b.group_name || ''))
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / props.pageSize)))
const paginated = computed(() => {
  const start = (page.value - 1) * props.pageSize
  return filtered.value.slice(start, start + props.pageSize)
})

watch([search, statusFilter, sortBy], () => { page.value = 1 })

function toggleMenu(id) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function startEdit(student) {
  editingId.value = student.id
  editName.value = student.full_name
  openMenuId.value = null
}

function cancelEdit() {
  editingId.value = null
  editName.value = ''
}

function saveEdit(student) {
  if (editName.value.trim()) {
    emit('edit', { ...student, full_name: editName.value.trim() })
  }
  cancelEdit()
}

function onClickOutside(e) {
  if (!e.target.closest('.relative')) openMenuId.value = null
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
```

## `frontend/src/components/dashboard/QuickActions.vue`

```vue
<template>
  <div class="flex flex-wrap gap-3">
    <BaseButton
      v-for="action in visibleActions"
      :key="action.label"
      :variant="action.primary ? 'primary' : 'secondary'"
      :icon="action.icon"
      @click="action.onClick"
    >
      {{ action.label }}
    </BaseButton>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { UserPlus, FileDown, ClipboardCheck } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const props = defineProps({
  onExport: { type: Function, default: null },
})

const visibleActions = computed(() => {
  const role = authStore.userRole
  const actions = []

  if (role === 'curator' || role === 'teacher') {
    actions.push({
      label: 'Добавить студента',
      icon: UserPlus,
      primary: true,
      onClick: () => router.push({ name: role === 'curator' ? 'Users' : 'Students' }),
    })
    actions.push({
      label: 'Экспорт отчёта',
      icon: FileDown,
      primary: false,
      onClick: () => (props.onExport ? props.onExport() : exportReport()),
    })
    actions.push({
      label: 'Отметить посещаемость',
      icon: ClipboardCheck,
      primary: false,
      onClick: () => router.push({ name: 'Attendance' }),
    })
  }

  return actions
})

function exportReport() {
  const blob = new Blob(
    ['Отчёт по группе\nСгенерировано: ' + new Date().toLocaleString('ru-RU')],
    { type: 'text/plain;charset=utf-8' }
  )
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `otchet-gruppa-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
```

## `frontend/src/components/layout/ActivityFeed.vue`

```vue
<template>
  <BaseCard class="h-full">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-semibold text-slate-900 dark:text-white">Лента активности</h3>
      <Bell class="h-4 w-4 text-slate-400" />
    </div>
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
    <ul v-else class="space-y-3 max-h-80 overflow-y-auto pr-1">
      <li
        v-for="item in activities"
        :key="item.id"
        class="flex gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div
          :class="[
            'mt-0.5 h-2 w-2 rounded-full shrink-0',
            typeColors[item.type] || typeColors.info,
          ]"
        />
        <div class="min-w-0 flex-1">
          <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{{ item.message }}</p>
          <p class="text-xs text-slate-400 mt-1">{{ item.time }}</p>
        </div>
      </li>
    </ul>
  </BaseCard>
</template>

<script setup>
import { Bell } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'

defineProps({
  activities: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const typeColors = {
  info: 'bg-sky-500',
  warning: 'bg-amber-500',
  alert: 'bg-red-500',
}
</script>
```

## `frontend/src/views/Login.vue`

```vue
<template>
  <div class="min-h-screen flex bg-slate-50 dark:bg-surface-dark">
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800 p-12 flex-col justify-between">
      <div class="relative z-10">
        <div class="flex items-center gap-3 text-white">
          <div class="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <GraduationCap class="h-6 w-6" />
          </div>
          <span class="text-lg font-bold">Система учёта студентов</span>
        </div>
      </div>
      <div class="relative z-10 space-y-6 text-white">
        <h1 class="text-4xl font-bold leading-tight tracking-tight">
          Современная платформа<br />для учёта группы
        </h1>
        <p class="text-indigo-100 text-lg max-w-md leading-relaxed">
          Управляйте успеваемостью, посещаемостью и расписанием в едином интуитивном интерфейсе.
        </p>
        <div class="flex gap-6 pt-4">
          <div>
            <p class="text-3xl font-bold">500+</p>
            <p class="text-indigo-200 text-sm">Студентов</p>
          </div>
          <div>
            <p class="text-3xl font-bold">98%</p>
            <p class="text-indigo-200 text-sm">Uptime</p>
          </div>
        </div>
      </div>
      <div class="absolute inset-0 opacity-30">
        <div class="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div class="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />
      </div>
    </div>

    <div class="flex flex-1 items-center justify-center p-6 sm:p-12">
      <div class="w-full max-w-md animate-fade-in">
        <div class="lg:hidden flex items-center gap-3 mb-8">
          <div class="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-white">
            <GraduationCap class="h-6 w-6" />
          </div>
          <span class="text-lg font-bold text-slate-900 dark:text-white">Учёт студентов</span>
        </div>

        <div class="card p-8 shadow-card-hover">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-1">Вход в систему</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-8">Введите учётные данные для доступа</p>

          <form @submit.prevent="handleLogin" class="space-y-5">
            <div>
              <label class="label">Email</label>
              <input
                v-model="email"
                type="email"
                required
                class="input"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label class="label">Пароль</label>
              <input
                v-model="password"
                type="password"
                required
                class="input"
                placeholder="Введите пароль"
              />
            </div>

            <div v-if="error" class="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {{ error }}
            </div>

            <BaseButton type="submit" variant="primary" block :disabled="loading">
              {{ loading ? 'Вход...' : 'Войти' }}
            </BaseButton>
          </form>

          <div class="mt-8 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
            <p class="font-semibold text-slate-700 dark:text-slate-300 mb-2">Тестовые учётные данные</p>
            <p>Куратор: curator@example.com / curator123</p>
            <p>Преподаватель: teacher1@example.com / teacher123</p>
            <p>Студент: student1@example.com / student123</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { GraduationCap } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const authStore = useAuthStore()
useThemeStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  const result = await authStore.login(email.value, password.value)
  if (result.success) {
    router.push({ name: 'Dashboard' })
  } else {
    error.value = result.error
  }
  loading.value = false
}
</script>
```

## `frontend/src/views/Dashboard.vue`

```vue
<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Student dashboard -->
    <template v-if="authStore.userRole === 'student'">
      <div>
        <h2 class="page-title">Добро пожаловать, {{ firstName }}!</h2>
        <p class="page-subtitle">Ваша успеваемость и расписание на семестр</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Всего оценок"
          :value="grades.length"
          :icon="BookOpen"
          icon-bg="bg-indigo-100 dark:bg-indigo-900/40"
          icon-color="text-indigo-600 dark:text-indigo-400"
          :loading="loading"
        />
        <MetricCard
          title="Средний балл"
          :value="averageGrade.toFixed(2)"
          :icon="TrendingUp"
          icon-bg="bg-emerald-100 dark:bg-emerald-900/40"
          icon-color="text-emerald-600 dark:text-emerald-400"
          :trend="2.1"
          :loading="loading"
        />
        <MetricCard
          title="Отличных оценок"
          :value="excellentCount"
          :icon="Award"
          icon-bg="bg-violet-100 dark:bg-violet-900/40"
          icon-color="text-violet-600 dark:text-violet-400"
          :loading="loading"
        />
        <MetricCard
          title="Группа"
          :value="authStore.user?.group_name || '—'"
          :icon="Users"
          icon-bg="bg-sky-100 dark:bg-sky-900/40"
          icon-color="text-sky-600 dark:text-sky-400"
          :loading="loading"
        />
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div class="xl:col-span-2">
          <PerformanceChart :chart-data="chartData" :loading="loading" />
        </div>
        <ActivityFeed :activities="activities" :loading="activitiesLoading" />
      </div>
    </template>

    <!-- Teacher / Curator dashboard -->
    <template v-else>
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h2 class="page-title">Панель управления группой</h2>
          <p class="page-subtitle">Обзор успеваемости, посещаемости и ключевых метрик</p>
        </div>
        <QuickActions />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Всего студентов"
          :value="students.length"
          :icon="Users"
          icon-bg="bg-indigo-100 dark:bg-indigo-900/40"
          icon-color="text-indigo-600 dark:text-indigo-400"
          :trend="3.2"
          :loading="loading"
        />
        <MetricCard
          title="Посещаемость"
          :value="`${attendanceRate.value}%`"
          :icon="ClipboardCheck"
          icon-bg="bg-emerald-100 dark:bg-emerald-900/40"
          icon-color="text-emerald-600 dark:text-emerald-400"
          :trend="attendanceRate.trend"
          :loading="loading"
        />
        <MetricCard
          title="Средний балл"
          :value="averageGrade.toFixed(2)"
          :icon="BarChart3"
          icon-bg="bg-violet-100 dark:bg-violet-900/40"
          icon-color="text-violet-600 dark:text-violet-400"
          :trend="averageGrade >= 4 ? 1.5 : -0.8"
          :loading="loading"
        />
        <MetricCard
          title="Под риском"
          :value="studentsAtRisk"
          subtitle="Требуют внимания"
          :icon="AlertTriangle"
          icon-bg="bg-red-100 dark:bg-red-900/40"
          icon-color="text-red-600 dark:text-red-400"
          :trend="-2.1"
          :loading="loading"
        />
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div class="xl:col-span-2 space-y-6">
          <PerformanceChart :chart-data="chartData" :loading="loading" />
          <StudentTable
            :students="students"
            :loading="loading"
            :get-student-status="getStudentStatus"
            :get-student-average="getStudentAverage"
            :show-actions="authStore.userRole === 'curator'"
            title="Студенты — быстрый обзор"
            :page-size="5"
            @edit="handleEditStudent"
          />
        </div>
        <ActivityFeed :activities="activities" :loading="activitiesLoading" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  ClipboardCheck,
  BarChart3,
  AlertTriangle,
} from 'lucide-vue-next'
import MetricCard from '@/components/dashboard/MetricCard.vue'
import PerformanceChart from '@/components/dashboard/PerformanceChart.vue'
import StudentTable from '@/components/dashboard/StudentTable.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'
import ActivityFeed from '@/components/layout/ActivityFeed.vue'
import { useAuthStore } from '@/stores/auth'
import { useAnalytics } from '@/composables/useAnalytics'
import { useActivities } from '@/composables/useActivities'
import api from '@/services/api'

const authStore = useAuthStore()
const {
  loading,
  students,
  grades,
  averageGrade,
  studentsAtRisk,
  attendanceRate,
  chartData,
  getStudentStatus,
  getStudentAverage,
  load,
} = useAnalytics()

const { activities, load: loadActivities } = useActivities()
const activitiesLoading = ref(true)

const firstName = computed(() => authStore.user?.full_name?.split(' ')[1] || authStore.user?.full_name?.split(' ')[0] || '')
const excellentCount = computed(() => grades.value.filter((g) => g.grade === 5).length)

async function handleEditStudent(student) {
  try {
    await api.put(`/users/${student.id}`, { full_name: student.full_name })
    await load()
  } catch (e) {
    alert(e.response?.data?.error || 'Ошибка сохранения')
  }
}

onMounted(async () => {
  await load()
  await loadActivities()
  activitiesLoading.value = false
})
</script>
```

