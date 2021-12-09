const { merge } = require('lodash');
const { join } = require('path');
const colors = require('tailwindcss/colors');

module.exports = {
  mode: 'jit',
  purge: {
    enabled: true,
    content: [join(__dirname, './src/**/*.{tsx,html}')],
  },
  darkMode: false, // or 'media' or 'class'
  // theme: {
  //   colors: merge(colors, {
  //     gray: {
  //       800: '#151719',
  //       900: '#111213',
  //     },
  //   }),
  // },
  // variants: {
  //   extend: {},
  // },
  plugins: [require('tailwindcss-scrollbar')],
};
