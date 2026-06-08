<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="page-title">Дисциплины</h2>
        <p class="page-subtitle">Управление учебными дисциплинами и преподавателями</p>
      </div>
      <BaseButton variant="primary" @click="showAddModal = true">Добавить дисциплину</BaseButton>
    </div>

    <BaseCard class="!p-0 overflow-hidden">
      <div v-if="loading" class="p-12 text-center text-slate-400">Загрузка...</div>
      <div v-else class="overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-slate-50/80 dark:bg-slate-800/50">
          <tr>
            <th class="table-header">Название</th>
            <th class="table-header">Преподаватель</th>
            <th class="table-header">Действия</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
          <tr v-for="subject in subjects" :key="subject.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
            <td class="table-cell font-medium">{{ subject.name }}</td>
            <td class="table-cell">{{ subject.teacher_name }}</td>
            <td class="table-cell">
              <div class="flex gap-2">
                <button type="button" class="text-accent text-sm hover:underline" @click="editSubject(subject)">Изменить</button>
                <button type="button" class="text-red-500 text-sm hover:underline" @click="deleteSubject(subject.id)">Удалить</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </BaseCard>

    <BaseModal v-model="modalOpen" :title="editingSubject ? 'Редактировать дисциплину' : 'Добавить дисциплину'">
      <form @submit.prevent="saveSubject" class="space-y-4">
        <div>
          <label class="label">Название дисциплины</label>
          <input v-model="subjectForm.name" type="text" required class="input" placeholder="Например: Математика" />
        </div>
        <div>
          <label class="label">Преподаватель</label>
          <select v-model="subjectForm.teacher_id" required class="input">
            <option value="">Выберите преподавателя</option>
            <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">{{ teacher.full_name }}</option>
          </select>
        </div>
        <div class="flex justify-end gap-3">
          <BaseButton variant="secondary" @click="closeModal">Отмена</BaseButton>
          <BaseButton type="submit" variant="primary">Сохранить</BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import api from '@/services/api'

const loading = ref(true)
const subjects = ref([])
const teachers = ref([])
const showAddModal = ref(false)
const editingSubject = ref(null)

const modalOpen = computed({
  get: () => showAddModal.value || !!editingSubject.value,
  set: (v) => { if (!v) closeModal() },
})

const subjectForm = ref({ name: '', teacher_id: '' })

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

