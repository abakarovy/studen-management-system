<template>
  <div class="min-h-screen flex bg-slate-50 dark:bg-surface-dark">
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800 p-12 flex-col justify-between">
      <div class="relative z-10">
        <div class="flex items-center gap-3 text-white">
          <div class="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <GraduationCap class="h-6 w-6" />
          </div>
          <span class="text-lg font-bold">Система учёта студентов</span>
        </div>
      </div>
      <div class="relative z-10 space-y-6 text-white">
        <h1 class="text-4xl font-bold leading-tight tracking-tight">
          Современная платформа<br />для учёта группы
        </h1>
        <p class="text-indigo-100 text-lg max-w-md leading-relaxed">
          Управляйте успеваемостью, посещаемостью и расписанием в едином интуитивном интерфейсе.
        </p>
        <div class="flex gap-6 pt-4">
          <div>
            <p class="text-3xl font-bold">500+</p>
            <p class="text-indigo-200 text-sm">Студентов</p>
          </div>
          <div>
            <p class="text-3xl font-bold">98%</p>
            <p class="text-indigo-200 text-sm">Uptime</p>
          </div>
        </div>
      </div>
      <div class="absolute inset-0 opacity-30">
        <div class="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div class="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />
      </div>
    </div>

    <div class="flex flex-1 items-center justify-center p-6 sm:p-12">
      <div class="w-full max-w-md animate-fade-in">
        <div class="lg:hidden flex items-center gap-3 mb-8">
          <div class="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-white">
            <GraduationCap class="h-6 w-6" />
          </div>
          <span class="text-lg font-bold text-slate-900 dark:text-white">Учёт студентов</span>
        </div>

        <div class="card p-8 shadow-card-hover">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-1">Вход в систему</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-8">Введите учётные данные для доступа</p>

          <form @submit.prevent="handleLogin" class="space-y-5">
            <div>
              <label class="label">Email</label>
              <input
                v-model="email"
                type="email"
                required
                class="input"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label class="label">Пароль</label>
              <input
                v-model="password"
                type="password"
                required
                class="input"
                placeholder="Введите пароль"
              />
            </div>

            <div v-if="error" class="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {{ error }}
            </div>

            <BaseButton type="submit" variant="primary" block :disabled="loading">
              {{ loading ? 'Вход...' : 'Войти' }}
            </BaseButton>
          </form>

          <div class="mt-8 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
            <p class="font-semibold text-slate-700 dark:text-slate-300 mb-2">Тестовые учётные данные</p>
            <p>Куратор: curator@example.com / curator123</p>
            <p>Преподаватель: teacher1@example.com / teacher123</p>
            <p>Студент: student1@example.com / student123</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { GraduationCap } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const authStore = useAuthStore()
useThemeStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  const result = await authStore.login(email.value, password.value)
  if (result.success) {
    router.push({ name: 'Dashboard' })
  } else {
    error.value = result.error
  }
  loading.value = false
}
</script>
