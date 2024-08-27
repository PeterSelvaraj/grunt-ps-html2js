/*
 * grunt-ps-html2js
 *
 * Copyright (c) 2017 Peter Selvaraj
 * Licensed under the MIT license.
 */

'use strict';

var pug = require('pug'),
  pathSvc = require('path'),
  nano = require('htmlnano'),
  logSvc = require('grunt-ps-log'),
  fileSvc = require('grunt-ps-file'),
  minify = require('html-minifier').minify,
  utilSvc = require('../services/ps-util.js'),
  fileCacheFactory = require('./ps-file-cache.js');

function Template() {
  var s = this;
  s.init();
}

var p = Template.prototype;

p.init = function () {
  var s = this;
  s.options = {};
  s.filePath = '';
  s.compiled = '';
  s.moduleName = '';
  s.fileCache = fileCacheFactory();
  return s;
};

p.build = function () {
  var s = this;
  s.genModuleName().compile();
  return s;
};

p.coffeeCompile = function () {
  var s = this,
    compiled = '',
    content = s.getContent(),
    qChar = s.options.quoteChar,
    withModule = !s.options.singleModule,
    indentStr = s.options.indentString,
    doubleIndent = indentStr + indentStr;

  if (withModule) {
    compiled = compiled.concat('angular.module(' + qChar + s.moduleName +
      qChar + ', []).run([' + qChar + '$templateCache' + qChar + ', ($templateCache) ->\n');
  }

  compiled = compiled.concat(indentStr + '$templateCache.put(' + qChar + s.moduleName + qChar +
    ',\n' + doubleIndent + qChar + content + qChar + ')');

  if (withModule) {
    compiled = compiled.concat('\n])\n');
  }

  return compiled;
};

p.compile = function () {
  var s = this;

  if (s.options.target === 'js') {
    s.compiled = s.defaultCompile();
  }
  else if (s.options.target === 'coffee') {
    s.compiled = s.coffeeCompile();
  }
  else {
    utilSvc.fail(s.options.target + ' is not a valid compile target');
  }

  return s;
};

p.defaultCompile = function () {
  var s = this,
    compiled = '',
    content = s.getContent(),
    quoteChar = s.options.quoteChar,
    indentStr = s.options.indentString,
    withModule = !s.options.singleModule,
    doubleIndent = indentStr + indentStr,
    strict = (s.options.useStrict) ? indentStr + quoteChar + 'use strict' + quoteChar + ';\n' : '';

  if (withModule) {
    compiled = compiled.concat('angular.module(' + quoteChar + s.moduleName +
      quoteChar + ', []).run([' + quoteChar + '$templateCache' + quoteChar + ', function($templateCache) {\n' + strict);
  }

  compiled = compiled.concat(indentStr + '$templateCache.put(' + quoteChar + s.moduleName + quoteChar +
    ',\n' + doubleIndent + quoteChar + content + quoteChar + ');');

  if (withModule) {
    compiled = compiled.concat('\n}]);\n');
  }

  return compiled;
};

p.escapeContent = function (content) {
  var s = this,
    quoteChar = s.options.quoteChar,
    bsRegexp = new RegExp('\\\\', 'g'),
    indentString = s.options.indentString,
    quoteRegexp = new RegExp('\\' + quoteChar, 'g'),
    pathToAddAsComment = s.options.templatePathInComment ? s.filePath : '',
    nlReplace = '\\n' + quoteChar + ' +\n' + indentString + indentString + quoteChar;

  content = (pathToAddAsComment ? '<!-- template: ' + pathToAddAsComment + ' -->\n' : '') + content;

  return content
    .replace(bsRegexp, '\\\\')
    .replace(quoteRegexp, '\\' + quoteChar)
    .replace(/\r*\n/g, nlReplace);
};

p.genModuleName = function () {
  var s = this,
    name = pathSvc.relative(s.options.base, s.filePath),
    moduleName = utilSvc.normalizePath(name);

  if (utilSvc.isFunc(s.options.rename)) {
    moduleName = s.options.rename(moduleName);
  }

  s.moduleName = moduleName;

  return s;
};

p.getCompiled = function () {
  var s = this;
  return s.compiled;
};

p.getContent = function () {
  var s = this,
    content = fileSvc.read(s.filePath);

  if (s.isPugTemplate()) {
    content = s.renderPug(content);
  }

  content = s.processContent(content);

  content = s.minifyContent(content);

  content = content.replace(/(^\s*)/g, '');

  return s.escapeContent(content);
};

p.getModuleName = function (withQuotes) {
  var s = this,
    quoteChar = withQuotes ? s.options.quoteChar : '';
  return quoteChar + s.moduleName + quoteChar;
};

p.hasChanged = function () {
  var s = this;
  return s.fileCache.hasChanged();
};

p.isPugTemplate = function () {
  var s = this,
    pugExtension = /\.pug$/;

  return pugExtension.test(s.filePath);
};

p.minifyContent = function (content) {
  var s = this;

  if (Object.keys(s.options.htmlmin).length) {
    try {
      content = minify(content, s.options.htmlmin);
    }
    catch (err) {
      logSvc.warn(s.filePath + '\n' + err);
    }
  }

  return content;
};

p.processContent = function (content) {
  var s = this,
    process = s.options.process;

  if (utilSvc.isFunc(process)) {
    content = process(content, s.filePath);
  }
  else if (process) {
    if (process === true) {
      process = {};
    }
    content = utilSvc.processTemplate(content, process);
  }

  return content;
};

p.renderPug = function (content) {
  var s = this;
  s.options.pug.filename = s.filePath;
  console.log('pugOptions:', s.options.pug);
  return pug.render(content, s.options.pug);
};

p.setData = function (data) {
  var s = this;

  if (!data) {
    return s;
  }

  s.options = data.options;

  if (!fileSvc.exists(data.filePath)) {
    utilSvc.fail('File ' + data.filePath + ' does not exist');
  }

  s.filePath = data.filePath;
  s.fileCache.setData(s.filePath);

  return s;
};

module.exports = function (data) {
  return (new Template()).setData(data);
};
