# Исходный код — Frontend

Полный дамп исходного кода фронтенда (Vue 3 + Vite + Tailwind). Файлы `package-lock.json` и каталоги `node_modules`/`dist` не включены.

## Список файлов

- `frontend/index.html`
- `frontend/package.json`
- `frontend/postcss.config.js`
- `frontend/src/App.vue`
- `frontend/src/layouts/Layout.vue`
- `frontend/src/main.js`
- `frontend/src/router/index.js`
- `frontend/src/services/api.js`
- `frontend/src/stores/auth.js`
- `frontend/src/style.css`
- `frontend/src/views/Dashboard.vue`
- `frontend/src/views/Grades.vue`
- `frontend/src/views/Groups.vue`
- `frontend/src/views/Login.vue`
- `frontend/src/views/Profile.vue`
- `frontend/src/views/Subjects.vue`
- `frontend/src/views/Users.vue`
- `frontend/tailwind.config.js`
- `frontend/vercel.json`
- `frontend/vite.config.js`

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
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>

```

## `frontend/package.json`

```json
{
  "name": "student-management-frontend",
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.3.4",
    "vue-router": "^4.2.5",
    "pinia": "^2.1.7",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.5.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.5"
  }
}

```

## `frontend/postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

```

## `frontend/src/App.vue`

```vue
<template>
  <router-view />
</template>

<script setup>
</script>

```

## `frontend/src/layouts/Layout.vue`

```vue
<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">Система учета студентов</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                :to="{ name: 'Dashboard' }"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-blue-500 text-gray-900"
              >
                Главная
              </router-link>
              <router-link
                :to="{ name: 'Profile' }"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-blue-500 text-gray-900"
              >
                Профиль
              </router-link>
              <router-link
                :to="{ name: 'Grades' }"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-blue-500 text-gray-900"
              >
                Оценки
              </router-link>
              <router-link
                v-if="authStore.userRole === 'curator'"
                :to="{ name: 'Users' }"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-blue-500 text-gray-900"
              >
                Пользователи
              </router-link>
              <router-link
                v-if="authStore.userRole === 'curator'"
                :to="{ name: 'Groups' }"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-blue-500 text-gray-900"
              >
                Группы
              </router-link>
              <router-link
                v-if="authStore.userRole === 'curator'"
                :to="{ name: 'Subjects' }"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-blue-500 text-gray-900"
              >
                Дисциплины
              </router-link>
            </div>
          </div>
          <div class="flex items-center">
            <span class="text-sm text-gray-700 mr-4">{{ authStore.user?.full_name }}</span>
            <button
              @click="handleLogout"
              class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push({ name: 'Login' })
}
</script>

```

## `frontend/src/main.js`

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

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
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue')
      },
      {
        path: 'grades',
        name: 'Grades',
        component: () => import('@/views/Grades.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { requiresRole: 'curator' }
      },
      {
        path: 'groups',
        name: 'Groups',
        component: () => import('@/views/Groups.vue'),
        meta: { requiresRole: 'curator' }
      },
      {
        path: 'subjects',
        name: 'Subjects',
        component: () => import('@/views/Subjects.vue'),
        meta: { requiresRole: 'curator' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.meta.requiresAuth === false && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
  } else if (to.meta.requiresRole && authStore.user?.role !== to.meta.requiresRole) {
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

## `frontend/src/style.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

```

## `frontend/src/views/Dashboard.vue`

```vue
<template>
  <div class="px-4 py-6">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Главная страница</h1>

    <div v-if="authStore.userRole === 'student'" class="space-y-6">
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Мой профиль</h2>
        <div class="space-y-2">
          <p><span class="font-medium">ФИО:</span> {{ authStore.user?.full_name }}</p>
          <p><span class="font-medium">Email:</span> {{ authStore.user?.email }}</p>
          <p><span class="font-medium">Группа:</span> {{ authStore.user?.group_name || 'Не назначена' }}</p>
          <p><span class="font-medium">Роль:</span> Студент</p>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Статистика успеваемости</h2>
        <div v-if="stats.loading" class="text-gray-500">Загрузка...</div>
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Всего оценок</p>
            <p class="text-2xl font-bold text-blue-600">{{ stats.totalGrades }}</p>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Средний балл</p>
            <p class="text-2xl font-bold text-green-600">{{ stats.averageGrade.toFixed(2) }}</p>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Отличных оценок</p>
            <p class="text-2xl font-bold text-purple-600">{{ stats.excellentGrades }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="authStore.userRole === 'teacher'" class="space-y-6">
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Мои группы</h2>
        <div v-if="groups.loading" class="text-gray-500">Загрузка...</div>
        <div v-else-if="groups.data.length === 0" class="text-gray-500">Группы не найдены</div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="group in groups.data"
            :key="group.id"
            class="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h3 class="font-semibold text-lg">{{ group.name }}</h3>
            <p class="text-sm text-gray-600">Студентов: {{ group.student_count }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Мои дисциплины</h2>
        <div v-if="subjects.loading" class="text-gray-500">Загрузка...</div>
        <div v-else-if="subjects.data.length === 0" class="text-gray-500">Дисциплины не найдены</div>
        <div v-else class="space-y-2">
          <div
            v-for="subject in subjects.data"
            :key="subject.id"
            class="border rounded-lg p-3"
          >
            <p class="font-medium">{{ subject.name }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="authStore.userRole === 'curator'" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-2">Всего пользователей</h3>
          <p class="text-3xl font-bold text-blue-600">{{ stats.totalUsers }}</p>
        </div>
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-2">Всего групп</h3>
          <p class="text-3xl font-bold text-green-600">{{ stats.totalGroups }}</p>
        </div>
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-2">Всего дисциплин</h3>
          <p class="text-3xl font-bold text-purple-600">{{ stats.totalSubjects }}</p>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Быстрые действия</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <router-link
            :to="{ name: 'Users' }"
            class="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <h3 class="font-semibold">Управление пользователями</h3>
            <p class="text-sm text-gray-600">Добавление и редактирование пользователей</p>
          </router-link>
          <router-link
            :to="{ name: 'Groups' }"
            class="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <h3 class="font-semibold">Управление группами</h3>
            <p class="text-sm text-gray-600">Создание и редактирование групп</p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const authStore = useAuthStore()

const stats = ref({
  loading: true,
  totalGrades: 0,
  averageGrade: 0,
  excellentGrades: 0,
  totalUsers: 0,
  totalGroups: 0,
  totalSubjects: 0
})

const groups = ref({ loading: true, data: [] })
const subjects = ref({ loading: true, data: [] })

async function loadData() {
  try {
    if (authStore.userRole === 'student') {
      const gradesResponse = await api.get('/grades')
      const grades = gradesResponse.data
      
      stats.value.totalGrades = grades.length
      if (grades.length > 0) {
        const sum = grades.reduce((acc, g) => acc + g.grade, 0)
        stats.value.averageGrade = sum / grades.length
        stats.value.excellentGrades = grades.filter(g => g.grade === 5).length
      }
      stats.value.loading = false
    } else if (authStore.userRole === 'teacher') {
      const [groupsResponse, subjectsResponse] = await Promise.all([
        api.get('/groups'),
        api.get('/subjects')
      ])
      groups.value = { loading: false, data: groupsResponse.data }
      subjects.value = { loading: false, data: subjectsResponse.data }
    } else if (authStore.userRole === 'curator') {
      const [usersResponse, groupsResponse, subjectsResponse] = await Promise.all([
        api.get('/users'),
        api.get('/groups'),
        api.get('/subjects')
      ])
      stats.value.totalUsers = usersResponse.data.length
      stats.value.totalGroups = groupsResponse.data.length
      stats.value.totalSubjects = subjectsResponse.data.length
      stats.value.loading = false
    }
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
  }
}

onMounted(loadData)
</script>

```

## `frontend/src/views/Grades.vue`

```vue
<template>
  <div class="px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Оценки</h1>
      <button
        v-if="authStore.userRole !== 'student'"
        @click="showAddModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Добавить оценку
      </button>
    </div>

    <!-- Фильтры для преподавателя и куратора -->
    <div v-if="authStore.userRole !== 'student'" class="bg-white shadow rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Группа</label>
          <select
            v-model="filters.group_id"
            @change="loadGrades"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Все группы</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Дисциплина</label>
          <select
            v-model="filters.subject_id"
            @change="loadGrades"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Все дисциплины</option>
            <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
              {{ subject.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Студент</label>
          <select
            v-model="filters.student_id"
            @change="loadGrades"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Все студенты</option>
            <option v-for="student in students" :key="student.id" :value="student.id">
              {{ student.full_name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div v-if="loading" class="p-6 text-center text-gray-500">Загрузка...</div>
      <div v-else-if="grades.length === 0" class="p-6 text-center text-gray-500">
        Оценки не найдены
      </div>
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Дисциплина
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Студент
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Оценка
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Тип работы
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Дата
            </th>
            <th v-if="authStore.userRole !== 'student'" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="grade in grades" :key="grade.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ grade.subject_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ grade.student_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="{
                  'bg-red-100 text-red-800': grade.grade === 2,
                  'bg-yellow-100 text-yellow-800': grade.grade === 3,
                  'bg-blue-100 text-blue-800': grade.grade === 4,
                  'bg-green-100 text-green-800': grade.grade === 5
                }"
                class="px-2 py-1 text-xs font-semibold rounded-full"
              >
                {{ grade.grade }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ grade.work_type }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatDate(grade.date) }}
            </td>
            <td v-if="authStore.userRole !== 'student'" class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="editGrade(grade)"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                Редактировать
              </button>
              <button
                @click="deleteGrade(grade.id)"
                class="text-red-600 hover:text-red-900"
              >
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно добавления/редактирования оценки -->
    <div
      v-if="showAddModal || editingGrade"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 class="text-lg font-bold mb-4">
          {{ editingGrade ? 'Редактировать оценку' : 'Добавить оценку' }}
        </h3>
        <form @submit.prevent="saveGrade" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Студент</label>
            <select
              v-model="gradeForm.student_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Выберите студента</option>
              <option v-for="student in students" :key="student.id" :value="student.id">
                {{ student.full_name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Дисциплина</label>
            <select
              v-model="gradeForm.subject_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Выберите дисциплину</option>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                {{ subject.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Оценка</label>
            <select
              v-model="gradeForm.grade"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Выберите оценку</option>
              <option value="5">5 (Отлично)</option>
              <option value="4">4 (Хорошо)</option>
              <option value="3">3 (Удовлетворительно)</option>
              <option value="2">2 (Неудовлетворительно)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Тип работы</label>
            <input
              v-model="gradeForm.work_type"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Например: Лекция, Практика, Экзамен"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Дата</label>
            <input
              v-model="gradeForm.date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const authStore = useAuthStore()

const loading = ref(true)
const grades = ref([])
const groups = ref([])
const subjects = ref([])
const students = ref([])

const showAddModal = ref(false)
const editingGrade = ref(null)

const filters = ref({
  group_id: '',
  subject_id: '',
  student_id: ''
})

const gradeForm = ref({
  student_id: '',
  subject_id: '',
  grade: '',
  work_type: '',
  date: new Date().toISOString().split('T')[0]
})

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU')
}

async function loadGrades() {
  loading.value = true
  try {
    const params = {}
    if (filters.value.group_id) params.group_id = filters.value.group_id
    if (filters.value.subject_id) params.subject_id = filters.value.subject_id
    if (filters.value.student_id) params.student_id = filters.value.student_id

    const response = await api.get('/grades', { params })
    grades.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки оценок:', error)
  }
  loading.value = false
}

async function loadGroups() {
  try {
    const response = await api.get('/groups')
    groups.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки групп:', error)
  }
}

async function loadSubjects() {
  try {
    const response = await api.get('/subjects')
    subjects.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки дисциплин:', error)
  }
}

async function loadStudents() {
  try {
    if (filters.value.group_id) {
      const response = await api.get(`/groups/${filters.value.group_id}`)
      students.value = response.data.students || []
    } else {
      // Загружаем всех студентов для куратора
      if (authStore.userRole === 'curator') {
        const response = await api.get('/users')
        students.value = response.data.filter(u => u.role === 'student')
      } else {
        students.value = []
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки студентов:', error)
  }
}

async function saveGrade() {
  try {
    if (editingGrade.value) {
      await api.put(`/grades/${editingGrade.value.id}`, gradeForm.value)
    } else {
      await api.post('/grades', gradeForm.value)
    }
    closeModal()
    loadGrades()
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка сохранения оценки')
  }
}

function editGrade(grade) {
  editingGrade.value = grade
  gradeForm.value = {
    student_id: grade.student_id,
    subject_id: grade.subject_id,
    grade: grade.grade.toString(),
    work_type: grade.work_type,
    date: grade.date
  }
  showAddModal.value = true
}

async function deleteGrade(id) {
  if (!confirm('Вы уверены, что хотите удалить эту оценку?')) return

  try {
    await api.delete(`/grades/${id}`)
    loadGrades()
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка удаления оценки')
  }
}

function closeModal() {
  showAddModal.value = false
  editingGrade.value = null
  gradeForm.value = {
    student_id: '',
    subject_id: '',
    grade: '',
    work_type: '',
    date: new Date().toISOString().split('T')[0]
  }
}

onMounted(async () => {
  await Promise.all([loadGrades(), loadGroups(), loadSubjects()])
  if (authStore.userRole !== 'student') {
    await loadStudents()
  }
})
</script>

```

## `frontend/src/views/Groups.vue`

```vue
<template>
  <div class="px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Группы</h1>
      <button
        @click="showAddModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Добавить группу
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="group in groups"
        :key="group.id"
        class="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-semibold">{{ group.name }}</h3>
          <div class="flex space-x-2">
            <button
              @click="editGroup(group)"
              class="text-blue-600 hover:text-blue-900"
            >
              ✏️
            </button>
            <button
              @click="deleteGroup(group.id)"
              class="text-red-600 hover:text-red-900"
            >
              🗑️
            </button>
          </div>
        </div>
        <p class="text-sm text-gray-600 mb-2">Студентов: {{ group.student_count || 0 }}</p>
        <button
          @click="viewGroup(group)"
          class="text-blue-600 hover:text-blue-900 text-sm"
        >
          Просмотреть студентов →
        </button>
      </div>
    </div>

    <div v-if="groups.length === 0 && !loading" class="text-center text-gray-500 py-12">
      Группы не найдены
    </div>

    <!-- Модальное окно добавления/редактирования группы -->
    <div
      v-if="showAddModal || editingGroup"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 class="text-lg font-bold mb-4">
          {{ editingGroup ? 'Редактировать группу' : 'Добавить группу' }}
        </h3>
        <form @submit.prevent="saveGroup" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Название группы</label>
            <input
              v-model="groupForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Например: ИТ-21"
            />
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Модальное окно просмотра студентов группы -->
    <div
      v-if="selectedGroup"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="selectedGroup = null"
    >
      <div class="relative top-20 mx-auto p-5 border w-2/3 max-w-4xl shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold">Студенты группы {{ selectedGroup.name }}</h3>
          <button
            @click="selectedGroup = null"
            class="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div v-if="groupStudentsLoading" class="text-center py-8 text-gray-500">
          Загрузка...
        </div>
        <div v-else-if="groupStudents.length === 0" class="text-center py-8 text-gray-500">
          В группе нет студентов
        </div>
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="student in groupStudents" :key="student.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ student.full_name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ student.email }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(true)
const groups = ref([])
const showAddModal = ref(false)
const editingGroup = ref(null)
const selectedGroup = ref(null)
const groupStudents = ref([])
const groupStudentsLoading = ref(false)

const groupForm = ref({
  name: ''
})

async function loadGroups() {
  loading.value = true
  try {
    const response = await api.get('/groups')
    groups.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки групп:', error)
  }
  loading.value = false
}

async function saveGroup() {
  try {
    if (editingGroup.value) {
      await api.put(`/groups/${editingGroup.value.id}`, groupForm.value)
    } else {
      await api.post('/groups', groupForm.value)
    }
    closeModal()
    loadGroups()
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка сохранения группы')
  }
}

function editGroup(group) {
  editingGroup.value = group
  groupForm.value = { name: group.name }
  showAddModal.value = true
}

async function deleteGroup(id) {
  if (!confirm('Вы уверены, что хотите удалить эту группу?')) return

  try {
    await api.delete(`/groups/${id}`)
    loadGroups()
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка удаления группы')
  }
}

async function viewGroup(group) {
  selectedGroup.value = group
  groupStudentsLoading.value = true
  try {
    const response = await api.get(`/groups/${group.id}`)
    groupStudents.value = response.data.students || []
  } catch (error) {
    console.error('Ошибка загрузки студентов:', error)
  }
  groupStudentsLoading.value = false
}

function closeModal() {
  showAddModal.value = false
  editingGroup.value = null
  groupForm.value = { name: '' }
}

onMounted(loadGroups)
</script>

```

## `frontend/src/views/Login.vue`

```vue
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold text-center mb-6">Вход в систему</h1>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="email@example.com"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Пароль
          </label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите пароль"
          />
        </div>

        <div v-if="error" class="text-red-600 text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Вход...' : 'Войти' }}
        </button>
      </form>

      <div class="mt-6 p-4 bg-gray-50 rounded-md text-sm text-gray-600">
        <p class="font-semibold mb-2">Тестовые учетные данные:</p>
        <p>Куратор: curator@example.com / curator123</p>
        <p>Преподаватель: teacher1@example.com / teacher123</p>
        <p>Студент: student1@example.com / student123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

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

## `frontend/src/views/Profile.vue`

```vue
<template>
  <div class="px-4 py-6">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Мой профиль</h1>

    <div class="bg-white shadow rounded-lg p-6 max-w-2xl">
      <div v-if="loading" class="text-gray-500">Загрузка...</div>
      
      <form v-else @submit.prevent="handleUpdate" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            ФИО
          </label>
          <input
            v-model="formData.full_name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            v-model="formData.email"
            type="email"
            :disabled="authStore.userRole === 'student'"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Роль
          </label>
          <input
            :value="getRoleName(formData.role)"
            type="text"
            disabled
            class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>

        <div v-if="formData.group_name">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Группа
          </label>
          <input
            :value="formData.group_name"
            type="text"
            disabled
            class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>

        <div v-if="authStore.userRole === 'curator'">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Новый пароль (оставьте пустым, если не хотите менять)
          </label>
          <input
            v-model="formData.password"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div v-if="error" class="text-red-600 text-sm">
          {{ error }}
        </div>

        <div v-if="success" class="text-green-600 text-sm">
          Профиль успешно обновлен
        </div>

        <button
          type="submit"
          :disabled="saving"
          class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {{ saving ? 'Сохранение...' : 'Сохранить' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const authStore = useAuthStore()

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref(false)

const formData = ref({
  full_name: '',
  email: '',
  role: '',
  group_name: '',
  password: ''
})

function getRoleName(role) {
  const roles = {
    student: 'Студент',
    teacher: 'Преподаватель',
    curator: 'Куратор'
  }
  return roles[role] || role
}

async function loadProfile() {
  try {
    const response = await api.get(`/users/${authStore.user.id}`)
    formData.value = {
      full_name: response.data.full_name,
      email: response.data.email,
      role: response.data.role,
      group_name: response.data.group_name || '',
      password: ''
    }
    loading.value = false
  } catch (err) {
    error.value = 'Ошибка загрузки профиля'
    loading.value = false
  }
}

async function handleUpdate() {
  saving.value = true
  error.value = ''
  success.value = false

  try {
    const updateData = {
      full_name: formData.value.full_name
    }

    if (authStore.userRole === 'curator') {
      updateData.email = formData.value.email
      if (formData.value.password) {
        updateData.password = formData.value.password
      }
    }

    await api.put(`/users/${authStore.user.id}`, updateData)
    await authStore.fetchMe()
    success.value = true
    formData.value.password = ''
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка обновления профиля'
  }

  saving.value = false
}

onMounted(loadProfile)
</script>

```

## `frontend/src/views/Subjects.vue`

```vue
<template>
  <div class="px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Дисциплины</h1>
      <button
        @click="showAddModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Добавить дисциплину
      </button>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div v-if="loading" class="p-6 text-center text-gray-500">Загрузка...</div>
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Название
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Преподаватель
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="subject in subjects" :key="subject.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ subject.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ subject.teacher_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="editSubject(subject)"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                Редактировать
              </button>
              <button
                @click="deleteSubject(subject.id)"
                class="text-red-600 hover:text-red-900"
              >
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно добавления/редактирования дисциплины -->
    <div
      v-if="showAddModal || editingSubject"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 class="text-lg font-bold mb-4">
          {{ editingSubject ? 'Редактировать дисциплину' : 'Добавить дисциплину' }}
        </h3>
        <form @submit.prevent="saveSubject" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Название дисциплины</label>
            <input
              v-model="subjectForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Например: Математика"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Преподаватель</label>
            <select
              v-model="subjectForm.teacher_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Выберите преподавателя</option>
              <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                {{ teacher.full_name }}
              </option>
            </select>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(true)
const subjects = ref([])
const teachers = ref([])
const showAddModal = ref(false)
const editingSubject = ref(null)

const subjectForm = ref({
  name: '',
  teacher_id: ''
})

async function loadSubjects() {
  loading.value = true
  try {
    const response = await api.get('/subjects')
    subjects.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки дисциплин:', error)
  }
  loading.value = false
}

async function loadTeachers() {
  try {
    const response = await api.get('/users')
    teachers.value = response.data.filter(u => u.role === 'teacher')
  } catch (error) {
    console.error('Ошибка загрузки преподавателей:', error)
  }
}

async function saveSubject() {
  try {
    if (editingSubject.value) {
      await api.put(`/subjects/${editingSubject.value.id}`, subjectForm.value)
    } else {
      await api.post('/subjects', subjectForm.value)
    }
    closeModal()
    loadSubjects()
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка сохранения дисциплины')
  }
}

function editSubject(subject) {
  editingSubject.value = subject
  subjectForm.value = {
    name: subject.name,
    teacher_id: subject.teacher_id
  }
  showAddModal.value = true
}

async function deleteSubject(id) {
  if (!confirm('Вы уверены, что хотите удалить эту дисциплину?')) return

  try {
    await api.delete(`/subjects/${id}`)
    loadSubjects()
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка удаления дисциплины')
  }
}

function closeModal() {
  showAddModal.value = false
  editingSubject.value = null
  subjectForm.value = {
    name: '',
    teacher_id: ''
  }
}

onMounted(async () => {
  await Promise.all([loadSubjects(), loadTeachers()])
})
</script>

```

## `frontend/src/views/Users.vue`

```vue
<template>
  <div class="px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Пользователи</h1>
      <button
        @click="showAddModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Добавить пользователя
      </button>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div v-if="loading" class="p-6 text-center text-gray-500">Загрузка...</div>
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ФИО
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Роль
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Группа
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ user.full_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ user.email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="{
                  'bg-blue-100 text-blue-800': user.role === 'student',
                  'bg-green-100 text-green-800': user.role === 'teacher',
                  'bg-purple-100 text-purple-800': user.role === 'curator'
                }"
                class="px-2 py-1 text-xs font-semibold rounded-full"
              >
                {{ getRoleName(user.role) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ user.group_name || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="editUser(user)"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                Редактировать
              </button>
              <button
                v-if="user.id !== authStore.user.id"
                @click="deleteUser(user.id)"
                class="text-red-600 hover:text-red-900"
              >
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно добавления/редактирования пользователя -->
    <div
      v-if="showAddModal || editingUser"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 class="text-lg font-bold mb-4">
          {{ editingUser ? 'Редактировать пользователя' : 'Добавить пользователя' }}
        </h3>
        <form @submit.prevent="saveUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
            <input
              v-model="userForm.full_name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="userForm.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input
              v-model="userForm.password"
              type="password"
              :required="!editingUser"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              :placeholder="editingUser ? 'Оставьте пустым, если не хотите менять' : ''"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Роль</label>
            <select
              v-model="userForm.role"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="student">Студент</option>
              <option value="teacher">Преподаватель</option>
              <option value="curator">Куратор</option>
            </select>
          </div>
          <div v-if="userForm.role === 'student'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Группа</label>
            <select
              v-model="userForm.group_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Не назначена</option>
              <option v-for="group in groups" :key="group.id" :value="group.id">
                {{ group.name }}
              </option>
            </select>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const authStore = useAuthStore()

const loading = ref(true)
const users = ref([])
const groups = ref([])
const showAddModal = ref(false)
const editingUser = ref(null)

const userForm = ref({
  full_name: '',
  email: '',
  password: '',
  role: 'student',
  group_id: ''
})

function getRoleName(role) {
  const roles = {
    student: 'Студент',
    teacher: 'Преподаватель',
    curator: 'Куратор'
  }
  return roles[role] || role
}

async function loadUsers() {
  loading.value = true
  try {
    const response = await api.get('/users')
    users.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error)
  }
  loading.value = false
}

async function loadGroups() {
  try {
    const response = await api.get('/groups')
    groups.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки групп:', error)
  }
}

async function saveUser() {
  try {
    const data = { ...userForm.value }
    if (editingUser.value) {
      if (!data.password) {
        delete data.password
      }
      await api.put(`/users/${editingUser.value.id}`, data)
    } else {
      await api.post('/auth/register', data)
    }
    closeModal()
    loadUsers()
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка сохранения пользователя')
  }
}

function editUser(user) {
  editingUser.value = user
  userForm.value = {
    full_name: user.full_name,
    email: user.email,
    password: '',
    role: user.role,
    group_id: user.group_id || ''
  }
  showAddModal.value = true
}

async function deleteUser(id) {
  if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return

  try {
    await api.delete(`/users/${id}`)
    loadUsers()
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка удаления пользователя')
  }
}

function closeModal() {
  showAddModal.value = false
  editingUser.value = null
  userForm.value = {
    full_name: '',
    email: '',
    password: '',
    role: 'student',
    group_id: ''
  }
}

onMounted(async () => {
  await Promise.all([loadUsers(), loadGroups()])
})
</script>

```

## `frontend/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

```

## `frontend/vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}

```

## `frontend/vite.config.js`

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})

```

