<template>
  <div class="space-y-6 animate-fade-in max-w-2xl">
    <div>
      <h2 class="page-title">Мой профиль</h2>
      <p class="page-subtitle">Управление личными данными и настройками аккаунта</p>
    </div>

    <BaseCard>
      <div v-if="loading" class="py-8 text-center text-slate-400">Загрузка...</div>

      <form v-else @submit.prevent="handleUpdate" class="space-y-5">
        <div>
          <label class="label">ФИО</label>
          <input v-model="formData.full_name" type="text" required class="input" />
        </div>
        <div>
          <label class="label">Email</label>
          <input
            v-model="formData.email"
            type="email"
            :disabled="authStore.userRole === 'student'"
            class="input disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label class="label">Роль</label>
          <input :value="getRoleName(formData.role)" type="text" disabled class="input opacity-60" />
        </div>
        <div v-if="formData.group_name">
          <label class="label">Группа</label>
          <input :value="formData.group_name" type="text" disabled class="input opacity-60" />
        </div>
        <div v-if="authStore.userRole === 'curator'">
          <label class="label">Новый пароль</label>
          <input v-model="formData.password" type="password" class="input" placeholder="Оставьте пустым, если не меняете" />
        </div>

        <div v-if="error" class="rounded-xl bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {{ error }}
        </div>
        <div v-if="success" class="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
          Профиль успешно обновлён
        </div>

        <BaseButton type="submit" variant="primary" :disabled="saving">
          {{ saving ? 'Сохранение...' : 'Сохранить изменения' }}
        </BaseButton>
      </form>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
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
  password: '',
})

function getRoleName(role) {
  return { student: 'Студент', teacher: 'Преподаватель', curator: 'Куратор' }[role] || role
}

async function loadProfile() {
  try {
    const response = await api.get(`/users/${authStore.user.id}`)
    formData.value = {
      full_name: response.data.full_name,
      email: response.data.email,
      role: response.data.role,
      group_name: response.data.group_name || '',
      password: '',
    }
  } catch {
    error.value = 'Ошибка загрузки профиля'
  } finally {
    loading.value = false
  }
}

async function handleUpdate() {
  saving.value = true
  error.value = ''
  success.value = false
  try {
    const updateData = { full_name: formData.value.full_name }
    if (authStore.userRole === 'curator') {
      updateData.email = formData.value.email
      if (formData.value.password) updateData.password = formData.value.password
    }
    await api.put(`/users/${authStore.user.id}`, updateData)
    await authStore.fetchMe()
    success.value = true
    formData.value.password = ''
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка обновления профиля'
  } finally {
    saving.value = false
  }
}

onMounted(loadProfile)
</script>
