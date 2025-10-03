<template>
  <q-page class="q-pa-md bg-animated">
    <div v-if="$q.platform.is.mobile">
      <!-- Header -->
      <div class="q-mb-md flex justify-between items-center">
        <div>
          <div class="text-h5 text-white text-weight-bold">Hello, {{ username }}</div>
          <div class="text-h6 text-white text-caption text-blue-3">Welcome back to home</div>
        </div>
        <q-icon name="water" size="32px" color="white" />
      </div>

      <!-- Card Home -->
      <q-card class="q-pa-md no-shadow q-mb-md bg-blue-1 cardd animated-card" bordered>
        <p class="text-weight-bold text-primary texttitle text-h6">Home page</p>
        <p class="text-weight-bold text-caption text-grey-5">
          Water is the driving force of all nature
        </p>
      </q-card>

      <!-- Current Water Tank -->
      <div class="row">
        <div class="text-h6 text-white q-mb-md text-caption text-blue-2 col-9 q-ml-sm">
          Current Data Water Tank
        </div>
      </div>

      <div v-if="loading" class="text-white">⏳ Loading tank...</div>
      <div v-else-if="!tank" class="text-white">❌ Belum ada tangki terdaftar</div>

      <div v-else>
        <q-card class="q-pa-md no-shadow bg-blue-1 cardd animated-card" bordered>
          <p class="q-mb-md text-weight-bold text-caption text-primary">
            {{ tank.tank_name || 'Water Tank ' + tank.water_tank_id }}
          </p>
          <q-card class="tank-container no-shadow q-pa-sm">
            <div class="tank">
              <div
                class="water"
                :style="{
                  height: (tank.water_level || 0) + '%',
                  backgroundColor: waterColor(tank.water_level || 0),
                }"
              >
                <div class="water-wave"></div>
              </div>
            </div>
            <q-card-section>
              <div class="text-center text-weight-bold textcoy">
                <p>Water Level {{ tank.water_level || 0 }}%</p>
              </div>
            </q-card-section>
          </q-card>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      username: 'User',
      userId: null,
      tank: null,
      loading: true,
      refreshInterval: null,
    }
  },
  async mounted() {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        this.username = user.username || 'User'
        this.userId = user.id || null
        if (this.userId) {
          await this.fetchTank()
          // ⏳ auto refresh setiap 2 detik
          this.refreshInterval = setInterval(this.fetchTank, 2000)
        }
      } catch (e) {
        console.error('❌ Error parsing user data:', e)
      }
    }
  },
  beforeUnmount() {
    if (this.refreshInterval) clearInterval(this.refreshInterval)
  },
  methods: {
    async fetchTank() {
      if (!this.userId) return
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(
          `http://localhost:5000/api/water-tanks?user_id=${this.userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        this.tank = res.data && res.data.length > 0 ? res.data[0] : null
      } catch (err) {
        console.error('❌ Gagal fetch tank:', err)
      } finally {
        this.loading = false
      }
    },
    waterColor(level) {
      if (level > 75) return 'darkblue'
      if (level > 50) return 'blue'
      if (level > 25) return 'yellow'
      return 'red'
    },
  },
}
</script>

<style scoped>
.cardd {
  border-radius: 20px;
}
.texttitle {
  margin-bottom: 10px;
}
.tank-container {
  max-width: 100%;
  max-height: 225px;
  text-align: center;
}
.tank {
  position: relative;
  width: 100%;
  height: 200px;
  border: 2px solid #000;
  border-radius: 5px;
  overflow: hidden;
  margin: auto;
  background: #e3f2fd;
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
</style>
