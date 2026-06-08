<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 dark:border-slate-700/80 bg-white dark:bg-surface-dark transition-all duration-300',
      collapsed ? 'w-[72px]' : 'w-64',
      mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
  >
    <div class="flex h-16 items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-700/80">
      <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shrink-0">
        <GraduationCap class="h-5 w-5" />
      </div>
      <div v-if="!collapsed" class="min-w-0 animate-fade-in">
        <p class="text-sm font-bold text-slate-900 dark:text-white truncate">Учёт студентов</p>
        <p class="text-xs text-slate-400 truncate">Группа · SaaS</p>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto p-3 space-y-1">
      <router-link
        v-for="item in mainNav"
        :key="item.name"
        :to="item.to"
        :class="[isActive(item) ? 'nav-link-active' : 'nav-link', collapsed && 'justify-center px-2']"
        :title="collapsed ? item.label : undefined"
        @click="$emit('navigate')"
      >
        <component :is="item.icon" class="h-5 w-5 shrink-0" />
        <span v-if="!collapsed">{{ item.label }}</span>
      </router-link>

      <div v-if="adminNav.length && !collapsed" class="pt-4 pb-1">
        <p class="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Администрирование</p>
      </div>
      <router-link
        v-for="item in adminNav"
        :key="item.name"
        :to="item.to"
        :class="[isActive(item) ? 'nav-link-active' : 'nav-link', collapsed && 'justify-center px-2']"
        :title="collapsed ? item.label : undefined"
        @click="$emit('navigate')"
      >
        <component :is="item.icon" class="h-5 w-5 shrink-0" />
        <span v-if="!collapsed">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="p-3 border-t border-slate-200 dark:border-slate-700/80 space-y-1">
      <router-link
        :to="{ name: 'Settings' }"
        :class="[isActive({ name: 'Settings' }) ? 'nav-link-active' : 'nav-link', collapsed && 'justify-center px-2']"
        @click="$emit('navigate')"
      >
        <Settings class="h-5 w-5 shrink-0" />
        <span v-if="!collapsed">Настройки</span>
      </router-link>
      <button
        type="button"
        :class="['nav-link w-full', collapsed && 'justify-center px-2']"
        @click="$emit('toggle-collapse')"
      >
        <PanelLeftClose v-if="!collapsed" class="h-5 w-5 shrink-0" />
        <PanelLeft v-else class="h-5 w-5 shrink-0" />
        <span v-if="!collapsed">Свернуть</span>
      </button>
    </div>
  </aside>

  <div
    v-if="mobileOpen"
    class="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
    @click="$emit('close-mobile')"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BookOpen,
  Calendar,
  Settings,
  UserCog,
  Layers,
  BookMarked,
  GraduationCap,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

defineProps({
  collapsed: { type: Boolean, default: false },
  mobileOpen: { type: Boolean, default: false },
})

defineEmits(['toggle-collapse', 'close-mobile', 'navigate'])

const route = useRoute()
const authStore = useAuthStore()

const mainNav = computed(() => {
  const items = [
    { name: 'Dashboard', label: 'Панель', icon: LayoutDashboard, to: { name: 'Dashboard' } },
    { name: 'Students', label: 'Студенты', icon: Users, to: { name: 'Students' } },
    { name: 'Attendance', label: 'Посещаемость', icon: ClipboardList, to: { name: 'Attendance' } },
    { name: 'Grades', label: 'Оценки', icon: BookOpen, to: { name: 'Grades' } },
    { name: 'Schedule', label: 'Расписание', icon: Calendar, to: { name: 'Schedule' } },
  ]
  if (authStore.userRole === 'student') {
    return items.filter((i) => ['Dashboard', 'Grades', 'Schedule'].includes(i.name))
  }
  return items
})

const adminNav = computed(() => {
  if (authStore.userRole !== 'curator') return []
  return [
    { name: 'Users', label: 'Пользователи', icon: UserCog, to: { name: 'Users' } },
    { name: 'Groups', label: 'Группы', icon: Layers, to: { name: 'Groups' } },
    { name: 'Subjects', label: 'Дисциплины', icon: BookMarked, to: { name: 'Subjects' } },
  ]
})

function isActive(item) {
  return route.name === item.name
}
</script>
