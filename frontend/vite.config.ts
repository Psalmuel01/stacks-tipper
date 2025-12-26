import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

/**
 * Vite configuration for the Tipper frontend
 *
 * - React + TypeScript support via @vitejs/plugin-react
 * - Path alias: `@` -> `src`
 * - Dev server on port 5173 (default Vite port)
 * - PostCSS/Tailwind will be picked up automatically when configured
 */
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5173,
      open: true,
      strictPort: false,
    },
    build: {
      sourcemap: isDev,
      outDir: 'dist',
    },
    css: {
      // Let PostCSS/Tailwind handle processing; leave options default
      devSourcemap: isDev,
    },
    define: {
      // Expose a flag to the app if needed
      __APP_ENV__: JSON.stringify(mode),
    },
  };
});
