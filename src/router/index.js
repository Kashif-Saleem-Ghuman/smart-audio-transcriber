/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from '@/components/LoginForm.vue'
import SignupForm from '@/components/SignupForm.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DashboardHome from '@/views/DashboardHome.vue'
import UploadAudio from '@/views/UploadAudio.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginForm
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupForm
  },
  {
    path: '/dashboard',
    component: DashboardLayout,
    children: [
      {
        path: '',
        redirect: '/dashboard/upload'
      },
      {
        path: 'upload',
        name: 'Upload',
        component: UploadAudio
      },
      {
        path: 'listing',
        name: 'Listing',
        component: DashboardHome
      }
    ],
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guard
// router.beforeEach((to, from, next) => {
//   // Check if route requires auth
//   if (to.matched.some(record => record.meta.requiresAuth)) {
//     // Check if user is logged in
//     const isLoggedIn = localStorage.getItem('user') // Implement your auth check
    
//     if (!isLoggedIn) {
//       next('/login')
//     } else {
//       next()
//     }
//   } else {
//     next()
//   }
// })

export default router
