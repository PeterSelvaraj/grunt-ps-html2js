/*
 * grunt-ps-html2js
 *
 * Copyright (c) 2017 Peter Selvaraj
 * Licensed under the MIT license.
 */

'use strict';

var fileSvc = require('grunt-ps-file'),
  utilSvc = require('../services/ps-util.js'),
  templateFactory = require('./ps-template.js');

function Html2JS() {
  var s = this;
  s.init();
}

var p = Html2JS.prototype;

p.init = function () {
  var s = this;
  s.file = {};
  s.options = {};
  return s;
};

p.checkModuleSettings = function () {
  var s = this,
    targetModule = s.getTargetModule();

  if (!targetModule && s.options.singleModule) {
    throw new Error('When using singleModule: true be sure to specify a (target) module');
  }

  if (s.options.existingModule && !s.options.singleModule) {
    throw new Error('When using existingModule: true be sure to set singleModule: true');
  }
};

p.createFile = function () {
  var s = this,
    fileContent = s.getFileContent(),
    normalized = utilSvc.normalizelf(fileContent);

  fileSvc.write(s.file.dest, normalized);
};

p.genModules = function () {
  var s = this;
  s.modules = s.templates.map(function (template) {
    return template.getCompiled();
  });
};

p.getAmdPrefix = function () {
  var str = '',
    s = this;

  if (s.options.amd) {
    str = s.options.amdPrefixString;
  }

  return str;
};

p.getAmdSuffix = function () {
  var str = '',
    s = this;

  if (s.options.amd) {
    str = s.options.amdSuffixString;
  }

  return str;
};

p.getBundle = function () {
  var bundle,
    s = this,
    targetModule = s.getTargetModule();

  if (s.options.singleModule) {
    if (s.options.target === 'js') {
      bundle = s.getSingleBundle();
    }
    else if (s.options.target === 'coffee') {
      bundle = s.getSingleCoffeeBundle();
    }
  }
  else if (targetModule) {
    bundle = s.getTargetModuleBundle();
  }

  return bundle;
};

p.getFileContent = function () {
  var s = this,
    amdPrefix = s.getAmdPrefix(),
    amdSuffix = s.getAmdSuffix(),
    bundle = s.getBundle(),
    fileFooter = s.getFileFooter(),
    fileHeader = s.getFileHeader(),
    modulesCombined = s.getModulesCombined();

  s.checkModuleSettings();

  return fileHeader + amdPrefix + bundle + modulesCombined + amdSuffix + fileFooter;
};

p.getFileFooter = function () {
  var s = this,
    fileFooter = '';

  if (s.options.fileFooterString !== '') {
    fileFooter = s.options.fileFooterString + '\n';
  }

  return fileFooter;
};

p.getFileHeader = function () {
  var s = this,
    fileHeader = '';

  if (s.options.fileHeaderString !== '') {
    fileHeader = s.options.fileHeaderString + '\n';
  }

  return fileHeader;
};

p.getModuleCount = function () {
  var s = this;
  return s.modules.length;
};

p.getModuleNames = function () {
  var s = this;
  return s.templates.map(function (template) {
    return template.getModuleName(true);
  });
};

p.getModuleSuffix = function () {
  var s = this;
  return s.options.existingModule ? '' : ', []';
};

p.getModules = function () {
  var s = this;
  return s.modules;
};

p.getModulesCombined = function () {
  var s = this,
    modules = s.getModules().join('\n');

  if (s.options.singleModule) {
    if (s.options.target === 'js') {
      modules = modules.concat('\n}]);\n');
    }
    else if (s.options.target === 'coffee') {
      modules = modules.concat('\n])\n');
    }
  }

  return modules;
};

p.getSingleBundle = function () {
  var s = this,
    quoteChar = s.options.quoteChar;

  return 'angular.module(' + quoteChar + s.getTargetModule() + quoteChar + s.getModuleSuffix() + ')' +
    '.run([' + quoteChar + '$templateCache' + quoteChar + ', function($templateCache) {\n' +
    s.getStrictStr();
};

p.getSingleCoffeeBundle = function () {
  var s = this,
    quoteChar = s.options.quoteChar;

  return 'angular.module(' + quoteChar + s.getTargetModule() + quoteChar + s.getModuleSuffix() + ')' +
    '.run([' + quoteChar + '$templateCache' + quoteChar + ', ($templateCache) ->\n';
};

p.getStrictStr = function () {
  var str = '',
    s = this,
    quo = s.options.quoteChar,
    ind = s.options.indentString;

  if (s.options.useStrict) {
    str = ind + quo + 'use strict' + quo + ';\n';
  }

  return str;
};

p.getTargetModule = function () {
  var s = this,
    tgtMod = s.file.module || s.options.module;

  if (utilSvc.isFunc(tgtMod)) {
    tgtMod = tgtMod(s.file, s.target);
  }

  return tgtMod;
};

p.getTargetModuleBundle = function () {
  var bundle,
    s = this,
    quoteChar = s.options.quoteChar,
    moduleNames = s.getModuleNames(),
    targetModule = s.getTargetModule();

  bundle = 'angular.module(' + quoteChar + targetModule + quoteChar + ', [' + moduleNames.join(', ') + '])';

  if (s.options.target === 'js') {
    bundle = bundle.concat(';');
  }

  return bundle.concat('\n\n');
};

p.hasNoModules = function () {
  var s = this;
  return s.modules.length === 0;
};

p.hasNotChanged = function () {
  var s = this,
    hasChanged = false;

  s.templates.forEach(function (template) {
    hasChanged = hasChanged || template.hasChanged();
  });

  return !hasChanged;
};

p.setData = function (data) {
  var s = this;
  s.file = data.file;
  s.target = data.target;
  s.options = data.options;

  s.templates = data.file.src.map(function (filePath) {
    var template = templateFactory({
      filePath: filePath,
      options: data.options
    });

    return template.build();
  });

  s.genModules();

  return s;
};

module.exports = function (data) {
  return (new Html2JS()).setData(data);
};
