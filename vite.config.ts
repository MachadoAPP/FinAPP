import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

// Ruta base: el sitio vive en https://machadoapp.github.io/FinAPP/
const BASE = '/FinAPP/';

// Agrega al index.html lo necesario para instalar la app en el celular:
// manifest, icono para iPhone, color de la barra y registro del service worker.
const pwa = (): Plugin => ({
  name: 'finapp-pwa',
  transformIndexHtml() {
    return [
      {tag: 'link', attrs: {rel: 'manifest', href: `${BASE}manifest.webmanifest`}, injectTo: 'head'},
      {tag: 'link', attrs: {rel: 'apple-touch-icon', href: `${BASE}icon-192.png`}, injectTo: 'head'},
      {tag: 'meta', attrs: {name: 'theme-color', content: '#0f172a'}, injectTo: 'head'},
      {tag: 'meta', attrs: {name: 'mobile-web-app-capable', content: 'yes'}, injectTo: 'head'},
      {tag: 'meta', attrs: {name: 'apple-mobile-web-app-capable', content: 'yes'}, injectTo: 'head'},
      {
        tag: 'script',
        children:
          "if('serviceWorker' in navigator){window.addEventListener('load',function(){" +
          `navigator.serviceWorker.register('${BASE}sw.js',{scope:'${BASE}'});` +
          '});}',
        injectTo: 'body',
      },
    ];
  },
});

export default defineConfig(() => {
  return {
    base: BASE,
    plugins: [react(), tailwindcss(), pwa()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify: file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
