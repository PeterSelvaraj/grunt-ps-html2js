/*
 * grunt-ps-html2js
 *
 * Copyright (c) 2017 Peter Selvaraj
 * Licensed under the MIT license.
 */

'use strict';

const fs = require('fs');
const fsp = fs.promises;
const { dirname } = require('path');
const log = require('grunt-ps-log');
const normalizeNewline = require('normalize-newline');
const fileStatusSvc = require('./file-status.service');
const compilerSvc = require('./template-compiler.service');

class Html2JsService {
  #compiler;
  #fileStatus;
  #opts = {};

  file;
  target;

  constructor(opts) {
    this.#opts = opts;
    this.#compiler = compilerSvc(opts);
    this.#fileStatus = fileStatusSvc('/.grunt-cache/build-time.txt');
  }

  get #amdPref() {
    const o = this.#opts;
    return o.amd ? o.amdPrefixString : '';
  }

  get #amdSuff() {
    const o = this.#opts;
    return o.amd ? o.amdSuffixString : '';
  }

  get #fileFooter() {
    const o = this.#opts;
    return o.fileFooterString ? o.fileFooterString + '\n' : '';
  }

  get #fileHeader() {
    const o = this.#opts;
    return o.fileHeaderString ? o.fileHeaderString + '\n' : '';
  }

  get #quoChar() {
    return this.#opts.quoteChar;
  }

  get #moduleSuff() {
    return this.#opts.existingModule ? '' : ', []';
  }

  get #strictStr() {
    const { indentStr, quoteChar: qc, useStrict } = this.#opts;
    return useStrict ? indentStr + qc + 'use strict' + qc + ';\n' : '';
  }

  get #target() {
    return this.#opts.target;
  }

  #checkModuleSettings() {
    const s = this;
    const targetModule = s.#getTargetModule();
    const { existingModule, singleModule } = s.#opts;

    if (!targetModule && singleModule) {
      throw new Error('When using singleModule: true be sure to specify a (target) module');
    }

    if (existingModule && !singleModule) {
      throw new Error('When using existingModule: true be sure to set singleModule: true');
    }
  }

  async #dirExists(dir) {
    try {
      const stats = await fsp.stat(dir);
      return stats.isDirectory();
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      } else {
        throw error;
      }
    }
  }

  #getBundle(moduleNames) {
    const s = this;
    let bundle = '';
    const targetModule = s.#getTargetModule();

    if (s.#opts.singleModule) {
      bundle = s.#getSingleModuleBundle();
    }
    else if (targetModule) {
      bundle = s.#getTargetModuleBundle(moduleNames);
    }

    return bundle;
  }

  async #getFileContent() {
    const s = this;
    const compiled = [];
    const moduleNames = [];

    for (const file of s.file.src) {
      const out = await s.#compiler.compileTemplate(file);
      compiled.push(out.template);
      moduleNames.push(out.moduleName);
    }

    const bundle = s.#getBundle(moduleNames);
    const modulesCombined = s.#getModulesCombined(compiled);

    s.#checkModuleSettings();

    return s.#fileHeader + s.#amdPref + bundle + modulesCombined + s.#amdSuff + s.#fileFooter;
  }

  #getModulesCombined(compiled) {
    const s = this;
    let modules = compiled.join('\n');

    if (s.#opts.singleModule) {
      if (s.#target === 'js') {
        modules = modules.concat('\n}]);\n');
      }
      else if (s.#target === 'coffee') {
        modules = modules.concat('\n])\n');
      }
    }

    return modules;
  }

  #getModuleString() {
    const s = this;
    return 'angular.module(' + s.#quoChar + s.#getTargetModule() + s.#quoChar;
  }

  #getSingleModuleBundle() {
    const s = this;
    const js = s.#opts.target === 'js';
    const pt1 = s.#moduleSuff + ')' + '.run([' + s.#quoChar + '$templateCache' + s.#quoChar;
    const pt2 = js ? (', function($templateCache) {\n' + s.#strictStr) : ', ($templateCache) ->\n';

    return s.#getModuleString() + pt1 + pt2;
  }

  #getTargetModule() {
    const s = this;
    let tgtMod = s.file.module || s.#opts.module;

    if (typeof tgtMod === 'function') {
      tgtMod = tgtMod(s.file, s.#target);
    }

    return tgtMod;
  }

  #getTargetModuleBundle(moduleNames) {
    const s = this;
    const js = s.#target === 'js' ? ';' : '';
    const names = moduleNames.map(m => `${s.#quoChar}${m}${s.#quoChar}`);
    return s.#getModuleString() + ', [' + names.join(', ') + '])' + js + '\n\n';
  }

  async hasChanged() {
    let changed = false;

    for (const file of this.file.src) {
      changed = changed || await this.#fileStatus.fileHasChanged(file);
    }

    return changed;
  }

  async saveFile() {
    const s = this;
    const destDir = dirname(s.file.dest);
    const fileContent = await s.#getFileContent();
    const normalized = normalizeNewline(fileContent);

    try {
      if (!await s.#dirExists(destDir)) {
        await fsp.mkdir(destDir, { recursive: true });
      }

      return await fsp.writeFile(s.file.dest, normalized);
    } catch (err) {
      log.fail(`Error saving file ${s.file.dest} ` + err.message);
    }
  }
}

module.exports = opts => new Html2JsService(opts);
