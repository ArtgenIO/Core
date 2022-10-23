import react from '@vitejs/plugin-react';
import { join } from 'path';
import istanbul from 'rollup-plugin-istanbul';
import { fileURLToPath } from 'url';
import { UserConfigExport } from 'vite';
import postcss from '../../../postcss.config';

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
    postcss,
  },
  plugins,
  server: {
    middlewareMode: true,
    hmr: true,
  },
  logLevel: 'info',
  root: join(__dirname, 'view'),
  publicDir: 'public',
  base: '/admin/',

  build: {
    outDir: join(__dirname, '../../../storage/views/admin'),
    emptyOutDir: true,
    assetsDir: '_a',
    minify: true,
  },

  resolve: {
    alias: [
      {
        find: /antd\/lib\/(.+)(?<!less)$/,
        replacement: 'antd/es/$1', // Fix for  https://github.com/rjsf-team/react-jsonschema-form/issues/2962
      },
    ],
  },
} as UserConfigExport;
