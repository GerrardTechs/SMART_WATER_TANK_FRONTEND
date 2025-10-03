<template>
  <q-page class="q-pa-md bg-primary">
    <!-- Header -->
    <q-card class="q-pa-md no-shadow q-mb-md header-card" bordered>
      <div class="row items-center">
        <q-btn flat round dense icon="arrow_back" @click="$router.push({ name: 'AllDevices' })" />
        <div class="q-ml-sm">
          <p class="text-h6 text-weight-bold text-primary q-mb-xs">
            {{ deviceInfo.tank_name || `Water Tank ${deviceId}` }}
          </p>
          <p class="text-subtitle text-grey-7">
            {{ deviceInfo.description || 'Live monitoring and history' }}
          </p>
        </div>
      </div>
    </q-card>

    <!-- Loading -->
    <div v-if="loading" class="text-center q-py-lg">
      <q-spinner color="white" size="3em" />
      <p class="text-white q-mt-sm">Loading device data...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center q-py-lg">
      <q-icon name="error" color="negative" size="3em" />
      <p class="text-negative q-mt-sm">{{ error }}</p>
      <q-btn color="white" text-color="primary" label="Retry" @click="fetchDeviceInfo" />
    </div>

    <!-- Device Detail -->
    <div v-else>
      <q-card class="q-pa-md no-shadow q-mb-md data-card" bordered>
        <div class="col-12 text-center">
          <div class="tank">
            <div
              class="water"
              :style="{
                height: (deviceInfo.water_level || 0) + '%',
                backgroundColor: getTankWaterColor(deviceInfo.water_level || 0),
              }"
            ></div>
          </div>
          <div class="q-mt-sm">
            <div class="text-subtitle1 text-weight-bold">{{ deviceInfo.water_level || 0 }}%</div>
            <div class="text-caption">Water Level</div>
          </div>
        </div>

        <div class="q-mt-md q-px-md text-blue">
          <div><b>Device ID:</b> {{ deviceId }}</div>
          <div><b>Last update:</b> {{ formatDate(deviceInfo.created_at) }}</div>
          <div>
            <b>Status:</b>
            <q-badge
              :label="getTankStatus(deviceInfo.water_level || 0)"
              :color="getTankWaterColor(deviceInfo.water_level || 0)"
            />
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
// import mqttjs from 'mqtt' // siap dipakai nanti kalau mau live update

const route = useRoute()
const deviceId = route.params.deviceId

const deviceInfo = ref({})
const loading = ref(false)
const error = ref(null)

const fetchDeviceInfo = async () => {
  loading.value = true
  error.value = null
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get(`http://localhost:5000/api/water-tanks/${deviceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    deviceInfo.value = res.data
  } catch (err) {
    console.error('❌ Error fetching device info:', err)
    error.value = 'Failed to load device information.'
  } finally {
    loading.value = false
  }
}

const getTankWaterColor = (level) => {
  if (level > 75) return 'blue'
  if (level > 25) return 'yellow'
  return 'red'
}

const getTankStatus = (level) => {
  if (level > 75) return 'High'
  if (level > 25) return 'Normal'
  return 'Low'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
}

onMounted(fetchDeviceInfo)
</script>

<style scoped>
.bg-primary {
  background: #0d47a1 !important;
}
.header-card,
.data-card {
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.tank {
  position: relative;
  width: 120px;
  height: 180px;
  border: 2px solid #000;
  border-radius: 8px;
  overflow: hidden;
  margin: auto;
}
.water {
  position: absolute;
  bottom: 0;
  width: 100%;
  transition: height 0.5s ease;
}
.text-blue {
  color: #3d4b8f;
}
</style>
