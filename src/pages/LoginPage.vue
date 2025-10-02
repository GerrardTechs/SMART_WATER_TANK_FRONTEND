<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="q-pa-lg shadow-10" style="width: 400px; max-width: 90vw">
      <!-- Judul -->
      <div class="text-subtitle2 text-center text-primary q-mb-xs">Welcome to</div>
      <div class="text-title text-h5 text-weight-bold text-center text-primary q-mb-xs">
        Aqua Secure
      </div>
      <div class="text-subtitle text-center text-grey text-weight-normal q-mb-lg">
        Silakan login untuk melanjutkan
      </div>

      <!-- Form Login -->
      <q-form @submit.prevent="handleLogin" class="q-gutter-md">
        <q-input filled v-model="username" label="Username" dense clearable />
        <q-input filled v-model="password" type="password" label="Password" dense clearable />
        <q-btn label="Login" type="submit" color="primary" class="full-width" />
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import axios from 'axios'

const username = ref('')
const password = ref('')
const $q = useQuasar()
const router = useRouter()

const handleLogin = async () => {
  if (!username.value || !password.value) {
    $q.notify({ type: 'negative', message: 'Username dan password wajib diisi' })
    return
  }

  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      username: username.value,
      password: password.value,
    })

    if (res.status === 200) {
      localStorage.setItem('user', JSON.stringify(res.data.user))
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('isLoggedIn', 'true')

      $q.notify({
        type: 'positive',
        message: `Login berhasil, selamat datang ${res.data.user.username}!`,
      })

      router.push('/home')
    }
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || 'Login gagal',
    })
  }
}
</script>
