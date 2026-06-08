<template>
  <div class="space-y-6 animate-fade-in max-w-3xl">
    <div>
      <h2 class="page-title">Настройки</h2>
      <p class="page-subtitle">Персонализация интерфейса и профиль</p>
    </div>

    <BaseCard>
      <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-4">Внешний вид</h3>
      <div class="flex items-center justify-between py-3">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Moon v-if="!themeStore.isDark" class="h-5 w-5 text-slate-600" />
            <Sun v-else class="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p class="font-medium text-slate-900 dark:text-white">Тёмная тема</p>
            <p class="text-sm text-slate-500">Комфортный режим для работы вечером</p>
          </div>
        </div>
        <button
          type="button"
          :class="[
            'relative h-7 w-12 rounded-full transition-colors',
            themeStore.isDark ? 'bg-accent' : 'bg-slate-300 dark:bg-slate-600',
          ]"
          @click="themeStore.toggle()"
        >
          <span
            :class="[
              'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
              themeStore.isDark ? 'translate-x-5' : 'translate-x-0.5',
            ]"
          />
        </button>
      </div>
    </BaseCard>

    <BaseCard>
      <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-4">Профиль</h3>
      <div class="space-y-3 text-sm">
        <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
          <span class="text-slate-500">ФИО</span>
          <span class="font-medium">{{ authStore.user?.full_name }}</span>
        </div>
        <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
          <span class="text-slate-500">Email</span>
          <span class="font-medium">{{ authStore.user?.email }}</span>
        </div>
        <div class="flex justify-between py-2">
          <span class="text-slate-500">Роль</span>
          <BaseBadge variant="purple">{{ roleLabel }}</BaseBadge>
        </div>
      </div>
      <router-link :to="{ name: 'Profile' }" class="inline-block mt-4">
        <BaseButton variant="secondary">Редактировать профиль</BaseButton>
      </router-link>
    </BaseCard>

    <BaseCard>
      <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-2">О системе</h3>
      <p class="text-sm text-slate-500 leading-relaxed">
        Система учёта студентов группы — современная платформа для мониторинга успеваемости,
        посещаемости и академической активности. Версия 2.0
      </p>
    </BaseCard>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Moon, Sun } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const authStore = useAuthStore()
const themeStore = useThemeStore()

const roleLabels = {
  student: 'Студент',
  teacher: 'Преподаватель',
  curator: 'Куратор',
}
const roleLabel = computed(() => roleLabels[authStore.userRole] || '')
</script>
