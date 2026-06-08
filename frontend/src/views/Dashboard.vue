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
