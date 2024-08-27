/*
 * grunt-ps-html2js
 *
 * Copyright (c) 2017 Peter Selvaraj
 * Licensed under the MIT license.
 */

'use strict';

var chokidar = require('chokidar'),
  logSvc = require('grunt-ps-log'),
  cacheFactory = require('grunt-ps-cache'),
  html2JsFactory = require('./factories/ps-html2js.js'),
  fileCacheFactory = require('./factories/ps-file-cache.js');

module.exports = function (grunt) {
  var cacheSvc = cacheFactory.getNew({
    file: './.grunt-cache/ps-html2js.cache'
  });

  fileCacheFactory.setCacheSvc(cacheSvc);

  grunt.registerMultiTask('psHtml2js', 'Compiles Angular-JS templates to JavaScript.', function () {
    cacheSvc.loadCacheData();

    var options = this.options({
      base: 'src',
      module: 'templates-' + this.target,
      quoteChar: '"',
      fileHeaderString: '',
      fileFooterString: '',
      indentString: '  ',
      target: 'js',
      htmlmin: {},
      process: false,
      pug: {
        pretty: true
      },
      singleModule: false,
      existingModule: false,
      watch: false,
      amd: false,
      amdPrefixString: 'define([\'angular\'], function(angular){',
      amdSuffixString: '});',
      templatePathInComment: false
    });

    var counter = 0,
      target = this.target,
      startTime = Date.now(),
      watcher = chokidar.watch();

    function generateModule(file) {
      if (options.watch) {
        watcher.add(file.src);
      }

      var html2js = html2JsFactory({
        file: file,
        target: target,
        options: options
      });

      if (html2js.hasNoModules() || html2js.hasNotChanged()) {
        return;
      }

      counter += html2js.getModuleCount();

      html2js.createFile();
    }

    if (options.watch) {
      var files = this.files;

      watcher.on('change', function () {
        files.forEach(generateModule);
      });
    }

    this.files.forEach(generateModule);

    cacheSvc.saveCacheData();

    var elapsed = (Date.now() - startTime) / 1000;

    if (counter > 0) {
      logSvc.ok('Compiled ' + counter + ' html templates in ' + elapsed + 's.');
    }
    else {
      logSvc.ok('Time elapsed: ' + elapsed + 's. No updates detected.');
    }
  });
};
