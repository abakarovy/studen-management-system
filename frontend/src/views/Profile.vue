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

