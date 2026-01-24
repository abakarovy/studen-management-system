import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue')
      },
      {
        path: 'grades',
        name: 'Grades',
        component: () => import('@/views/Grades.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { requiresRole: 'curator' }
      },
      {
        path: 'groups',
        name: 'Groups',
        component: () => import('@/views/Groups.vue'),
        meta: { requiresRole: 'curator' }
      },
      {
        path: 'subjects',
        name: 'Subjects',
        component: () => import('@/views/Subjects.vue'),
        meta: { requiresRole: 'curator' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.meta.requiresAuth === false && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
  } else if (to.meta.requiresRole && authStore.user?.role !== to.meta.requiresRole) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router

