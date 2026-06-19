import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",

      // Pre-cachea todos los assets generados por Vite (JS, CSS, fuentes)
      includeAssets: ["pwa-icon.svg", "icons.svg"],

      manifest: {
        name: "Lumin — Gestión de Joyería",
        short_name: "Lumin",
        description: "Administra tu inventario, catálogo y ventas de joyería.",
        theme_color: "#7B4CFF",
        background_color: "#0D0D18",
        display: "standalone",
        orientation: "portrait",
        start_url: "/dashboard",
        scope: "/",
        lang: "es-MX",
        icons: [
          {
            src: "/pwa-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/pwa-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        // Archivos que el service worker pre-cachea al instalarse
        globPatterns: ["**/*.{js,css,html,svg,woff2}"],

        runtimeCaching: [
          // API: NetworkFirst — siempre intenta la red; si falla, sirve la caché
          {
            urlPattern: ({ url }) =>
              url.hostname.includes("qlatte.com") && url.pathname.startsWith("/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "lumin-api-cache",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24, // 24 horas
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Imágenes de R2/CDN: CacheFirst — sirve desde caché, actualiza en background
          {
            urlPattern: ({ url }) =>
              url.hostname.includes("r2.cloudflarestorage.com") ||
              url.hostname.includes("pub-") ||
              /\.(png|jpg|jpeg|webp|avif)$/.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "lumin-images-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Google Fonts: CacheFirst con expiración larga
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "lumin-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
