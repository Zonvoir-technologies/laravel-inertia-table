import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src']
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ZonvoirTableVue',
      fileName: (format) =>
        format === 'es' ? 'zonvoir-table.js' : 'zonvoir-table.cjs',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['vue', '@inertiajs/vue3'],
      output: {
        globals: {
          vue: 'Vue',
          '@inertiajs/vue3': 'InertiaVue'
        }
      }
    }
  }
});
