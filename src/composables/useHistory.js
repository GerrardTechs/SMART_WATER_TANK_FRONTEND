import { ref } from 'vue'
import axios from 'axios'

export function useHistory() {
  const history = ref([])
  const loading = ref(true)

  const fetchHistory = async (tankId) => {
    try {
      const res = await axios.get(`http://localhost:3000/water_tanks/${tankId}/history`)
      history.value = res.data
    } catch (err) {
      console.error('Error fetching history:', err)
    } finally {
      loading.value = false
    }
  }

  return { history, loading, fetchHistory }
}
