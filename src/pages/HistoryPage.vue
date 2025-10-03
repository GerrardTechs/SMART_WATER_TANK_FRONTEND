<template>
  <q-page class="q-pa-md bg-animated">
    <!-- Header -->
    <q-card class="q-pa-md no-shadow q-mb-md header-card" bordered>
      <div class="row items-center">
        <div class="col">
          <p class="text-h5 text-weight-bold text-primary">History</p>
          <p class="text-subtitle text-grey-7">Sensor & Relay History</p>
        </div>

        <!-- Filter tanggal (From / To) -->
        <div class="col-auto">
          <q-input dense outlined v-model="fromDate" label="From (YYYY-MM-DD)">
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-date v-model="fromDate" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="col-auto">
          <q-input dense outlined v-model="toDate" label="To (YYYY-MM-DD)">
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-date v-model="toDate" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="col-auto">
          <q-btn dense flat label="Apply" color="primary" @click="onApplyFilter" />
          <q-btn dense flat label="Reset" color="primary" @click="resetFilter" />
        </div>
      </div>
    </q-card>

    <!-- Loading -->
    <div v-if="loading" class="text-center q-py-lg">
      <q-spinner color="white" size="3em" />
      <p class="text-white q-mt-sm">Loading history...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center q-py-lg">
      <q-icon name="error" color="negative" size="3em" />
      <p class="text-negative q-mt-sm">{{ error }}</p>
      <q-btn color="white" text-color="primary" label="Retry" @click="fetchHistory" />
    </div>

    <!-- History Table -->
    <div v-else>
      <q-table
        :rows="paginatedRows"
        :columns="columns"
        row-key="timestamp"
        flat
        dense
        class="q-mt-md bg-white"
      >
        <template v-slot:body-cell-water_level="props">
          <q-td :props="props"> {{ props.row.water_level }}% </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="props.row.status === 1 ? 'green' : 'red'">
              {{ props.row.status === 1 ? 'ON' : 'OFF' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-timestamp="props">
          <q-td :props="props">
            {{ formatDate(props.row.timestamp) }}
          </q-td>
        </template>
      </q-table>

      <div v-if="displayedTotal === 0" class="text-center text-white q-mt-md">
        No history found for this device / filters.
      </div>

      <!-- Pagination -->
      <div class="row justify-center q-mt-md">
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          color="primary"
          max-pages="7"
          boundary-numbers
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

export default {
  name: 'HistoryPage',
  setup() {
    const route = useRoute()
    const tankId = ref(route.params.tankId || 1)

    const allTransitions = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fromDate = ref(null)
    const toDate = ref(null)
    const currentPage = ref(1)
    const rowsPerPage = 10

    const columns = [
      { name: 'name', label: 'Tank', field: 'name', align: 'left' },
      { name: 'water_level', label: 'Water Level', field: 'water_level', align: 'center' },
      { name: 'status', label: 'Relay', field: 'status', align: 'center' },
      { name: 'timestamp', label: 'Last Update', field: 'timestamp', align: 'right' },
    ]

    const formatDate = (date) => {
      if (!date) return '-'
      return new Date(date).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    }

    const storageKey = (id) => `history_cache_${id}`

    const loadCache = () => {
      try {
        const raw = sessionStorage.getItem(storageKey(tankId.value))
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) allTransitions.value = parsed
        }
      } catch (e) {}
    }

    const saveCache = () => {
      try {
        sessionStorage.setItem(storageKey(tankId.value), JSON.stringify(allTransitions.value))
      } catch (e) {}
    }

    const filteredRows = computed(() => {
      if (!fromDate.value && !toDate.value) return allTransitions.value
      const from = fromDate.value ? new Date(fromDate.value) : null
      const to = toDate.value ? new Date(toDate.value) : null
      return allTransitions.value.filter((row) => {
        if (!row.timestamp) return false
        const d = new Date(row.timestamp)
        if (from && d < startOfDay(from)) return false
        if (to && d > endOfDay(to)) return false
        return true
      })
    })

    const totalPages = computed(() =>
      Math.max(1, Math.ceil(filteredRows.value.length / rowsPerPage)),
    )

    const paginatedRows = computed(() => {
      const start = (currentPage.value - 1) * rowsPerPage
      return filteredRows.value.slice(start, start + rowsPerPage)
    })

    const displayedTotal = computed(() => filteredRows.value.length)

    function startOfDay(dt) {
      const d = new Date(dt)
      d.setHours(0, 0, 0, 0)
      return d
    }
    function endOfDay(dt) {
      const d = new Date(dt)
      d.setHours(23, 59, 59, 999)
      return d
    }

    function computeTransitions(items) {
      if (!Array.isArray(items)) return []
      const copy = items.slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      const transitions = []
      let lastStatus = null
      for (const r of copy) {
        let status = null
        if (typeof r.status !== 'undefined' && r.status !== null) status = Number(r.status)
        else if (typeof r.water_level !== 'undefined' && r.water_level !== null)
          status = Number(r.water_level) >= 75 ? 0 : 1
        else continue
        if (lastStatus === null) {
          transitions.push({ ...r, status })
          lastStatus = status
        } else if (status !== lastStatus) {
          transitions.push({ ...r, status })
          lastStatus = status
        }
      }
      return transitions.reverse()
    }

    function mergeTransitions(newList) {
      if (!Array.isArray(newList)) return
      const merged = [...newList, ...allTransitions.value]
      const map = new Map()
      for (const row of merged) {
        const key = `${row.timestamp}::${row.status ?? ''}`
        if (!map.has(key)) map.set(key, row)
      }
      allTransitions.value = Array.from(map.values())
      saveCache()
    }

    const fetchHistory = async () => {
      loading.value = true
      error.value = null
      try {
        const user = JSON.parse(localStorage.getItem('user'))
        const token = localStorage.getItem('token')
        if (!user || !token) throw new Error('User not logged in')
        const params = { user_id: user.id, device_id: tankId.value, limit: 500, offset: 0 }
        if (fromDate.value) params.from = fromDate.value
        if (toDate.value) params.to = toDate.value
        const response = await axios.get('http://localhost:5000/api/history/device-history', {
          params,
          headers: { Authorization: `Bearer ${token}` },
        })
        let items = []
        if (Array.isArray(response.data)) items = response.data
        else if (response.data && Array.isArray(response.data.data)) items = response.data.data
        const transitions = computeTransitions(items)
        if (allTransitions.value.length === 0) {
          allTransitions.value = transitions
          saveCache()
        } else {
          mergeTransitions(transitions)
        }
        if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
      } catch (err) {
        console.error('❌ Error fetching history data:', err)
        error.value = 'Failed to load history data.'
      } finally {
        loading.value = false
      }
    }

    const onApplyFilter = () => {
      currentPage.value = 1
      fetchHistory()
    }

    const resetFilter = () => {
      fromDate.value = null
      toDate.value = null
      currentPage.value = 1
      fetchHistory()
    }

    let intervalId = null
    onMounted(() => {
      loadCache()
      fetchHistory()
      intervalId = setInterval(fetchHistory, 2000)
    })
    onBeforeUnmount(() => {
      if (intervalId) clearInterval(intervalId)
    })

    watch(tankId, (nv, ov) => {
      currentPage.value = 1
      loadCache()
      fetchHistory()
    })

    return {
      tankId,
      columns,
      allTransitions,
      historyRows: allTransitions,
      loading,
      error,
      fromDate,
      toDate,
      onApplyFilter,
      resetFilter,
      formatDate,
      currentPage,
      totalPages,
      paginatedRows,
      displayedTotal,
      fetchHistory,
    }
  },
}
</script>

<style scoped>
.header-card {
  border-radius: 20px;
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
</style>
