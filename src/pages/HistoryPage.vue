<template>
  <q-page class="q-pa-md bg-grey-2">
    <q-card class="q-pa-md">
      <div class="text-h6 text-primary">History Data</div>
      <div class="text-caption text-grey">Sensor & relay history</div>

      <!-- Dropdown Tank -->
      <q-select
        v-model="selectedTank"
        :options="tankOptions"
        label="Select Water Tank"
        outlined
        dense
        class="q-mt-md"
      ></q-select>

      <!-- History Table -->
      <q-table :rows="rows" :columns="columns" row-key="id" flat dense hide-bottom class="q-mt-md">
        <template v-slot:body-cell-water_level="props">
          <q-td :props="props">
            <q-badge :color="getWaterLevelColor(props.row.water_level)" align="middle">
              {{ props.row.water_level }}%
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-relay_status="props">
          <q-td :props="props">
            <q-badge :color="props.row.relay_status === 1 ? 'green' : 'red'" align="middle">
              {{ props.row.relay_status === 1 ? 'ON' : 'OFF' }}
            </q-badge>
          </q-td>
        </template>
      </q-table>

      <div class="text-negative text-caption q-mt-sm">*Data is recorded everyday</div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'

// Tank selection
const tankOptions = [
  { label: 'Water Tank 1', value: 1 },
  { label: 'Water Tank 2', value: 2 },
]
const selectedTank = ref(1)

// Table data
const rows = ref([])
const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'created_at', label: 'Time', field: 'created_at', align: 'left' },
  { name: 'water_level', label: 'Water Level (%)', field: 'water_level', align: 'center' },
  { name: 'relay_status', label: 'Relay', field: 'relay_status', align: 'center' },
]

let intervalId = null

// Fetch history data per tank
const fetchData = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/api/history?tank=${selectedTank.value}`)
    rows.value = res.data
  } catch (err) {
    console.error('❌ Error fetching history data:', err.message)
  }
}

// Watch for tank change
watch(selectedTank, () => {
  fetchData()
})

// Auto refresh setiap 10 detik
onMounted(() => {
  fetchData()
  intervalId = setInterval(fetchData, 10000)
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
})

// Water level badge color
const getWaterLevelColor = (level) => {
  if (level > 75) return 'blue'
  if (level >= 30) return 'orange'
  return 'red'
}
</script>
