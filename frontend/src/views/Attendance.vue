<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="page-title">Посещаемость</h2>
        <p class="page-subtitle">{{ todayLabel }} — отметьте присутствующих студентов</p>
      </div>
      <BaseButton variant="primary" :icon="Save" @click="saveAttendance">
        Сохранить журнал
      </BaseButton>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <BaseCard>
        <p class="text-sm text-slate-500">Присутствуют</p>
        <p class="text-3xl font-bold text-emerald-600 mt-1">{{ presentCount }}</p>
      </BaseCard>
      <BaseCard>
        <p class="text-sm text-slate-500">Отсутствуют</p>
        <p class="text-3xl font-bold text-red-600 mt-1">{{ absentCount }}</p>
      </BaseCard>
      <BaseCard>
        <p class="text-sm text-slate-500">Процент посещаемости</p>
        <p class="text-3xl font-bold text-accent mt-1">{{ attendancePercent }}%</p>
      </BaseCard>
    </div>

    <BaseCard class="!p-0 overflow-hidden">
      <div v-if="loading" class="p-12 text-center text-slate-400">Загрузка...</div>
      <div v-else class="divide-y divide-slate-100 dark:divide-slate-700">
        <div
          v-for="student in students"
          :key="student.id"
          class="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
        >
          <div class="flex items-center gap-3">
            <BaseAvatar :name="student.full_name" size="sm" />
            <div>
              <p class="font-medium text-slate-900 dark:text-white">{{ student.full_name }}</p>
              <p class="text-xs text-slate-400">{{ student.group_name || 'Без группы' }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              :class="[
                'rounded-xl px-4 py-2 text-sm font-medium transition-all',
                attendance[student.id] === 'present'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
              ]"
              @click="attendance[student.id] = 'present'"
            >
              Присутствует
            </button>
            <button
              type="button"
              :class="[
                'rounded-xl px-4 py-2 text-sm font-medium transition-all',
                attendance[student.id] === 'absent'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 ring-2 ring-red-500/30'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20',
              ]"
              @click="attendance[student.id] = 'absent'"
            >
              Отсутствует
            </button>
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { Save } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import { useAnalytics } from '@/composables/useAnalytics'

const { loading, students, load } = useAnalytics()
const attendance = reactive({})

const todayKey = new Date().toISOString().split('T')[0]
const todayLabel = new Date().toLocaleDateString('ru-RU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const presentCount = computed(() =>
  Object.values(attendance).filter((v) => v === 'present').length
)
const absentCount = computed(() =>
  Object.values(attendance).filter((v) => v === 'absent').length
)
const attendancePercent = computed(() => {
  const total = students.value.length
  if (!total) return 0
  return Math.round((presentCount.value / total) * 100)
})

function loadSaved() {
  const saved = localStorage.getItem(`attendance-${todayKey}`)
  if (saved) {
    Object.assign(attendance, JSON.parse(saved))
  } else {
    for (const s of students.value) {
      attendance[s.id] = 'present'
    }
  }
}

function saveAttendance() {
  localStorage.setItem(`attendance-${todayKey}`, JSON.stringify(attendance))
  alert('Журнал посещаемости сохранён')
}

onMounted(async () => {
  await load()
  loadSaved()
})
</script>
