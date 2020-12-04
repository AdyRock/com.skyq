'use strict';
if (process.env.DEBUG === '1') {
	require('inspector').open(9222, '0.0.0.0', true)
}

const Homey = require('homey');

class MyApp extends Homey.App {
  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('MyApp has been initialized');
  }
}

module.exports = MyApp;