<template>
  <div class="px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Группы</h1>
      <button
        @click="showAddModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Добавить группу
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="group in groups"
        :key="group.id"
        class="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
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

    <!-- Модальное окно добавления/редактирования группы -->
    <div
      v-if="showAddModal || editingGroup"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 class="text-lg font-bold mb-4">
          {{ editingGroup ? 'Редактировать группу' : 'Добавить группу' }}
        </h3>
        <form @submit.prevent="saveGroup" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Название группы</label>
            <input
              v-model="groupForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Например: ИТ-21"
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

    <!-- Модальное окно просмотра студентов группы -->
    <div
      v-if="selectedGroup"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="selectedGroup = null"
    >
      <div class="relative top-20 mx-auto p-5 border w-2/3 max-w-4xl shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold">Студенты группы {{ selectedGroup.name }}</h3>
          <button
            @click="selectedGroup = null"
            class="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div v-if="groupStudentsLoading" class="text-center py-8 text-gray-500">
          Загрузка...
        </div>
        <div v-else-if="groupStudents.length === 0" class="text-center py-8 text-gray-500">
          В группе нет студентов
        </div>
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="student in groupStudents" :key="student.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ student.full_name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ student.email }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(true)
const groups = ref([])
const showAddModal = ref(false)
const editingGroup = ref(null)
const selectedGroup = ref(null)
const groupStudents = ref([])
const groupStudentsLoading = ref(false)

const groupForm = ref({
  name: ''
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

