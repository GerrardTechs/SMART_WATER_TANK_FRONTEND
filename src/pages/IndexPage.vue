<template>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
  />
  <q-page class="q-pa-md bg-primary">
    <div v-if="$q.platform.is.mobile">
      <!-- Header -->
      <div>
        <div class="text-h5 text-white text-weight-bold">Hello, {{ username }}</div>
        <div class="text-h6 text-white q-mb-md text-caption text-blue-2">Welcome back to home</div>
      </div>

      <!-- Card Home -->
      <q-card class="q-pa-md no-shadow q-mb-md bg-blue-1 cardd" bordered>
        <p class="text-weight-bold text-primary texttitle text-h6">Home page</p>
        <p class="text-weight-bold text-caption text-grey-5">
          Water is the driving force of all nature
        </p>
      </q-card>

      <!-- Device List -->
      <div class="row">
        <div class="text-h6 text-white q-mb-md text-caption text-blue-2 col-9 q-ml-sm">
          Your Devices
        </div>
      </div>

      <div v-if="loading" class="text-white">⏳ Loading tanks...</div>
      <div v-else-if="tanks.length === 0" class="text-white">❌ Belum ada tangki terdaftar</div>

      <div v-else>
        <div v-for="tank in tanks" :key="tank.water_tank_id" class="q-mb-md">
          <q-card class="q-pa-md no-shadow bg-blue-1 cardd" bordered>
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
                ></div>
              </div>
              <q-card-section>
                <div class="text-center text-weight-bold textcoy">
                  <p>Water Level {{ tank.water_level || 0 }}%</p>
                  <p class="text-caption text-grey-4">
                    Last Update: {{ formatDate(tank.created_at) }}
                  </p>
                  <p class="text-caption" :class="tank.relay_status ? 'text-green' : 'text-red'">
                    Relay: {{ tank.relay_status ? 'ON' : 'OFF' }}
                  </p>
                </div>
              </q-card-section>
            </q-card>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import axios from 'axios'
// import mqttjs from 'mqtt' // MQTT di-comment dulu untuk keamanan

export default {
  data() {
    return {
      username: 'User',
      userId: null,
      tanks: [],
      loading: true,
      refreshInterval: null,
      // client: null, // MQTT client di-comment
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
          await this.fetchTanks()
          this.refreshInterval = setInterval(this.fetchTanks, 10000)
          // this.setupMQTT() // MQTT di-comment dulu
        }
      } catch (e) {
        console.error('❌ Error parsing user data:', e)
      }
    }
  },
  beforeUnmount() {
    if (this.refreshInterval) clearInterval(this.refreshInterval)
    // if (this.client) this.client.end(true) // MQTT di-comment
  },
  methods: {
    async fetchTanks() {
      if (!this.userId) return
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(
          `http://localhost:5000/api/water-tanks?user_id=${this.userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        this.tanks = res.data || []
      } catch (err) {
        console.error('❌ Gagal fetch tanks:', err)
        console.log('Local token:', localStorage.getItem('token'))
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
    formatDate(date) {
      if (!date) return '-'
      const d = new Date(date)
      return isNaN(d) ? date : d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    },

    // setupMQTT() { ... } // MQTT function di-comment
  },
}
</script>

<style scoped>
.cardd {
  border-radius: 20px;
}
.texttitle {
  margin-bottom: 0px;
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
}
.water {
  position: absolute;
  bottom: 0;
  width: 100%;
  transition: height 0.5s ease-in-out;
}
</style>
