// src/boot/axios.js
import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Set baseURL untuk axios global
axios.defaults.baseURL = 'http://localhost:5000/api'

// Tambah interceptor pada axios global (supaya import axios langsung juga otomatis pakai token)
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Buat api instance (optional, tapi juga di-setup agar konsisten)
const api = axios.create({
  baseURL: axios.defaults.baseURL,
})

// Tambah interceptor pada api instance juga
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor untuk menangani 401 secara global
const handleUnauthorized = (error) => {
  if (error.response?.status === 401) {
    console.warn('Token expired / unauthorized — clearing localStorage')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.setItem('isLoggedIn', 'false')
    // jika ingin redirect otomatis ke login:
    // window.location.href = '/'
  }
  return Promise.reject(error)
}
axios.interceptors.response.use((r) => r, handleUnauthorized)
api.interceptors.response.use((r) => r, handleUnauthorized)

export default boot(({ app }) => {
  // supaya bisa diakses di komponen Options API sebagai this.$axios / this.$api
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

// juga export supaya bisa import langsung di composition API / module scripts
export { api, axios }
