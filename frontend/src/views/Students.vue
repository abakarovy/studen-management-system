<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="page-title">Студенты</h2>
        <p class="page-subtitle">Управление списком студентов группы с фильтрацией и сортировкой</p>
      </div>
      <QuickActions v-if="canManage" />
    </div>

    <StudentTable
      :students="students"
      :loading="loading"
      :get-student-status="getStudentStatus"
      :get-student-average="getStudentAverage"
      :show-actions="canManage"
      :page-size="10"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import StudentTable from '@/components/dashboard/StudentTable.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'
import { useAnalytics } from '@/composables/useAnalytics'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const authStore = useAuthStore()
const {
  loading,
  students,
  getStudentStatus,
  getStudentAverage,
  load,
} = useAnalytics()

const canManage = computed(() => authStore.userRole === 'curator')

async function handleEdit(student) {
  if (!canManage.value) return
  try {
    await api.put(`/users/${student.id}`, { full_name: student.full_name })
    await load()
  } catch (e) {
    alert(e.response?.data?.error || 'Ошибка сохранения')
  }
}

async function handleDelete(student) {
  if (!confirm(`Удалить студента ${student.full_name}?`)) return
  try {
    await api.delete(`/users/${student.id}`)
    await load()
  } catch (e) {
    alert(e.response?.data?.error || 'Ошибка удаления')
  }
}

onMounted(load)
</script>
