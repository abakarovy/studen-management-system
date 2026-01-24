<template>
  <div class="px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Пользователи</h1>
      <button
        @click="showAddModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Добавить пользователя
      </button>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div v-if="loading" class="p-6 text-center text-gray-500">Загрузка...</div>
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ФИО
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Роль
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Группа
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ user.full_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ user.email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="{
                  'bg-blue-100 text-blue-800': user.role === 'student',
                  'bg-green-100 text-green-800': user.role === 'teacher',
                  'bg-purple-100 text-purple-800': user.role === 'curator'
                }"
                class="px-2 py-1 text-xs font-semibold rounded-full"
              >
                {{ getRoleName(user.role) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ user.group_name || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="editUser(user)"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                Редактировать
              </button>
              <button
                v-if="user.id !== authStore.user.id"
                @click="deleteUser(user.id)"
                class="text-red-600 hover:text-red-900"
              >
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно добавления/редактирования пользователя -->
    <div
      v-if="showAddModal || editingUser"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 class="text-lg font-bold mb-4">
          {{ editingUser ? 'Редактировать пользователя' : 'Добавить пользователя' }}
        </h3>
        <form @submit.prevent="saveUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
            <input
              v-model="userForm.full_name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="userForm.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input
              v-model="userForm.password"
              type="password"
              :required="!editingUser"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              :placeholder="editingUser ? 'Оставьте пустым, если не хотите менять' : ''"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Роль</label>
            <select
              v-model="userForm.role"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="student">Студент</option>
              <option value="teacher">Преподаватель</option>
              <option value="curator">Куратор</option>
            </select>
          </div>
          <div v-if="userForm.role === 'student'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Группа</label>
            <select
              v-model="userForm.group_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Не назначена</option>
              <option v-for="group in groups" :key="group.id" :value="group.id">
                {{ group.name }}
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
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const authStore = useAuthStore()

const loading = ref(true)
const users = ref([])
const groups = ref([])
const showAddModal = ref(false)
const editingUser = ref(null)

const userForm = ref({
  full_name: '',
  email: '',
  password: '',
  role: 'student',
  group_id: ''
})

function getRoleName(role) {
  const roles = {
    student: 'Студент',
    teacher: 'Преподаватель',
    curator: 'Куратор'
  }
  return roles[role] || role
}

async function loadUsers() {
  loading.value = true
  try {
    const response = await api.get('/users')
    users.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error)
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

async function saveUser() {
  try {
    const data = { ...userForm.value }
    if (editingUser.value) {
      if (!data.password) {
        delete data.password
      }
      await api.put(`/users/${editingUser.value.id}`, data)
    } else {
      await api.post('/auth/register', data)
    }
    closeModal()
    loadUsers()
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка сохранения пользователя')
  }
}

function editUser(user) {
  editingUser.value = user
  userForm.value = {
    full_name: user.full_name,
    email: user.email,
    password: '',
    role: user.role,
    group_id: user.group_id || ''
  }
  showAddModal.value = true
}

async function deleteUser(id) {
  if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return

  try {
    await api.delete(`/users/${id}`)
    loadUsers()
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка удаления пользователя')
  }
}

function closeModal() {
  showAddModal.value = false
  editingUser.value = null
  userForm.value = {
    full_name: '',
    email: '',
    password: '',
    role: 'student',
    group_id: ''
  }
}

onMounted(async () => {
  await Promise.all([loadUsers(), loadGroups()])
})
</script>

