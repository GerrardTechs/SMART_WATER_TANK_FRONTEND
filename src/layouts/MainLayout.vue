<template>
  <q-layout view="lHh Lpr lFf">
    <!-- HEADER -->
    <q-header elevated>
      <q-toolbar class="bg-primary q-pa-sm">
        <q-btn flat round dense icon="info" class="q-mr-sm" @click="isInfoDialogOpen = true" />
        <q-space />
        <q-avatar clickable @click="isLogoutDialogOpen = true" class="cursor-pointer">
          <img src="https://i.pinimg.com/736x/49/34/f7/4934f76b7c8d0f0c290707b29dbc322e.jpg" />
        </q-avatar>
      </q-toolbar>
    </q-header>

    <!-- PAGE CONTENT -->
    <q-page-container>
      <router-view />
      <!-- isi halaman (IndexPage / lainnya) -->
    </q-page-container>

    <!-- FOOTER NAVIGATION -->
    <q-footer elevated class="bg-primary text-white">
      <q-tabs v-model="tab" class="text-white" dense align="justify" indicator-color="white">
        <q-route-tab to="/home" name="home" icon="home" label="Home" />
        <q-route-tab to="/home/all-devices" name="devices" icon="devices" label="Devices" />
        <q-route-tab to="/home/history" name="history" icon="history" label="History" />
        <!-- Tab Detail dihapus untuk menghindari 404 -->
      </q-tabs>
    </q-footer>

    <!-- Logout dialog -->
    <q-dialog v-model="isLogoutDialogOpen" persistent>
      <q-card>
        <q-card-section class="text-center">
          <img
            src="https://i.pinimg.com/736x/49/34/f7/4934f76b7c8d0f0c290707b29dbc322e.jpg"
            alt="Avatar"
            style="width: 50px; height: 50px; border-radius: 50%"
          />
          <p class="q-mt-md">Are you sure you want to Logout?</p>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn label="Cancel" flat color="primary" v-close-popup />
          <q-btn label="Logout" flat color="red" @click="logout" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Info dialog -->
    <q-dialog v-model="isInfoDialogOpen" persistent>
      <q-card>
        <q-card-section class="text-center">
          <p class="text-h6">Aqua Secure App</p>
          <p>Version: 1.0.0</p>
          <p>This application monitors water levels in your tanks.</p>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn label="OK" flat color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
export default {
  data() {
    return {
      isLogoutDialogOpen: false,
      isInfoDialogOpen: false,
      tab: 'home',
    }
  },
  mounted() {
    this.setTabByRoute(this.$route.path)
  },
  watch: {
    '$route.path'(newPath) {
      this.setTabByRoute(newPath)
    },
  },
  methods: {
    logout() {
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      this.$router.push('/')
    },
    setTabByRoute(path) {
      if (path.startsWith('/home/all-devices')) this.tab = 'devices'
      else if (path.startsWith('/home/history')) this.tab = 'history'
      else this.tab = 'home'
    },
  },
}
</script>
