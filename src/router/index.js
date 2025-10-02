import { createRouter, createWebHistory } from 'vue-router'

// Layouts
import LoginLayout from 'layouts/LoginLayout.vue'
import MainLayout from 'layouts/MainLayout.vue'

// Pages
import LoginPage from 'pages/LoginPage.vue'
import IndexPage from 'pages/IndexPage.vue'
import AllDevices from 'pages/AllDevices.vue'
import History from 'pages/HistoryPage.vue'
import DeviceDetail from 'pages/DeviceDetail.vue'
import ErrorNotFound from 'pages/ErrorNotFound.vue'

// Route helper: redirect kalau sudah login
const redirectIfAuthenticated = (to) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  // Jika sudah login dan mencoba akses halaman login, redirect ke home
  if (isLoggedIn && (to.path === '/' || to.name === 'Login')) {
    return '/home'
  }
  return undefined
}

const routes = [
  // Login layout
  {
    path: '/',
    component: LoginLayout,
    children: [
      {
        path: '',
        name: 'Login',
        component: LoginPage,
        beforeEnter: (to) => redirectIfAuthenticated(to),
      },
    ],
  },

  // Main layout (IndexPage dan halaman lain)
  {
    path: '/home',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'IndexPage', component: IndexPage },
      { path: 'all-devices', name: 'AllDevices', component: AllDevices },
      { path: 'history', name: 'HistoryPage', component: History },
      {
        path: 'device-detail/:deviceId',
        name: 'DeviceDetail',
        component: DeviceDetail,
        props: true, // Mengirimkan route params sebagai props ke komponen
      },
    ],
  },

  // 404
  { path: '/:catchAll(.*)*', component: ErrorNotFound },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Proteksi halaman yang butuh login
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  if (to.meta.requiresAuth && !isLoggedIn) {
    // Halaman membutuhkan auth tapi belum login
    next('/')
  } else if (to.path === '/' && isLoggedIn) {
    // Sudah login tapi mencoba akses halaman login
    next('/home')
  } else {
    next()
  }
})

export default router
