<template>
  <div class="px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Оценки</h1>
      <button
        v-if="authStore.userRole !== 'student'"
        @click="showAddModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Добавить оценку
      </button>
    </div>

    <!-- Фильтры для преподавателя и куратора -->
    <div v-if="authStore.userRole !== 'student'" class="bg-white shadow rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Группа</label>
          <select
            v-model="filters.group_id"
            @change="loadGrades"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Все группы</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Дисциплина</label>
          <select
            v-model="filters.subject_id"
            @change="loadGrades"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Все дисциплины</option>
            <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
              {{ subject.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Студент</label>
          <select
            v-model="filters.student_id"
            @change="loadGrades"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Все студенты</option>
            <option v-for="student in students" :key="student.id" :value="student.id">
              {{ student.full_name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div v-if="loading" class="p-6 text-center text-gray-500">Загрузка...</div>
      <div v-else-if="grades.length === 0" class="p-6 text-center text-gray-500">
        Оценки не найдены
      </div>
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Дисциплина
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Студент
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Оценка
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Тип работы
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Дата
            </th>
            <th v-if="authStore.userRole !== 'student'" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="grade in grades" :key="grade.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ grade.subject_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ grade.student_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="{
                  'bg-red-100 text-red-800': grade.grade === 2,
                  'bg-yellow-100 text-yellow-800': grade.grade === 3,
                  'bg-blue-100 text-blue-800': grade.grade === 4,
                  'bg-green-100 text-green-800': grade.grade === 5
                }"
                class="px-2 py-1 text-xs font-semibold rounded-full"
              >
                {{ grade.grade }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ grade.work_type }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatDate(grade.date) }}
            </td>
            <td v-if="authStore.userRole !== 'student'" class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="editGrade(grade)"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                Редактировать
              </button>
              <button
                @click="deleteGrade(grade.id)"
                class="text-red-600 hover:text-red-900"
              >
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно добавления/редактирования оценки -->
    <div
      v-if="showAddModal || editingGrade"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 class="text-lg font-bold mb-4">
          {{ editingGrade ? 'Редактировать оценку' : 'Добавить оценку' }}
        </h3>
        <form @submit.prevent="saveGrade" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Студент</label>
            <select
              v-model="gradeForm.student_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Выберите студента</option>
              <option v-for="student in students" :key="student.id" :value="student.id">
                {{ student.full_name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Дисциплина</label>
            <select
              v-model="gradeForm.subject_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Выберите дисциплину</option>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                {{ subject.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Оценка</label>
            <select
              v-model="gradeForm.grade"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Выберите оценку</option>
              <option value="5">5 (Отлично)</option>
              <option value="4">4 (Хорошо)</option>
              <option value="3">3 (Удовлетворительно)</option>
              <option value="2">2 (Неудовлетворительно)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Тип работы</label>
            <input
              v-model="gradeForm.work_type"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Например: Лекция, Практика, Экзамен"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Дата</label>
            <input
              v-model="gradeForm.date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const authStore = useAuthStore()

const loading = ref(true)
const grades = ref([])
const groups = ref([])
const subjects = ref([])
const students = ref([])

const showAddModal = ref(false)
const editingGrade = ref(null)

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
  await Promise.all([loadGrades(), loadGroups(), loadSubjects()])
  if (authStore.userRole !== 'student') {
    await loadStudents()
  }
})
</script>

