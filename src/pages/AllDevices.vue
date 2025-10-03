<template>
  <q-page class="q-pa-md bg-animated">
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
      <q-card
        v-for="tank in tanks"
        :key="tank.water_tank_id"
        class="tank-container no-shadow q-pa-sm col-5 animated-card"
      >
        <div class="tank">
          <div
            class="water"
            :style="{
              height: (tank.water_level || 0) + '%',
              backgroundColor: getTankWaterColor(tank.water_level || 0),
            }"
          >
            <!-- animasi wave -->
            <div class="water-wave"></div>
          </div>
        </div>
        <q-card-section>
          <div class="text-center text-weight-bold water-level-text">
            {{ tank.tank_name }}
          </div>
          <div class="text-center text-weight-bold water-level-text">
            Water Level - {{ tank.water_level || 0 }}%
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Last update: {{ formatDate(tank.created_at) || '—' }}
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
            @click="goToDeviceDetail(tank.water_tank_id)"
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

export default {
  setup() {
    const tanks = ref([])
    const loading = ref(false)
    const error = ref(null)
    const router = useRouter()
    let intervalId = null

    const fetchTanks = async () => {
      error.value = null
      try {
        const user = JSON.parse(localStorage.getItem('user'))
        const token = localStorage.getItem('token')
        if (!user || !token) throw new Error('User not logged in')

        const response = await axios.get(
          `http://localhost:5000/api/water-tanks?user_id=${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
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
      router.push(`/home/device-detail/${tankId}`)
    }

    onMounted(() => {
      loading.value = true
      fetchTanks()
      // 🔁 interval setiap 2 detik untuk auto-refresh data tangki
      intervalId = setInterval(fetchTanks, 2000)
    })

    onUnmounted(() => {
      if (intervalId) clearInterval(intervalId)
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
  overflow: hidden;
}
.water-wave {
  position: absolute;
  bottom: 0;
  width: 200%;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  animation: wave 4s infinite linear;
}
@keyframes wave {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-25%);
  }
  100% {
    transform: translateX(0);
  }
}
.bg-animated {
  background: linear-gradient(-45deg, #1e3c72, #2a5298, #1e3c72, #000428);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
.animated-card {
  transition: transform 0.3s ease;
}
.animated-card:hover {
  transform: translateY(-5px);
}
.water-level-text {
  color: #0c0d11;
}
</style>
