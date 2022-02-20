const istanbul = require('rollup-plugin-istanbul');
const { join } = require('path');
const { defineConfig } = require('vite');
const reactJsx = require('vite-react-jsx').default;

const plugins = [reactJsx()];

if (process.env.CYPRESS_COVERAGE) {
  plugins.push(
    istanbul({
      include: ['src/**/*.tsx'],
      extension: ['.tsx'],
    }),
  );
}

// vite.config.js
module.exports = defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  plugins,
  server: {
    middlewareMode: 'html',
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
});
