/*
 * grunt-ps-html2js
 *
 * Copyright (c) 2017 Peter Selvaraj
 * Licensed under the MIT license.
 */

'use strict';

const log = require('grunt-ps-log');
const chokidar = require('chokidar');
const timerSvc = require('./services/timer.service.js');
const html2JsSvc = require('./services/html2js.service.js');
const defaultOptions = require('./values/default-options.value.js');

module.exports = function (grunt) {
  grunt.registerMultiTask('psHtml2js', 'Compiles Angular-JS templates to JavaScript.', async function () {
    const timer = timerSvc();
    const done = this.async();
    const watcher = chokidar.watch();
    const options = this.options(defaultOptions(this));

    const html2Js = html2JsSvc(options);

    const compileFiles = () => {
      return this.files.map(async (file) => {
        html2Js.file = file;

        if (await html2Js.hasChanged()) {
          await html2Js.saveFile();
        }
      });
    };

    if (options.watch) {
      watcher.on('change', compileFiles);
    }

    await Promise.all(compileFiles());

    log.ok(`${this.target} completed in ${timer.getTimeElapsed()}`);

    done();
  });
};
