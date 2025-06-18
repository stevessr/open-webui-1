import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
  define: {
    'APP_VERSION': JSON.stringify('0.0.0'),
    'APP_BUILD_HASH': JSON.stringify('dev'),
  },
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, './src/lib'),
      '$app/environment': path.resolve(__dirname, './test/mocks/app-environment.ts'),
      '$app/stores': path.resolve(__dirname, './test/mocks/app-stores.ts'),
      '$app/navigation': path.resolve(__dirname, './test/mocks/app-navigation.ts'),
      '$i18n': path.resolve(__dirname, './test/mocks/i18n.ts'),
    },
  },
});