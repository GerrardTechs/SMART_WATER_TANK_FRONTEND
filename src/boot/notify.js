import { boot } from 'quasar/wrappers'
import { Notify } from 'quasar'

const notif = (message, jenis) => {
  return Notify.create({
    message: message,
    color: jenis,
    timeout: 2000,
    actions: [{ icon: 'close', color: 'white' }],
  })
}

export default boot(({ app }) => {
  // pastikan $q ada
  app.config.globalProperties.$q = app.config.globalProperties.$q || {}

  // inject $q.notify biar bisa dipanggil di komponen
  app.config.globalProperties.$q.notify = Notify.create

  // tambahan shortcut notifikasi
  app.config.globalProperties.$successNotif = (msg) => {
    notif(msg, 'positive')
  }
  app.config.globalProperties.$commonErrorNotif = () => {
    notif('Terjadi Kesalahan Mohon Periksa Koneksi Internet Anda', 'negative')
  }
  app.config.globalProperties.$errorNotif = (msg) => {
    notif(msg, 'negative')
  }

  // simpan app di window biar bisa diakses langsung
  window.app = app
})

export { notif }
