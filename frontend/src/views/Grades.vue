<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="page-title">Оценки</h2>
        <p class="page-subtitle">Журнал успеваемости с фильтрацией и управлением</p>
      </div>
      <BaseButton v-if="authStore.userRole !== 'student'" variant="primary" @click="showAddModal = true">
        Добавить оценку
      </BaseButton>
    </div>

    <BaseCard v-if="authStore.userRole !== 'student'" class="!p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="label">Группа</label>
          <select v-model="filters.group_id" @change="onGroupChange" class="input">
          >
            <option value="">Все группы</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="label">Дисциплина</label>
          <select v-model="filters.subject_id" @change="loadGrades" class="input">
          >
            <option value="">Все дисциплины</option>
            <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
              {{ subject.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="label">Студент</label>
          <select v-model="filters.student_id" @change="loadGrades" class="input">
          >
            <option value="">Все студенты</option>
            <option v-for="student in students" :key="student.id" :value="student.id">
              {{ student.full_name }}
            </option>
          </select>
        </div>
      </div>
    </BaseCard>

    <BaseCard class="!p-0 overflow-hidden">
      <div v-if="loading" class="p-12 text-center text-slate-400">Загрузка...</div>
      <div v-else-if="grades.length === 0" class="p-12 text-center text-slate-400">Оценки не найдены</div>
      <div v-else class="overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-slate-50/80 dark:bg-slate-800/50">
          <tr>
            <th class="table-header">Дисциплина</th>
            <th class="table-header">Студент</th>
            <th class="table-header">Оценка</th>
            <th class="table-header">Тип работы</th>
            <th class="table-header">Дата</th>
            <th v-if="authStore.userRole !== 'student'" class="table-header">Действия</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
          <tr v-for="grade in grades" :key="grade.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
            <td class="table-cell">{{ grade.subject_name }}</td>
            <td class="table-cell">{{ grade.student_name }}</td>
            <td class="table-cell">
              <BaseBadge :variant="gradeVariant(grade.grade)">{{ grade.grade }}</BaseBadge>
            </td>
            <td class="table-cell">{{ grade.work_type }}</td>
            <td class="table-cell">{{ formatDate(grade.date) }}</td>
            <td v-if="authStore.userRole !== 'student'" class="table-cell">
              <div class="flex gap-2">
                <button type="button" class="text-accent text-sm hover:underline" @click="editGrade(grade)">Изменить</button>
                <button type="button" class="text-red-500 text-sm hover:underline" @click="deleteGrade(grade.id)">Удалить</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </BaseCard>

    <BaseModal v-model="modalOpen" :title="editingGrade ? 'Редактировать оценку' : 'Добавить оценку'">
      <form @submit.prevent="saveGrade" class="space-y-4">
        <div>
          <label class="label">Студент</label>
          <select v-model="gradeForm.student_id" required class="input">
            <option value="">Выберите студента</option>
              <option v-for="student in students" :key="student.id" :value="student.id">
                {{ student.full_name }}
              </option>
            </select>
          </div>
          <div>
            <label class="label">Дисциплина</label>
            <select v-model="gradeForm.subject_id" required class="input">
              <option value="">Выберите дисциплину</option>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">{{ subject.name }}</option>
            </select>
          </div>
          <div>
            <label class="label">Оценка</label>
            <select v-model="gradeForm.grade" required class="input">
              <option value="">Выберите оценку</option>
              <option value="5">5 (Отлично)</option>
              <option value="4">4 (Хорошо)</option>
              <option value="3">3 (Удовлетворительно)</option>
              <option value="2">2 (Неудовлетворительно)</option>
            </select>
          </div>
          <div>
            <label class="label">Тип работы</label>
            <input v-model="gradeForm.work_type" type="text" required class="input" placeholder="Лекция, Практика, Экзамен" />
          </div>
          <div>
            <label class="label">Дата</label>
            <input v-model="gradeForm.date" type="date" required class="input" />
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <BaseButton variant="secondary" @click="closeModal">Отмена</BaseButton>
            <BaseButton type="submit" variant="primary">Сохранить</BaseButton>
          </div>
        </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const grades = ref([])
const groups = ref([])
const subjects = ref([])
const students = ref([])

const showAddModal = ref(false)
const editingGrade = ref(null)

const modalOpen = computed({
  get: () => showAddModal.value || !!editingGrade.value,
  set: (v) => { if (!v) closeModal() },
})

function gradeVariant(grade) {
  return { 2: 'danger', 3: 'warning', 4: 'info', 5: 'success' }[grade] || 'default'
}

async function onGroupChange() {
  await loadStudents()
  await loadGrades()
}

const filters = ref({
  group_id: '',
  subject_id: '',
  student_id: ''
})

const gradeForm = ref({
  student_id: '',
  subject_id: '',
  grade: '',
  work_type: '',
  date: new Date().toISOString().split('T')[0]
})

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU')
}

async function loadGrades() {
  loading.value = true
  try {
    const params = {}
    if (filters.value.group_id) params.group_id = filters.value.group_id
    if (filters.value.subject_id) params.subject_id = filters.value.subject_id
    if (filters.value.student_id) params.student_id = filters.value.student_id

    const response = await api.get('/grades', { params })
    grades.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки оценок:', error)
  }
  loading.value = false
}

async function loadGroups() {
  try {
    const response = await api.get('/groups')
    groups.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки групп:', error)
  }
}

async function loadSubjects() {
  try {
    const response = await api.get('/subjects')
    subjects.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки дисциплин:', error)
  }
}

async function loadStudents() {
  try {
    if (filters.value.group_id) {
      const response = await api.get(`/groups/${filters.value.group_id}`)
      students.value = response.data.students || []
    } else {
      // Загружаем всех студентов для куратора
      if (authStore.userRole === 'curator') {
        const response = await api.get('/users')
        students.value = response.data.filter(u => u.role === 'student')
      } else {
        students.value = []
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки студентов:', error)
  }
}

async function saveGrade() {
  try {
    if (editingGrade.value) {
      await api.put(`/grades/${editingGrade.value.id}`, gradeForm.value)
    } else {
      await api.post('/grades', gradeForm.value)
    }
    closeModal()
    loadGrades()
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка сохранения оценки')
  }
}

function editGrade(grade) {
  editingGrade.value = grade
  gradeForm.value = {
    student_id: grade.student_id,
    subject_id: grade.subject_id,
    grade: grade.grade.toString(),
    work_type: grade.work_type,
    date: grade.date
  }
  showAddModal.value = true
}

async function deleteGrade(id) {
  if (!confirm('Вы уверены, что хотите удалить эту оценку?')) return

  try {
    await api.delete(`/grades/${id}`)
    loadGrades()
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка удаления оценки')
  }
}

function closeModal() {
  showAddModal.value = false
  editingGrade.value = null
  gradeForm.value = {
    student_id: '',
    subject_id: '',
    grade: '',
    work_type: '',
    date: new Date().toISOString().split('T')[0]
  }
}

onMounted(async () => {
  if (route.query.student_id) {
    filters.value.student_id = route.query.student_id
  }
  await Promise.all([loadGrades(), loadGroups(), loadSubjects()])
  if (authStore.userRole !== 'student') {
    await loadStudents()
  }
})
</script>

