/*
 * grunt-ps-html2js
 *
 * Copyright (c) 2017 Peter Selvaraj
 * Licensed under the MIT license.
 */

'use strict';

const log = require('grunt-ps-log');
const testData = require('./data/test-data.value');
const assert = require('./services/assert.service');

module.exports = function (grunt) {
  grunt.registerMultiTask('psHtml2jsTest', 'Testing grunt-ps-html2js plugin', async function () {
    const done = this.async();
    const keys = Object.keys(testData);

    const promises = keys.map(async (inpPath) => {
      const testName = testData[inpPath].name;
      const expPath = inpPath.replace(/test\/expected/, 'tmp');

      try {
        if (await assert.contentEquality(inpPath, expPath)) {
          log.ok(`Test ${testName} passed!`);
        }
        else {
          log.error(`Contents of ${inpPath} & ${expPath} are not the same!`);
          log.fail(`Test ${testName} failed!`);
        }
      }
      catch(err) {
        log.error(`Error comparing ${inpPath} and ${expPath}: ${err.message}`);
      }
    });

    await Promise.all(promises);

    done();
  });
};
