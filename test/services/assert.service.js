/*
 * grunt-ps-html2js
 *
 * Copyright (c) 2017 Peter Selvaraj
 * Licensed under the MIT license.
 */

'use strict';

const fsp = require('fs').promises;
const log = require('grunt-ps-log');

class Assert {
  static async contentEquality(file1, file2) {
    if (!await Assert.fileExists(file1)) {
      log.fail(`File ${file1} does not exist!`);
    }
    else if (!await Assert.fileExists(file2)) {
      log.fail(`File ${file2} does not exist!`);
    }

    const c1 = await Assert.#getFileContent(file1);
    const c2 = await Assert.#getFileContent(file2);

    return c1 === c2;
  }

  static async fileExists(filePath) {
    try {
      const stats = await fsp.stat(filePath);
      return stats.isFile();
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      } else {
        throw error;
      }
    }
  }

  static async #getFileContent(filePath) {
    const data = await fsp.readFile(filePath);
    return data.toString();
  }
}

module.exports = Assert;
