/*
 * grunt-ps-html2js
 *
 * Copyright (c) 2017 Peter Selvaraj
 * Licensed under the MIT license.
 */

'use strict';

module.exports = inp => {
  return {
    amd: false,
    amdPrefixString: 'define([\'angular\'], function(angular){',
    amdSuffixString: '});',
    base: 'src',
    existingModule: false,
    fileFooterString: '',
    fileHeaderString: '',
    htmlmin: {},
    indentStr: '  ',
    module: 'templates-' + inp.target,
    process: false,
    pug: { pretty: true },
    quoteChar: '"',
    singleModule: false,
    target: 'js',
    templatePathInComment: false,
    useStrict: false,
    watch: false
  };
};
