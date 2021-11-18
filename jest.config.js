/** @type {import("ts-jest/dist/types").InitialOptionsTsJest} */
const jestConfig = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['./tests', './src'],
  testMatch: ['**/*.(test|spec|e2e-test).ts'],

  silent: true,
  verbose: true,
  bail: true,

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: './coverage',
  coverageReporters: ['text'],
  collectCoverageFrom: ['./src/**/*.ts'],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: -1000,
    },
  },
};

module.exports = jestConfig;
