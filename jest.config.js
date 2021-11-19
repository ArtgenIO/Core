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
  coverageReporters: ['lcov', 'text', 'html'],
  collectCoverageFrom: ['./src/**/*.ts', '!./src/**/index.ts'],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: -1000,
    },
  },
};

module.exports = config;
