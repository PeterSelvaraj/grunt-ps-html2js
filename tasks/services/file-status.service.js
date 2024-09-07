/*
 * grunt-ps-html2js
 *
 * Copyright (c) 2017 Peter Selvaraj
 * Licensed under the MIT license.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const log = require('grunt-ps-log');

class FileStatusService {
  #lastCompileTime;
  #compileTimeFilePath;

  constructor(compileTimeFilePath) {
    this.#compileTimeFilePath = compileTimeFilePath;
  }

  #checkFile(stats) {
    if (this.#lastCompileTime === null) {
      return true;
    } else {
      const fileModifiedTime = new Date(stats.mtime).getTime();
      return fileModifiedTime > this.#lastCompileTime;
    }
  }

  async fileHasChanged(filePath) {
    if (this.#lastCompileTime === undefined) {
      this.#lastCompileTime = await this.#getLastCompileTime(this.#compileTimeFilePath);
    }

    try {
      const stats = await fs.promises.stat(filePath);
      return this.#checkFile(stats);
    } catch (err) {
      log.error(`Failed to stat file: ${err}`);
      throw err;
    }
  }

  async #getLastCompileTime(compileTimeFilePath) {
    try {
      await fs.promises.access(compileTimeFilePath);
      const stat = await fs.promises.stat(compileTimeFilePath);
      return stat.mtimeMs;
    } catch (err) {
      if (err.code === 'ENOENT') {
        return null;
      } else {
        log.fail(`GetLastCompileTime: ${err}`);
        return null;
      }
    }
  }

  async saveCompileTime() {
    if (this.#compileTimeFilePath) {
      const dir = path.dirname(this.#compileTimeFilePath);
      if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }
      await fs.promises.writeFile(this.#compileTimeFilePath, Date.now().toString());
    }
    else {
      log.fail('FileCheckService: Compile time file path was not defined!');
    }
  }
}

module.exports = filePath => new FileStatusService(filePath);
