// src/composables/useWaterTanks.js
import { ref } from 'vue'
import axios from 'axios'

// State reaktif
const devices = ref([]) // Data semua water tanks
const history = ref([]) // Data history untuk tabel
const loading = ref(false) // Loading state
const error = ref(null) // Error state

// Base URL backend
const API_BASE = 'http://localhost:3000/api' // ganti sesuai backend-mu

// Ambil semua water tanks
async function fetchDevices() {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get(`${API_BASE}/water_tanks`)
    devices.value = res.data
  } catch (err) {
    error.value = err.message || 'Failed to fetch devices'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Ambil history
async function fetchHistory() {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get(`${API_BASE}/history`)
    history.value = res.data
  } catch (err) {
    error.value = err.message || 'Failed to fetch history'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Ambil detail satu device berdasarkan ID
async function fetchDeviceDetail(id) {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get(`${API_BASE}/water_tanks/${id}`)
    return res.data // langsung return detail
  } catch (err) {
    error.value = err.message || 'Failed to fetch device detail'
    console.error(err)
    return null
  } finally {
    loading.value = false
  }
}

// Export composable
export function useWaterTanks() {
  return {
    devices,
    fetchDevices,
    history,
    fetchHistory,
    loading,
    error,
    fetchDeviceDetail,
  }
}
