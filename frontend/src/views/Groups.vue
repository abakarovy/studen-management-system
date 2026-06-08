<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="page-title">Группы</h2>
        <p class="page-subtitle">Управление учебными группами</p>
      </div>
      <BaseButton variant="primary" @click="showAddModal = true">Добавить группу</BaseButton>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="group in groups"
        :key="group.id"
        class="card-hover p-6"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-semibold">{{ group.name }}</h3>
          <div class="flex space-x-2">
            <button
              @click="editGroup(group)"
              class="text-blue-600 hover:text-blue-900"
            >
              ✏️
            </button>
            <button
              @click="deleteGroup(group.id)"
              class="text-red-600 hover:text-red-900"
            >
              🗑️
            </button>
          </div>
        </div>
        <p class="text-sm text-gray-600 mb-2">Студентов: {{ group.student_count || 0 }}</p>
        <button
          @click="viewGroup(group)"
          class="text-blue-600 hover:text-blue-900 text-sm"
        >
          Просмотреть студентов →
        </button>
      </div>
    </div>

    <div v-if="groups.length === 0 && !loading" class="text-center text-gray-500 py-12">
      Группы не найдены
    </div>

    <BaseModal v-model="modalOpen" :title="editingGroup ? 'Редактировать группу' : 'Добавить группу'" size="sm">
      <form @submit.prevent="saveGroup" class="space-y-4">
        <div>
          <label class="label">Название группы</label>
          <input v-model="groupForm.name" type="text" required class="input" placeholder="Например: ИТ-21" />
        </div>
        <div class="flex justify-end gap-3">
          <BaseButton variant="secondary" @click="closeModal">Отмена</BaseButton>
          <BaseButton type="submit" variant="primary">Сохранить</BaseButton>
        </div>
      </form>
    </BaseModal>

    <BaseModal v-model="studentsModalOpen" :title="`Студенты группы ${selectedGroup?.name || ''}`" size="lg">
        <div v-if="groupStudentsLoading" class="text-center py-8 text-gray-500">
          Загрузка...
        </div>
        <div v-else-if="groupStudents.length === 0" class="text-center py-8 text-gray-500">
          В группе нет студентов
        </div>
        <table v-else class="min-w-full">
          <thead class="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th class="table-header">ФИО</th>
              <th class="table-header">Email</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <tr v-for="student in groupStudents" :key="student.id">
              <td class="table-cell">{{ student.full_name }}</td>
              <td class="table-cell">{{ student.email }}</td>
            </tr>
          </tbody>
        </table>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import api from '@/services/api'

const loading = ref(true)
const groups = ref([])
const showAddModal = ref(false)
const editingGroup = ref(null)
const selectedGroup = ref(null)
const groupStudents = ref([])
const groupStudentsLoading = ref(false)

const studentsModalOpen = computed({
  get: () => !!selectedGroup.value,
  set: (v) => { if (!v) selectedGroup.value = null },
})

const groupForm = ref({ name: '' })

const modalOpen = computed({
  get: () => showAddModal.value || !!editingGroup.value,
  set: (v) => { if (!v) closeModal() },
})

async function loadGroups() {
  loading.value = true
  try {
    const response = await api.get('/groups')
    groups.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки групп:', error)
  }
  loading.value = false
}

async function saveGroup() {
  try {
    if (editingGroup.value) {
      await api.put(`/groups/${editingGroup.value.id}`, groupForm.value)
    } else {
      await api.post('/groups', groupForm.value)
    }
    closeModal()
    loadGroups()
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка сохранения группы')
  }
}

function editGroup(group) {
  editingGroup.value = group
  groupForm.value = { name: group.name }
  showAddModal.value = true
}

async function deleteGroup(id) {
  if (!confirm('Вы уверены, что хотите удалить эту группу?')) return

  try {
    await api.delete(`/groups/${id}`)
    loadGroups()
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка удаления группы')
  }
}

async function viewGroup(group) {
  selectedGroup.value = group
  groupStudentsLoading.value = true
  try {
    const response = await api.get(`/groups/${group.id}`)
    groupStudents.value = response.data.students || []
  } catch (error) {
    console.error('Ошибка загрузки студентов:', error)
  }
  groupStudentsLoading.value = false
}

function closeModal() {
  showAddModal.value = false
  editingGroup.value = null
  groupForm.value = { name: '' }
}

onMounted(loadGroups)
</script>

