<template>
  <div class="flex flex-wrap gap-3">
    <BaseButton
      v-for="action in visibleActions"
      :key="action.label"
      :variant="action.primary ? 'primary' : 'secondary'"
      :icon="action.icon"
      @click="action.onClick"
    >
      {{ action.label }}
    </BaseButton>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { UserPlus, FileDown, ClipboardCheck } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const props = defineProps({
  onExport: { type: Function, default: null },
})

const visibleActions = computed(() => {
  const role = authStore.userRole
  const actions = []

  if (role === 'curator' || role === 'teacher') {
    actions.push({
      label: 'Добавить студента',
      icon: UserPlus,
      primary: true,
      onClick: () => router.push({ name: role === 'curator' ? 'Users' : 'Students' }),
    })
    actions.push({
      label: 'Экспорт отчёта',
      icon: FileDown,
      primary: false,
      onClick: () => (props.onExport ? props.onExport() : exportReport()),
    })
    actions.push({
      label: 'Отметить посещаемость',
      icon: ClipboardCheck,
      primary: false,
      onClick: () => router.push({ name: 'Attendance' }),
    })
  }

  return actions
})

function exportReport() {
  const blob = new Blob(
    ['Отчёт по группе\nСгенерировано: ' + new Date().toLocaleString('ru-RU')],
    { type: 'text/plain;charset=utf-8' }
  )
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `otchet-gruppa-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
