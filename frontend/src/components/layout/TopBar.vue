<template>
  <header
    class="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md px-4 sm:px-6"
  >
    <div class="flex items-center gap-3 min-w-0">
      <button
        type="button"
        class="btn-ghost p-2 rounded-xl lg:hidden"
        @click="$emit('toggle-mobile')"
      >
        <Menu class="h-5 w-5" />
      </button>
      <div class="min-w-0">
        <h1 class="text-lg font-semibold text-slate-900 dark:text-white truncate">{{ pageTitle }}</h1>
        <p v-if="subtitle" class="text-xs text-slate-400 truncate hidden sm:block">{{ subtitle }}</p>
      </div>
    </div>

    <div class="flex items-center gap-2 sm:gap-3">
      <button
        type="button"
        class="btn-ghost p-2.5 rounded-xl relative"
        @click="showNotifications = !showNotifications"
      >
        <Bell class="h-5 w-5" />
        <span v-if="activities.length" class="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
      </button>

      <button type="button" class="btn-ghost p-2.5 rounded-xl" @click="themeStore.toggle()">
        <Sun v-if="themeStore.isDark" class="h-5 w-5" />
        <Moon v-else class="h-5 w-5" />
      </button>

      <div class="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
        <BaseAvatar :name="authStore.user?.full_name" size="sm" />
        <div class="hidden md:block text-right">
          <p class="text-sm font-medium text-slate-900 dark:text-white leading-tight">
            {{ authStore.user?.full_name }}
          </p>
          <p class="text-xs text-slate-400">{{ roleLabel }}</p>
        </div>
      </div>

      <button type="button" class="btn-ghost p-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" @click="$emit('logout')">
        <LogOut class="h-5 w-5" />
      </button>
    </div>

    <Transition name="dropdown">
      <div
        v-if="showNotifications"
        class="absolute right-4 top-16 w-80 card shadow-xl z-50 max-h-96 overflow-hidden"
      >
        <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <p class="font-semibold text-sm">Уведомления</p>
        </div>
        <ul class="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
          <li
            v-for="item in activities.slice(0, 6)"
            :key="item.id"
            class="px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <p class="text-slate-700 dark:text-slate-300">{{ item.message }}</p>
            <p class="text-xs text-slate-400 mt-1">{{ item.time }}</p>
          </li>
          <li v-if="!activities.length" class="px-4 py-6 text-center text-slate-400 text-sm">
            Нет новых уведомлений
          </li>
        </ul>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, Bell, Sun, Moon, LogOut } from 'lucide-vue-next'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

defineProps({
  activities: { type: Array, default: () => [] },
})

defineEmits(['toggle-mobile', 'logout'])

const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const showNotifications = ref(false)

const titles = {
  Dashboard: 'Панель управления',
  Students: 'Студенты',
  Attendance: 'Посещаемость',
  Grades: 'Оценки',
  Schedule: 'Расписание',
  Settings: 'Настройки',
  Profile: 'Профиль',
  Users: 'Пользователи',
  Groups: 'Группы',
  Subjects: 'Дисциплины',
}

const pageTitle = computed(() => titles[route.name] || 'Система учёта')
const subtitle = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
})

const roleLabels = {
  student: 'Студент',
  teacher: 'Преподаватель',
  curator: 'Куратор',
}
const roleLabel = computed(() => roleLabels[authStore.userRole] || '')
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
