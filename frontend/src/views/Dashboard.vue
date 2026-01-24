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

