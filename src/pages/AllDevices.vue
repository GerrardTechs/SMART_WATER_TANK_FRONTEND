<template>
  <q-page class="q-pa-md bg-primary">
    <!-- Header -->
    <q-card class="q-pa-md no-shadow q-mb-md header-card" bordered>
      <p class="text-h5 text-weight-bold text-primary">All Devices</p>
      <p class="text-subtitle text-grey-7">Monitor your devices in real time!</p>
    </q-card>

    <!-- Loading -->
    <div v-if="loading" class="text-center q-py-lg">
      <q-spinner color="white" size="3em" />
      <p class="text-white q-mt-sm">Loading devices...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center q-py-lg">
      <q-icon name="error" color="negative" size="3em" />
      <p class="text-negative q-mt-sm">{{ error }}</p>
      <q-btn color="white" text-color="primary" label="Retry" @click="fetchTanks" />
    </div>

    <!-- Tanks Grid -->
    <div v-else class="row q-gutter-md justify-center">
      <q-card v-for="tank in tanks" :key="tank.id" class="tank-container no-shadow q-pa-sm col-5">
        <div class="tank">
          <div
            class="water"
            :style="{
              height: (tank.water_level || 0) + '%',
              backgroundColor: getTankWaterColor(tank.water_level || 0),
            }"
          ></div>
        </div>
        <q-card-section>
          <div class="text-center text-weight-bold water-level-text">
            {{ tank.tank_name || 'Water Tank ' + tank.id }}
          </div>
          <div class="text-center text-weight-bold water-level-text">
            Water Level - {{ tank.water_level || 0 }}%
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Last update: {{ formatDate(tank.created_at) }}
          </div>
        </q-card-section>
        <div class="text-center q-mt-sm">
          <q-btn
            flat
            round
            dense
            icon="info"
            color="primary"
            label="Detail"
            @click="goToDeviceDetail(tank.id)"
          />
        </div>
      </q-card>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && tanks.length === 0" class="text-center q-py-lg">
      <q-icon name="water_drop" color="white" size="3em" />
      <p class="text-white q-mt-sm">No water tanks found</p>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

export default {
  setup() {
    const tanks = ref([])
    const loading = ref(false)
    const error = ref(null)
    const router = useRouter()

    const fetchTanks = async () => {
      loading.value = true
      error.value = null
      try {
        const user = JSON.parse(localStorage.getItem('user'))
        if (!user) throw new Error('User not logged in')

        const response = await axios.get(`http://localhost:5000/api/water-tanks?user_id=${user.id}`)
        tanks.value = response.data
      } catch (err) {
        console.error('Error fetching tanks:', err)
        error.value = 'Failed to load devices.'
      } finally {
        loading.value = false
      }
    }

    const getTankWaterColor = (level) => {
      if (level > 75) return 'darkblue'
      if (level > 50) return 'blue'
      if (level > 25) return 'yellow'
      return 'red'
    }

    const formatDate = (date) => {
      if (!date) return '-'
      return new Date(date).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    }

    const goToDeviceDetail = (tankId) => {
      router.push({ name: 'DeviceDetail', params: { deviceId: String(tankId) } })
    }

    onMounted(() => {
      fetchTanks()
    })

    return {
      tanks,
      loading,
      error,
      fetchTanks,
      getTankWaterColor,
      formatDate,
      goToDeviceDetail,
    }
  },
}
</script>

<style scoped>
.bg-primary {
  background-color: #0d47a1 !important;
}
.header-card {
  border-radius: 20px;
}
.tank-container {
  max-width: 100%;
  width: 95%;
  background-color: #e3f2fd;
  border-radius: 15px;
}
.tank {
  position: relative;
  width: 110px;
  height: 150px;
  border: 2px solid #000;
  border-radius: 5px;
  overflow: hidden;
  margin: auto;
}
.water {
  position: absolute;
  bottom: 0;
  width: 100%;
  transition: height 0.5s ease-in-out;
}
.water-level-text {
  color: #0c0d11;
}
</style>
