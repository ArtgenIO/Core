const esbuildPluginTsc = require('esbuild-plugin-tsc');

module.exports = {
  outDir: './build',
  tsConfigFile: 'tsconfig.prod.json',
  esbuild: {
    minify: false,
    target: 'node16',
    plugins: [
      esbuildPluginTsc({
        tsConfigFile: 'tsconfig.prod.json',
      }),
    ],
  },
};
