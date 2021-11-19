const { join } = require('path');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? undefined : 'jit',
  purge: {
    enabled: true,
    content: [join(__dirname, './src/**/*.{tsx,html}')],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require('tailwindcss-scrollbar')],
};
