const { join } = require('path');
const { defineConfig } = require('vite');
const reactJsx = require('vite-react-jsx').default;

// vite.config.js
module.exports = defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  plugins: [reactJsx()],
  server: {
    middlewareMode: 'html',
    hmr: true,
  },
  logLevel: 'warn',
  root: join(__dirname, 'assets'),
  publicDir: 'assets',
  base: '/admin/',
  build: {
    outDir: join(__dirname, '../../../storage/views/admin'),
    emptyOutDir: true,
  },
});
