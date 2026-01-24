<template>
  <div class="px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Дисциплины</h1>
      <button
        @click="showAddModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Добавить дисциплину
      </button>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div v-if="loading" class="p-6 text-center text-gray-500">Загрузка...</div>
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Название
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Преподаватель
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="subject in subjects" :key="subject.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ subject.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ subject.teacher_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="editSubject(subject)"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                Редактировать
              </button>
              <button
                @click="deleteSubject(subject.id)"
                class="text-red-600 hover:text-red-900"
              >
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно добавления/редактирования дисциплины -->
    <div
      v-if="showAddModal || editingSubject"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 class="text-lg font-bold mb-4">
          {{ editingSubject ? 'Редактировать дисциплину' : 'Добавить дисциплину' }}
        </h3>
        <form @submit.prevent="saveSubject" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Название дисциплины</label>
            <input
              v-model="subjectForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Например: Математика"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Преподаватель</label>
            <select
              v-model="subjectForm.teacher_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Выберите преподавателя</option>
              <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                {{ teacher.full_name }}
              </option>
            </select>
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
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(true)
const subjects = ref([])
const teachers = ref([])
const showAddModal = ref(false)
const editingSubject = ref(null)

const subjectForm = ref({
  name: '',
  teacher_id: ''
})

async function loadSubjects() {
  loading.value = true
  try {
    const response = await api.get('/subjects')
    subjects.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки дисциплин:', error)
  }
  loading.value = false
}

async function loadTeachers() {
  try {
    const response = await api.get('/users')
    teachers.value = response.data.filter(u => u.role === 'teacher')
  } catch (error) {
    console.error('Ошибка загрузки преподавателей:', error)
  }
}

async function saveSubject() {
  try {
    if (editingSubject.value) {
      await api.put(`/subjects/${editingSubject.value.id}`, subjectForm.value)
    } else {
      await api.post('/subjects', subjectForm.value)
    }
    closeModal()
    loadSubjects()
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка сохранения дисциплины')
  }
}

function editSubject(subject) {
  editingSubject.value = subject
  subjectForm.value = {
    name: subject.name,
    teacher_id: subject.teacher_id
  }
  showAddModal.value = true
}

async function deleteSubject(id) {
  if (!confirm('Вы уверены, что хотите удалить эту дисциплину?')) return

  try {
    await api.delete(`/subjects/${id}`)
    loadSubjects()
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка удаления дисциплины')
  }
}

function closeModal() {
  showAddModal.value = false
  editingSubject.value = null
  subjectForm.value = {
    name: '',
    teacher_id: ''
  }
}

onMounted(async () => {
  await Promise.all([loadSubjects(), loadTeachers()])
})
</script>

