import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/habits',
    name: 'Habits',
    component: () => import('@/views/HabitsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/habits/new',
    name: 'NewHabit',
    component: () => import('@/views/NewHabitView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ── Navigation Guards ──────────────────────────
router.beforeEach((to) => {
  const auth = useAuthStore()

  // Route requires auth → redirect to login if not logged in
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'Login' }
  }

  // Route requires guest → redirect to dashboard if already logged in
  if (to.meta.requiresGuest && auth.isLoggedIn) {
    return { name: 'Dashboard' }
  }
})

export default router
