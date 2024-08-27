/*
 * grunt-ps-html2js
 *
 * Copyright (c) 2017 Peter Selvaraj
 * Licensed under the MIT license.
 */

'use strict';

var grunt = require('grunt'),
  cacheFactory = require('grunt-ps-cache');

module.exports = function () {
  grunt.registerMultiTask('psHtml2jsTest', 'PsHtml2js testing setup', function () {
    cacheFactory.disableCaching();
  });
};
