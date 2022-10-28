export default {
  video: false,
  watchForFileChanges: false,
  experimentalSourceRewriting: false,
  screenshotOnRunFailure: false,
  viewportWidth: 1600,
  viewportHeight: 900,
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  fixturesFolder: false,
  e2e: {
    setupNodeEvents(on, config) {
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config;
    },
    baseUrl: 'http://localhost:7200',
    // supportFile: true,
  },
};
