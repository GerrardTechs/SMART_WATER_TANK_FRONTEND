/* eslint-env node */

export default function (/* ctx */) {
  return {
    supportTS: false,

    css: ['app.scss'],

    boot: ['favicon', 'axios'],

    build: {
      vueRouterMode: 'hash', // bisa juga "history"
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13'],
        node: 'node18',
      },
    },

    devServer: {
      https: false,
      port: 8080,
      open: true,
      historyApiFallback: true,
    },

    framework: {
      config: {},
      plugins: ['Notify', 'Dialog', 'Loading'],
    },

    extras: [
      'roboto-font',
      'material-icons', // supaya icon person & lock jalan
      // kalau mau pakai font awesome juga bisa: 'fontawesome-v6'
    ],

    animations: 'all', // aktifkan semua animasi bawaan Quasar

    ssr: {
      pwa: false,
    },

    pwa: {
      workboxPluginMode: 'GenerateSW',
      workboxOptions: {},
      manifest: {
        name: `Aqua Secure`,
        short_name: `AquaSecure`,
        description: `Monitoring system Aqua Secure`,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    },

    capacitor: {
      hideSplashscreen: true,
    },

    electron: {
      bundler: 'packager',
      packager: {},
      builder: {
        appId: 'aquasecure',
      },
    },
  }
}
