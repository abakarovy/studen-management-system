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
