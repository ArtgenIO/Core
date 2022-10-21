export default {
  video: false,
  watchForFileChanges: false,
  experimentalSourceRewriting: false,
  screenshotOnRunFailure: false,
  viewportWidth: 1600,
  viewportHeight: 900,
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  env: {
    codeCoverage: {
      url: 'http://localhost:7200/__coverage__',
    },
  },
  fixturesFolder: false,
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: 'http://localhost:7200',
    supportFile: false,
  },
};
