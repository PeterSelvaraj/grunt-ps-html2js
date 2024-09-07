/*
 * grunt-ps-html2js
 *
 * Copyright (c) 2017 Peter Selvaraj
 * Licensed under the MIT license.
 */

'use strict';

const pug = require('pug');
const path = require('path');
const fsp = require('fs').promises;
const log = require('grunt-ps-log');
const utilSvc = require('./util.service.js');
const { minify } = require('html-minifier-terser');

class NgTemplateCompilerService {
  #filePath;
  #options;

  constructor(opts) {
    this.#filePath = '';
    this.#options = opts;
  }

  get #indStr() {
    return this.#options.indentStr;
  }

  get #quoChr() {
    return this.#options.quoteChar;
  }

  async #coffeeCompile(moduleName) {
    const s = this;
    const content = await s.#getContent();
    const doubleIndent = s.#indStr + s.#indStr;
    const withModule = !s.#options.singleModule;

    let compiled = '';

    if (withModule) {
      compiled = compiled.concat('angular.module(' + s.#quoChr + moduleName +
        s.#quoChr + ', []).run([' + s.#quoChr + '$templateCache' + s.#quoChr + ', ($templateCache) ->\n');
    }

    compiled = compiled.concat(s.#indStr + '$templateCache.put(' + s.#quoChr + moduleName + s.#quoChr +
      ',\n' + doubleIndent + s.#quoChr + content + s.#quoChr + ')');

    if (withModule) {
      compiled = compiled.concat('\n])\n');
    }

    return compiled;
  }

  async compileTemplate(filePath) {
    const s = this;
    s.#filePath = filePath;
    const { target } = s.#options;

    let template;
    const moduleName = s.#getModuleName();

    if (target === 'js') {
      template = await s.#defaultCompile(moduleName);
    }
    else if (target === 'coffee') {
      template = await s.#coffeeCompile(moduleName);
    }
    else {
      log.fail(target + ' is not a valid compile target');
    }

    return {
      template,
      moduleName
    };
  }

  async #defaultCompile(moduleName) {
    const s = this;

    const { useStrict, singleModule } = s.#options;

    const content = await s.#getContent();
    const doubleIndent = s.#indStr + s.#indStr;
    const strict = useStrict ? s.#indStr + s.#quoChr + 'use strict' + s.#quoChr + ';\n' : '';

    let compiled = '';

    if (!singleModule) {
      compiled = compiled.concat(
        'angular.module(',
        s.#quoChr,
        moduleName,
        s.#quoChr,
        ', []).run([',
        s.#quoChr,
        '$templateCache',
        s.#quoChr,
        ', function($templateCache) {\n',
        strict);
    }

    compiled = compiled.concat(
      s.#indStr,
      '$templateCache.put(',
      s.#quoChr,
      moduleName,
      s.#quoChr,
      ',\n',
      doubleIndent,
      s.#quoChr,
      content,
      s.#quoChr,
      ');');

    if (!singleModule) {
      compiled = compiled.concat('\n}]);\n');
    }

    return compiled;
  }

  #escapeContent(content) {
    const s = this;
    const bsRegexp = new RegExp('\\\\', 'g');
    const quoteRegexp = new RegExp('\\' + s.#quoChr, 'g');
    const pathToAddAsComment = s.#options.templatePathInComment ? s.#filePath : '';
    const nlReplace = '\\n' + s.#quoChr + ' +\n' + s.#indStr + s.#indStr + s.#quoChr;

    content = (pathToAddAsComment ? '<!-- template: ' + pathToAddAsComment + ' -->\n' : '') + content;

    return content
      .replace(bsRegexp, '\\\\')
      .replace(quoteRegexp, '\\' + s.#quoChr)
      .replace(/\r*\n/g, nlReplace);
  }

  async #getContent() {
    const s = this;
    let content = await s.#readFile(this.#filePath);

    if (s.#isPugTemplate()) {
      content = s.#renderPug(content);
    }

    content = s.#processContent(content);

    content = await s.#minifyContent(content);

    content = content.replace(/(^\s*)/g, '');

    return s.#escapeContent(content);
  }

  #getModuleName(withQuotes) {
    const s = this;
    const quoteChar = withQuotes ? s.#quoChr : '';
    const name = path.relative(s.#options.base, s.#filePath);

    let moduleName = utilSvc.normalizePath(name);

    if (utilSvc.isFunc(s.#options.rename)) {
      moduleName = s.#options.rename(moduleName);
    }

    return quoteChar + moduleName + quoteChar;
  }

  #isPugTemplate() {
    const s = this;
    const pugExtension = /\.pug$/;
    return pugExtension.test(s.#filePath);
  }

  async #minifyContent(content) {
    const s = this;

    if (Object.keys(s.#options.htmlmin).length) {
      try {
        content = await minify(content, s.#options.htmlmin);
      }
      catch (err) {
        log.warn(s.#filePath + '\n' + err);
      }
    }

    return content;
  }

  #processContent(content) {
    const s = this;
    let process = s.#options.process;

    if (utilSvc.isFunc(process)) {
      content = process(content, s.#filePath);
    }
    else if (process) {
      if (process === true) { process = {}; }
      content = utilSvc.processTemplate(content, process);
    }

    return content;
  }

  async #readFile(filePath) {
    const buff = await fsp.readFile(filePath);
    return buff.toString();
  }

  #renderPug(content) {
    var s = this;
    s.#options.pug.filename = s.#filePath;
    return pug.render(content, s.#options.pug);
  }
}

module.exports = opts => new NgTemplateCompilerService(opts);
