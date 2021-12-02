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
  coverageReporters: ['lcov', 'text'],
  collectCoverageFrom: ['./src/**/*.ts', '!./src/**/index.ts'],
  coverageThreshold: {
    global: {
      statements: 10,
      functions: 10,
      lines: 10,
      branches: 10,
    },
  },

  globalSetup: './tests/global.setup.js',
};

module.exports = config;
