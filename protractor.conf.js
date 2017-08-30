exports.config = {
  baseUrl: 'http://localhost:3333/',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: [
    'tests/e2e/init.e2e.js'
  ],
  directConnect: true,
  useAllAngular2AppRoots: true,
  allScriptsTimeout: 60000,
  onPrepare: function() {
    browser.ignoreSynchronization = true;
  }
}
