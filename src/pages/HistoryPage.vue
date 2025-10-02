<template>
  <q-page class="q-pa-md bg-primary">
    <q-card class="q-pa-md history-card">
      <!-- Header -->
      <div class="q-mb-md">
        <p class="text-h5 text-blue text-weight-bold">History Data</p>
        <p class="text-caption text-blue-7">Sensor & relay history</p>
      </div>

      <!-- Filters -->
      <div class="row q-gutter-md q-mb-md">
        <q-select
          v-model="selectedDevice"
          :options="deviceOptions"
          label="Select Device"
          outlined
          dense
          options-dense
          style="min-width: 200px"
          class="bg-white"
        />

        <q-input
          v-model="dateRange.from"
          label="From Date"
          outlined
          dense
          type="date"
          class="bg-white"
        />

        <q-input
          v-model="dateRange.to"
          label="To Date"
          outlined
          dense
          type="date"
          class="bg-white"
        />

        <q-btn color="secondary" label="Apply Filters" @click="loadHistory" />
      </div>

      <!-- Tabs -->
      <q-tabs
        v-model="activeTab"
        dense
        class="text-white"
        active-color="white"
        indicator-color="white"
      >
        <q-tab name="water" label="Water Level History" />
        <q-tab name="login" label="Login History" />
      </q-tabs>

      <q-separator class="bg-white" />

      <!-- Water Level Tab -->
      <div v-if="activeTab === 'water'">
        <q-table
          :rows="history"
          :columns="waterColumns"
          row-key="id"
          flat
          dense
          :loading="loading"
          no-data-label="No history available"
          class="q-mt-sm"
        >
          <template v-slot:body-cell-created_at="props">
            <q-td :props="props">{{ formatDate(props.row.created_at) }}</q-td>
          </template>

          <template v-slot:body-cell-water_level="props">
            <q-td :props="props">
              <q-badge :color="getWaterColor(props.row.water_level)" class="text-white">
                {{ props.row.water_level }}%
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-relay="props">
            <q-td :props="props">
              <q-badge :color="props.row.relay === 1 ? 'green' : 'red'" class="text-white">
                {{ props.row.relay === 1 ? 'ON' : 'OFF' }}
              </q-badge>
            </q-td>
          </template>
        </q-table>
      </div>

      <!-- Login History Tab -->
      <div v-if="activeTab === 'login'">
        <q-table
          :rows="loginHistory"
          :columns="loginColumns"
          row-key="id"
          flat
          dense
          :loading="loadingLogin"
          no-data-label="No login history available"
          class="q-mt-sm"
        >
          <template v-slot:body-cell-created_at="props">
            <q-td :props="props">{{ formatDate(props.row.created_at) }}</q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="props.row.status === 'success' ? 'green' : 'red'" class="text-white">
                {{ props.row.status }}
              </q-badge>
            </q-td>
          </template>
        </q-table>
      </div>

      <!-- Error -->
      <div v-if="error" class="text-negative q-mt-sm">{{ error }}</div>
    </q-card>
  </q-page>
</template>

<script>
import mqttjs from 'mqtt'
import axios from 'axios'

export default {
  name: 'HistoryPage',
  data() {
    return {
      API_BASE: 'http://localhost:5000/api',
      history: [],
      loginHistory: [],
      loading: false,
      loadingLogin: false,
      error: null,
      client: null,
      devices: [],
      selectedDevice: null,
      dateRange: { from: '', to: '' },
      activeTab: 'water',
      waterColumns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'device_name', label: 'Device', field: 'device_name', align: 'left' },
        { name: 'created_at', label: 'Time', field: 'created_at', align: 'left' },
        { name: 'water_level', label: 'Water Level (%)', field: 'water_level', align: 'center' },
        { name: 'relay', label: 'Relay', field: 'relay', align: 'center' },
      ],
      loginColumns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'created_at', label: 'Time', field: 'created_at', align: 'left' },
        { name: 'username_attempt', label: 'Username', field: 'username_attempt', align: 'left' },
        { name: 'ip_address', label: 'IP Address', field: 'ip_address', align: 'left' },
        { name: 'status', label: 'Status', field: 'status', align: 'center' },
      ],
    }
  },
  computed: {
    deviceOptions() {
      return [
        { label: 'All Devices', value: null },
        ...this.devices.map((device) => ({ label: device.name, value: device.id })),
      ]
    },
  },
  methods: {
    formatDate(d) {
      try {
        return new Date(d).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
      } catch (err) {
        return d
      }
    },
    getWaterColor(level) {
      if (level > 75) return 'blue'
      if (level > 50) return 'cyan'
      if (level > 25) return 'yellow'
      return 'red'
    },
    async fetchDevices() {
      try {
        const userData = localStorage.getItem('user')
        if (!userData) return
        const userId = JSON.parse(userData).id
        const res = await axios.get(`${this.API_BASE}/water-tanks?user_id=${userId}`)
        this.devices = res.data
      } catch (err) {
        console.error('Error fetching devices:', err)
      }
    },
    async loadHistory() {
      this.loading = true
      this.error = null
      try {
        let url = `${this.API_BASE}/history/device-history` // ✅ updated path
        const params = new URLSearchParams()
        if (this.selectedDevice) params.append('device_id', this.selectedDevice)
        if (this.dateRange.from) params.append('from', this.dateRange.from)
        if (this.dateRange.to) params.append('to', this.dateRange.to)
        if (params.toString()) url += `?${params.toString()}`

        const token = localStorage.getItem('token')
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })

        this.history = res.data
          .map((r) => {
            const device = this.devices.find((d) => d.id === r.device_id)
            return {
              id: r.id,
              created_at: r.created_at,
              water_level: Number(r.water_level ?? 0),
              relay: Number(r.relay ?? 0),
              device_name: device ? device.name : `Device ${r.device_id}`,
            }
          })
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      } catch (err) {
        console.warn('API fetch failed', err)
        this.error = 'Failed to load history data'
      } finally {
        this.loading = false
      }
    },
    async loadLoginHistory() {
      this.loadingLogin = true
      try {
        const userData = localStorage.getItem('user')
        if (!userData) return
        const userId = JSON.parse(userData).id
        const res = await axios.get(`${this.API_BASE}/history/login-events?user_id=${userId}`) // ✅ updated path
        this.loginHistory = res.data.map((event) => ({
          ...event,
          status: event.status || 'success',
        }))
      } catch (err) {
        console.error('Error fetching login history:', err)
      } finally {
        this.loadingLogin = false
      }
    },
    setupMQTT() {
      const options = {
        username: '/vh_jojolvin:jojo_alvin',
        password: '77665544',
        clientId: 'history-page-' + Math.random().toString(16).slice(2),
        protocolId: 'MQTT',
        reconnectPeriod: 1000,
      }
      this.client = mqttjs.connect('ws://195.35.23.135:15675/ws', options)
      this.client.on('connect', () => {
        console.log('Connected to MQTT')
        this.client.subscribe('RK.ULTRASONIC')
        this.client.subscribe('RK.ULTRASONIC2')
      })
      this.client.on('message', (topic, message) => {
        let deviceId = topic === 'RK.ULTRASONIC2' ? 2 : 1
        const val = parseInt(message.toString())
        if (!isNaN(val)) {
          const device = this.devices.find((d) => d.id === deviceId)
          this.history.unshift({
            id: this.history.length + 1,
            created_at: new Date().toISOString(),
            water_level: val,
            relay: val >= 50 ? 1 : 0,
            device_name: device ? device.name : `Device ${deviceId}`,
          })
          if (this.history.length > 100) this.history.pop()
        }
      })
    },
  },
  mounted() {
    this.fetchDevices().then(() => {
      this.loadHistory()
      this.loadLoginHistory()
    })
    this.setupMQTT()
  },
  beforeUnmount() {
    if (this.client) this.client.end(true)
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

.history-card {
  border-radius: 18px;
  padding: 16px;
}
.bg-primary {
  background: #0d47a1 !important;
}
.q-tab--active {
  background-color: rgba(255, 255, 255, 0.1);
}
.text-white-7 {
  color: rgba(255, 255, 255, 0.7);
}
</style>
