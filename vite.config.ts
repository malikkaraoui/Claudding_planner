import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { apiPlugin } from './server/apiPlugin';

export default defineConfig({
  plugins: [react(), tailwindcss(), apiPlugin()],
  server: {
    port: 5173,
    watch: {
      // data/trip.json est synchronisé par polling (pas besoin de full-reload) ;
      // .gstack/ et les .md sont écrits par l'outillage et pollueraient le watcher.
      ignored: ['**/data/**', '**/.gstack/**', '**/vault/**', '**/*.md'],
    },
  },
});
