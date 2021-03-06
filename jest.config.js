/** @type {import("ts-jest/dist/types").InitialOptionsTsJest} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['./src'],
  testMatch: ['**/*.(test|spec|e2e-test).ts'],

  silent: true,
  verbose: true,
  bail: true,
  testTimeout: 5000,

  // Coverage configuration
  collectCoverage: true,
  coverageReporters: ['json', 'text'],
  coverageDirectory: './.nyc_output',
  collectCoverageFrom: [
    './src/**/*.ts',
    '!./src/**/index.ts',
    '!./src/modules/admin/**/*.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 1,
      functions: 1,
      lines: 1,
      branches: 1,
    },
  },

  globalSetup: './tests/global.setup.js',
};

module.exports = config;
