<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="page-title">Пользователи</h2>
        <p class="page-subtitle">Управление учётными записями системы</p>
      </div>
      <BaseButton variant="primary" :icon="UserPlus" @click="showAddModal = true">
        Добавить пользователя
      </BaseButton>
    </div>

    <BaseCard class="!p-0 overflow-hidden">
      <div v-if="loading" class="p-12 text-center text-slate-400">Загрузка...</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-slate-50/80 dark:bg-slate-800/50">
            <tr>
              <th class="table-header">ФИО</th>
              <th class="table-header">Email</th>
              <th class="table-header">Роль</th>
              <th class="table-header">Группа</th>
              <th class="table-header">Действия</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
            <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
              <td class="table-cell">
                <div class="flex items-center gap-3">
                  <BaseAvatar :name="user.full_name" size="sm" />
                  <span class="font-medium">{{ user.full_name }}</span>
                </div>
              </td>
              <td class="table-cell">{{ user.email }}</td>
              <td class="table-cell">
                <BaseBadge :variant="roleVariant(user.role)">{{ getRoleName(user.role) }}</BaseBadge>
              </td>
              <td class="table-cell">{{ user.group_name || '—' }}</td>
              <td class="table-cell">
                <div class="flex gap-2">
                  <button type="button" class="text-accent hover:underline text-sm" @click="editUser(user)">Изменить</button>
                  <button
                    v-if="user.id !== authStore.user.id"
                    type="button"
                    class="text-red-500 hover:underline text-sm"
                    @click="deleteUser(user.id)"
                  >
                    Удалить
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>

    <BaseModal
      v-model="modalOpen"
      :title="editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'"
    >
      <form @submit.prevent="saveUser" class="space-y-4">
        <div>
          <label class="label">ФИО</label>
          <input v-model="userForm.full_name" type="text" required class="input" />
        </div>
        <div>
          <label class="label">Email</label>
          <input v-model="userForm.email" type="email" required class="input" />
        </div>
        <div>
          <label class="label">Пароль</label>
          <input
            v-model="userForm.password"
            type="password"
            :required="!editingUser"
            class="input"
            :placeholder="editingUser ? 'Оставьте пустым, если не меняете' : ''"
          />
        </div>
        <div>
          <label class="label">Роль</label>
          <select v-model="userForm.role" required class="input">
            <option value="student">Студент</option>
            <option value="teacher">Преподаватель</option>
            <option value="curator">Куратор</option>
          </select>
        </div>
        <div v-if="userForm.role === 'student'">
          <label class="label">Группа</label>
          <select v-model="userForm.group_id" class="input">
            <option value="">Не назначена</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
          </select>
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
import { ref, computed, onMounted } from 'vue'
import { UserPlus } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const authStore = useAuthStore()
const loading = ref(true)
const users = ref([])
const groups = ref([])
const showAddModal = ref(false)
const editingUser = ref(null)

const modalOpen = computed({
  get: () => showAddModal.value || !!editingUser.value,
  set: (v) => { if (!v) closeModal() },
})

const userForm = ref({
  full_name: '',
  email: '',
  password: '',
  role: 'student',
  group_id: '',
})

function getRoleName(role) {
  return { student: 'Студент', teacher: 'Преподаватель', curator: 'Куратор' }[role] || role
}

function roleVariant(role) {
  return { student: 'info', teacher: 'success', curator: 'purple' }[role] || 'default'
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

