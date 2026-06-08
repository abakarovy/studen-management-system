<template>
  <BaseCard class="h-full">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-semibold text-slate-900 dark:text-white">Лента активности</h3>
      <Bell class="h-4 w-4 text-slate-400" />
    </div>
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
    <ul v-else class="space-y-3 max-h-80 overflow-y-auto pr-1">
      <li
        v-for="item in activities"
        :key="item.id"
        class="flex gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div
          :class="[
            'mt-0.5 h-2 w-2 rounded-full shrink-0',
            typeColors[item.type] || typeColors.info,
          ]"
        />
        <div class="min-w-0 flex-1">
          <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{{ item.message }}</p>
          <p class="text-xs text-slate-400 mt-1">{{ item.time }}</p>
        </div>
      </li>
    </ul>
  </BaseCard>
</template>

<script setup>
import { Bell } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'

defineProps({
  activities: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const typeColors = {
  info: 'bg-sky-500',
  warning: 'bg-amber-500',
  alert: 'bg-red-500',
}
</script>
