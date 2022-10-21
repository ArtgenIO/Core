import react from '@vitejs/plugin-react';
import { join } from 'path';
import istanbul from 'rollup-plugin-istanbul';
import { fileURLToPath } from 'url';
import { UserConfigExport } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const plugins = [react()];

if (process.env.CYPRESS_COVERAGE) {
  plugins.push(
    istanbul({
      include: ['src/**/*.tsx'],
      extension: ['.tsx'],
    }),
  );
}

export default {
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  plugins,
  server: {
    middlewareMode: true,
    hmr: true,
  },
  logLevel: 'info',
  root: join(__dirname, 'assets'),
  publicDir: 'assets',
  base: '/admin/',
  build: {
    outDir: join(__dirname, '../../../storage/views/admin'),
    emptyOutDir: true,
  },
} as UserConfigExport;
