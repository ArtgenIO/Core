const { merge } = require('lodash');
const { join } = require('path');
const colors = require('tailwindcss/colors');

const customColors = merge(colors, {
  midnight: {
    50: '#E5E7EB',
    100: '#CBCFD7',
    200: '#989FAF',
    300: '#677084',
    400: '#3E4450',
    500: '#15171B',
    600: '#121417',
    700: '#0D0F11',
    750: '#0D0F11',
    800: '#090A0B',
    900: '#040506',
  },
  primary: {
    DEFAULT: '#46bdc6',
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
  info: {
    DEFAULT: '#4979EA',
    50: '#8791F1',
    100: '#808EF0',
    200: '#7287EF',
    300: '#6581ED',
    400: '#577DEB',
    500: '#4979EA',
    600: '#1A5FE1',
    700: '#1450AE',
    800: '#0F3E7C',
    900: '#09284A',
  },
  success: {
    50: '#c2fa6e',
    100: '#a9eb6e',
    200: '#91dd6e',
    300: '#7bce6d',
    400: '#66be6c',
    500: '#52af6a',
    600: '#40a067',
    700: '#2f9062',
    800: '#1f815d',
    900: '#107257',
  },
  error: {
    DEFAULT: '#D45F5F',
    50: '#E8B9A7',
    100: '#E6B09F',
    200: '#E19E8F',
    300: '#DD8A7F',
    400: '#D9756F',
    500: '#D45F5F',
    600: '#C6353D',
    700: '#9A2936',
    800: '#6E1D2C',
    900: '#41111D',
  },
  warning: {
    DEFAULT: '#EAAC49',
    50: '#F1DE87',
    100: '#F0D980',
    200: '#EFD072',
    300: '#EDC565',
    400: '#EBB957',
    500: '#EAAC49',
    600: '#E18C1A',
    700: '#AE6614',
    800: '#7C430F',
    900: '#4A2509',
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
