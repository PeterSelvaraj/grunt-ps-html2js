/*
 * grunt-ps-html2js
 *
 * Copyright (c) 2017 Peter Selvaraj
 * Licensed under the MIT license.
 */

'use strict';

var grunt = require('grunt'),
    pathSvc = require('path'),
    normalizeNewline = require('normalize-newline');

module.exports = {
    fail: function (msg) {
        grunt.fail.fatal(msg);
    },

    isFunc: function (data) {
        return this.typeOf(data) === 'function';
    },

    normalizelf: function (data) {
        return normalizeNewline(data);
    },

    normalizePath: function (p) {
        if (pathSvc.sep !== '/') {
            p = p.replace(/\\/g, '/');
        }

        return p;
    },

    processTemplate: function (tmp) {
        return grunt.template.process(tmp);
    },

    typeOf: function (data) {
        return grunt.util.kindOf(data);
    }
};
