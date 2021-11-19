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
      statements: 70,
      functions: 70,
      lines: 70,
      branches: 45,
    },
  },
};

module.exports = config;
