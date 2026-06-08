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
