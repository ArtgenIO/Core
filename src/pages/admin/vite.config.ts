import react from '@vitejs/plugin-react';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { InlineConfig } from 'vite';
import postcss from '../../../postcss.config';
import { ROOT_DIR } from '../../paths';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default {
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
    postcss,
  },
  plugins: [
    react({
      fastRefresh: false,
      // Exclude storybook stories
      exclude: /\.stories\.(t|j)sx?$/,
      // Only .tsx files
      include: '**/*.tsx',
    }),
  ],
  server: {
    middlewareMode: true,
    hmr: true,
  },
  logLevel: 'info',
  root: __dirname,
  publicDir: 'public',
  base: '/admin/',

  build: {
    outDir: join(ROOT_DIR, 'storage/pages/admin'),
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
} as InlineConfig;
