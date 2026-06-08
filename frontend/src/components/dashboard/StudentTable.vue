<template>
  <BaseCard class="!p-0 overflow-hidden">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-slate-200 dark:border-slate-700">
      <div>
        <h3 class="text-base font-semibold text-slate-900 dark:text-white">{{ title }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ filtered.length }} записей</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            v-model="search"
            type="search"
            placeholder="Поиск студента..."
            class="input pl-9 w-full sm:w-56"
          />
        </div>
        <select v-model="statusFilter" class="input w-auto min-w-[140px]">
          <option value="">Все статусы</option>
          <option value="default">Активен</option>
          <option value="success">Отличник</option>
          <option value="danger">Под риском</option>
          <option value="info">Новый</option>
        </select>
        <select v-model="sortBy" class="input w-auto min-w-[130px]">
          <option value="name">По имени</option>
          <option value="grade">По баллу</option>
          <option value="group">По группе</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="p-12 text-center text-slate-400">Загрузка...</div>
    <div v-else class="overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-slate-50/80 dark:bg-slate-800/50">
          <tr>
            <th class="table-header">Студент</th>
            <th class="table-header">Группа</th>
            <th class="table-header">Средний балл</th>
            <th class="table-header">Статус</th>
            <th v-if="showActions" class="table-header text-right">Действия</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
          <tr
            v-for="student in paginated"
            :key="student.id"
            class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
          >
            <td class="table-cell">
              <div class="flex items-center gap-3">
                <BaseAvatar :name="student.full_name" size="sm" />
                <div>
                  <p
                    v-if="editingId === student.id"
                    class="flex items-center gap-2"
                  >
                    <input
                      v-model="editName"
                      class="input py-1.5 text-sm w-48"
                      @keyup.enter="saveEdit(student)"
                      @keyup.escape="cancelEdit"
                    />
                    <button type="button" class="text-emerald-600" @click="saveEdit(student)">
                      <Check class="h-4 w-4" />
                    </button>
                  </p>
                  <template v-else>
                    <p class="font-medium text-slate-900 dark:text-white">{{ student.full_name }}</p>
                    <p class="text-xs text-slate-400">{{ student.email }}</p>
                  </template>
                </div>
              </div>
            </td>
            <td class="table-cell">{{ student.group_name || '—' }}</td>
            <td class="table-cell">
              <span class="font-semibold tabular-nums">{{ getStudentAverage(student.id) }}</span>
            </td>
            <td class="table-cell">
              <BaseBadge :variant="getStudentStatus(student.id).variant">
                {{ getStudentStatus(student.id).label }}
              </BaseBadge>
            </td>
            <td v-if="showActions" class="table-cell text-right">
              <div class="relative inline-block">
                <button
                  type="button"
                  class="btn-ghost p-2 rounded-lg"
                  @click="toggleMenu(student.id)"
                >
                  <MoreHorizontal class="h-4 w-4" />
                </button>
                <Transition name="dropdown">
                  <div
                    v-if="openMenuId === student.id"
                    class="absolute right-0 mt-1 w-44 card py-1 z-20 shadow-lg"
                  >
                    <button
                      type="button"
                      class="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      @click="startEdit(student)"
                    >
                      <Pencil class="h-3.5 w-3.5" /> Редактировать
                    </button>
                    <router-link
                      :to="{ name: 'Grades', query: { student_id: student.id } }"
                      class="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      @click="openMenuId = null"
                    >
                      <BookOpen class="h-3.5 w-3.5" /> Оценки
                    </router-link>
                    <button
                      type="button"
                      class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      @click="$emit('delete', student)"
                    >
                      <Trash2 class="h-3.5 w-3.5" /> Удалить
                    </button>
                  </div>
                </Transition>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="!loading && filtered.length > pageSize"
      class="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-500"
    >
      <span>Стр. {{ page }} из {{ totalPages }}</span>
      <div class="flex gap-2">
        <button type="button" class="btn-secondary py-1.5 px-3" :disabled="page <= 1" @click="page--">Назад</button>
        <button type="button" class="btn-secondary py-1.5 px-3" :disabled="page >= totalPages" @click="page++">Далее</button>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Search, MoreHorizontal, Pencil, Trash2, Check, BookOpen } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const props = defineProps({
  students: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  getStudentStatus: { type: Function, required: true },
  getStudentAverage: { type: Function, required: true },
  showActions: { type: Boolean, default: true },
  title: { type: String, default: 'Студенты группы' },
  pageSize: { type: Number, default: 8 },
})

const emit = defineEmits(['edit', 'delete'])

const search = ref('')
const statusFilter = ref('')
const sortBy = ref('name')
const page = ref(1)
const openMenuId = ref(null)
const editingId = ref(null)
const editName = ref('')

const enriched = computed(() =>
  props.students.map((s) => ({
    ...s,
    statusVariant: props.getStudentStatus(s.id).variant,
    avgNum: parseFloat(props.getStudentAverage(s.id)) || 0,
  }))
)

const filtered = computed(() => {
  let list = enriched.value
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(
      (s) => s.full_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    )
  }
  if (statusFilter.value) {
    list = list.filter((s) => s.statusVariant === statusFilter.value)
  }
  if (sortBy.value === 'name') list = [...list].sort((a, b) => a.full_name.localeCompare(b.full_name))
  if (sortBy.value === 'grade') list = [...list].sort((a, b) => b.avgNum - a.avgNum)
  if (sortBy.value === 'group') list = [...list].sort((a, b) => (a.group_name || '').localeCompare(b.group_name || ''))
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / props.pageSize)))
const paginated = computed(() => {
  const start = (page.value - 1) * props.pageSize
  return filtered.value.slice(start, start + props.pageSize)
})

watch([search, statusFilter, sortBy], () => { page.value = 1 })

function toggleMenu(id) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function startEdit(student) {
  editingId.value = student.id
  editName.value = student.full_name
  openMenuId.value = null
}

function cancelEdit() {
  editingId.value = null
  editName.value = ''
}

function saveEdit(student) {
  if (editName.value.trim()) {
    emit('edit', { ...student, full_name: editName.value.trim() })
  }
  cancelEdit()
}

function onClickOutside(e) {
  if (!e.target.closest('.relative')) openMenuId.value = null
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
