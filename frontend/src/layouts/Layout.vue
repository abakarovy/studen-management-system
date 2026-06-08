<template>
  <div class="min-h-screen bg-slate-50 dark:bg-surface-dark">
    <Sidebar
      :collapsed="sidebarCollapsed"
      :mobile-open="mobileOpen"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
      @close-mobile="mobileOpen = false"
      @navigate="mobileOpen = false"
    />

    <div
      :class="[
        'flex min-h-screen flex-col transition-all duration-300',
        sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64',
      ]"
    >
      <TopBar
        :activities="activities"
        @toggle-mobile="mobileOpen = !mobileOpen"
        @logout="handleLogout"
      />

      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <router-view v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'
import TopBar from '@/components/layout/TopBar.vue'
import { useAuthStore } from '@/stores/auth'
import { useActivities } from '@/composables/useActivities'

const router = useRouter()
const authStore = useAuthStore()
const { activities, load: loadActivities } = useActivities()

const sidebarCollapsed = ref(false)
const mobileOpen = ref(false)

function handleLogout() {
  authStore.logout()
  router.push({ name: 'Login' })
}

onMounted(loadActivities)
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
