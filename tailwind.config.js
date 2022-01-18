const { merge } = require('lodash');
const { join } = require('path');
const colors = require('tailwindcss/colors');

const customColors = merge(colors, {
  midnight: {
    50: '#fefefe',
    100: '#cfd2d9',
    200: '#b5b9c2',
    300: '#79808c',
    400: '#5d616c',
    500: '#474952',
    600: '#37393f',
    700: '#25272b',
    750: '#202327',
    800: '#15171b',
    900: '#0a0d10',
  },
  primary: {
    50: '#b2faff',
    100: '#5df0fb',
    200: '#52ebf6',
    300: '#4fe1ec',
    400: '#4bd5df',
    500: '#46bdc6',
    600: '#30868c',
    700: '#1d5256',
    800: '#102d30',
    900: '#091819',
  },
});

delete customColors['lightBlue'];
delete customColors['warmGray'];
delete customColors['trueGray'];
delete customColors['coolGray'];
delete customColors['blueGray'];

/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig} */
const config = {
  mode: 'jit',
  content: [join(__dirname, './src/**/*.{tsx,html}')],
  theme: {
    fontFamily: {
      header: ['Bebas Neue', 'cursive'],
      code: ['Courier New', 'Courier', 'monospace'],
      cursive: ['Gruppo', 'cursive'],
    },
    colors: customColors,
  },
  plugins: [require('tailwindcss-scrollbar')],
};

module.exports = config;
