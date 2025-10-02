import { ref, onUnmounted } from 'vue'
import mqtt from 'mqtt'

export function useMQTT(topic) {
  const client = ref(null)
  const message = ref(null)
  const isConnected = ref(false)

  const connectMQTT = () => {
    const options = {
      username: '/vh_jojoalvin:jojo_alvin',
      password: '77665544',
      clientId: 'web_client_' + Math.random().toString(16).substr(2, 8),
      protocolId: 'MQTT',
      keepAlive: 30,
      reconnectPeriod: 1000,
    }

    client.value = mqtt.connect('ws://195.35.23.135:15675/ws', options)

    client.value.on('connect', () => {
      isConnected.value = true
      client.value.subscribe(topic, (err) => {
        if (!err) console.log(`Subscribed to ${topic}`)
      })
    })

    client.value.on('message', (t, payload) => {
      if (t === topic) {
        message.value = parseFloat(payload.toString())
      }
    })

    client.value.on('error', (err) => console.error('MQTT Error:', err))
  }

  const disconnectMQTT = () => {
    if (client.value) client.value.end()
  }

  // auto disconnect saat component di-unmount
  onUnmounted(() => disconnectMQTT())

  return { client, message, isConnected, connectMQTT, disconnectMQTT }
}
