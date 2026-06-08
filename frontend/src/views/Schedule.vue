<template>
  <div class="space-y-6 animate-fade-in">
    <div>
      <h2 class="page-title">Расписание</h2>
      <p class="page-subtitle">Расписание занятий на текущую неделю</p>
    </div>

    <div class="flex gap-2 overflow-x-auto pb-2">
      <button
        v-for="day in weekDays"
        :key="day.key"
        type="button"
        :class="[
          'shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
          activeDay === day.key
            ? 'bg-accent text-white shadow-glow'
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-accent/50',
        ]"
        @click="activeDay = day.key"
      >
        {{ day.label }}
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <BaseCard
        v-for="lesson in filteredLessons"
        :key="lesson.id"
        hover
        class="group"
      >
        <div class="flex items-start justify-between mb-3">
          <BaseBadge :variant="lesson.type === 'lecture' ? 'info' : 'purple'">
            {{ lesson.type === 'lecture' ? 'Лекция' : 'Практика' }}
          </BaseBadge>
          <span class="text-sm font-mono text-slate-400">{{ lesson.time }}</span>
        </div>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-accent transition-colors">
          {{ lesson.subject }}
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-3">{{ lesson.teacher }}</p>
        <div class="flex items-center gap-2 text-xs text-slate-400">
          <MapPin class="h-3.5 w-3.5" />
          {{ lesson.room }}
        </div>
      </BaseCard>
    </div>

    <BaseCard v-if="!filteredLessons.length" class="text-center py-12 text-slate-400">
      На этот день занятий нет
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { MapPin } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const activeDay = ref('mon')

const weekDays = [
  { key: 'mon', label: 'Пн' },
  { key: 'tue', label: 'Вт' },
  { key: 'wed', label: 'Ср' },
  { key: 'thu', label: 'Чт' },
  { key: 'fri', label: 'Пт' },
  { key: 'sat', label: 'Сб' },
]

const schedule = [
  { id: 1, day: 'mon', time: '09:00–10:30', subject: 'Математика', teacher: 'Петров П.П.', room: 'Ауд. 201', type: 'lecture' },
  { id: 2, day: 'mon', time: '10:45–12:15', subject: 'Программирование', teacher: 'Петров П.П.', room: 'Лаб. 305', type: 'practice' },
  { id: 3, day: 'tue', time: '09:00–10:30', subject: 'Базы данных', teacher: 'Сидорова С.С.', room: 'Ауд. 102', type: 'lecture' },
  { id: 4, day: 'wed', time: '11:00–12:30', subject: 'Веб-разработка', teacher: 'Сидорова С.С.', room: 'Лаб. 401', type: 'practice' },
  { id: 5, day: 'thu', time: '09:00–10:30', subject: 'Математика', teacher: 'Петров П.П.', room: 'Ауд. 201', type: 'practice' },
  { id: 6, day: 'fri', time: '10:45–12:15', subject: 'Программирование', teacher: 'Петров П.П.', room: 'Лаб. 305', type: 'lecture' },
]

const filteredLessons = computed(() => schedule.filter((l) => l.day === activeDay.value))
</script>
