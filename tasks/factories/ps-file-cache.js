/*
 * grunt-ps-html2js
 *
 * Copyright (c) 2017 Peter Selvaraj
 * Licensed under the MIT license.
 */

'use strict';

var cacheSvc,
  testing = false,
  // logSvc = require('grunt-ps-log'),
  fileSvc = require('grunt-ps-file');

function FileCache() {
  var s = this;
  s.init();
}

var p = FileCache.prototype;

p.init = function () {
  var s = this;
  s.filePath = '';
  s.uncachedFile = true;
  return s;
};

p.hasChanged = function () {
  var s = this,
    hasChanged = s.uncachedFile;

  if (testing) {
    return true;
  }

  if (!s.uncachedFile) {
    hasChanged = fileSvc.getUpdateTime(s.filePath) > s.metaData.updateTime;

    if (hasChanged) {
      s.updateCache();
    }
  }

  return hasChanged;
};

p.setData = function (filePath) {
  var s = this;

  if (!filePath) {
    return s;
  }

  s.filePath = filePath;

  if (cacheSvc.fileDataExists(s.filePath)) {
    s.uncachedFile = false;
    s.metaData = cacheSvc.getFileData(s.filePath);
  }
  else {
    s.updateCache();
  }

  return s;
};

p.updateCache = function () {
  var s = this;

  s.metaData = {
    updateTime: fileSvc.getUpdateTime(s.filePath)
  };

  cacheSvc.putFileData(s.filePath, s.metaData);

  return s;
};

var expts = function () {
  return new FileCache();
};

expts.setCacheSvc = function (svc) {
  cacheSvc = svc;
};

expts.setTesting = function (bool) {
  testing = bool;
};

module.exports = expts;
