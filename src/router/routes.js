import LoginLayout from 'layouts/LoginLayout.vue'
import MainLayout from 'layouts/MainLayout.vue'

import LoginPage from 'pages/LoginPage.vue'
import IndexPage from 'pages/IndexPage.vue'
import AllDevices from 'pages/AllDevices.vue'
import History from 'pages/HistoryPage.vue'
import DeviceDetail from 'pages/DeviceDetail.vue'
import ErrorNotFound from 'pages/ErrorNotFound.vue'

// helper redirect otomatis jika user sudah login
const redirectIfAuthenticated = () => {
  const user = localStorage.getItem('user')
  return user ? '/home' : undefined
}

const routes = [
  // LOGIN / REGISTER
  {
    path: '/',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      {
        path: '',

        component: () => import('pages/LoginPage.vue'),
        beforeEnter: () => redirectIfAuthenticated(),
      },
    ],
  },

  // MAIN LAYOUT / HALAMAN SETELAH LOGIN
  {
    path: '/home',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', component: IndexPage, name: 'IndexPage' },
      { path: 'all-devices', component: AllDevices, name: 'AllDevices' },
      { path: 'history', component: History, name: 'HistoryPage' },
      { path: 'device-detail/:id?', component: DeviceDetail, name: 'DeviceDetail' },
    ],
  },

  // ERROR 404
  { path: '/:catchAll(.*)*', component: ErrorNotFound },
]

export default routes
