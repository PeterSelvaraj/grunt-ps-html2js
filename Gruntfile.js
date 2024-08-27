/*
 * grunt-ps-html2js
 *
 * Copyright (c) 2017 Peter Selvaraj
 * Licensed under the MIT license.
 */

'use strict';

const fs = require('fs');
const glob = require('fast-glob');
const { log } = require('console');
const fileSvc = require('grunt-ps-file');
const cacheFactory = require('grunt-ps-cache');

cacheFactory.disableCaching();

module.exports = function (grunt) {
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/**/*.js'
            ],

            options: {
                jshintrc: '.jshintrc'
            }
        },

        clean: {
            tests: ['tmp', '.grunt-cache']
        },

        psHtml2js: {
            amd_module: {
                options: {
                    amd: true,
                    quoteChar: '\''
                },
                src: ['test/fixtures/one.tpl.html', 'test/fixtures/two.tpl.html'],
                dest: 'tmp/amd_module.js'
            },
            amd_module_custom_prefix: {
                options: {
                    amd: true,
                    amdPrefixString: 'define([\'ng\'], function(angular){'
                },
                src: ['test/fixtures/one.tpl.html', 'test/fixtures/two.tpl.html'],
                dest: 'tmp/amd_module_custom_prefix.js'
            },
            amd_module_custom_suffix: {
                options: {
                    amd: true,
                    amdSuffixString: '}); //Custom!'
                },
                src: ['test/fixtures/one.tpl.html', 'test/fixtures/two.tpl.html'],
                dest: 'tmp/amd_module_custom_suffix.js'
            },
            broken_newlines: {
                src: ['test/fixtures/broken_newlines.tpl.html'],
                dest: 'tmp/broken_newlines.js'
            },
            coffee: {
                options: {
                    target: 'coffee'
                },
                src: ['test/fixtures/one.tpl.html', 'test/fixtures/two.tpl.html'],
                dest: 'tmp/coffee.coffee'
            },
            compact_format_custom_options: {
                options: {
                    base: 'test',
                    module: 'my-custom-template-module'
                },
                src: ['test/fixtures/one.tpl.html', 'test/fixtures/two.tpl.html'],
                dest: 'tmp/compact_format_custom_options.js'
            },
            compact_format_default_options: {
                src: ['test/fixtures/one.tpl.html', 'test/fixtures/two.tpl.html'],
                dest: 'tmp/compact_format_default_options.js'
            },
            custom_attribute_collapsed: {
                src: ['test/fixtures/custom_attribute_collapse.tpl.html'],
                dest: 'tmp/custom_attribute_collapsed.js',
                options: {
                    htmlmin: {
                        customAttrCollapse: /my-[a-z]*/
                    }
                }
            },
            custom_attribute_not_collapsed: {
                src: ['test/fixtures/custom_attribute_collapse.tpl.html'],
                dest: 'tmp/custom_attribute_not_collapsed.js'
            },
            double_quotes: {
                src: ['test/fixtures/four.tpl.html'],
                dest: 'tmp/double_quotes.js'
            },
            empty_attribute: {
                src: ['test/fixtures/empty_attribute.tpl.html'],
                dest: 'tmp/empty_attribute.js'
            },
            empty_module: {
                src: [],
                dest: 'tmp/empty_module.js'
            },
            existing_module: {
                options: {
                    singleModule: true,
                    existingModule: true
                },
                src: ['test/fixtures/one.tpl.html', 'test/fixtures/three.tpl.html'],
                dest: 'tmp/existing_module.js'
            },
            file_footer: {
                options: {
                    fileFooterString: '/* Module End */\n'
                },
                src: ['test/fixtures/three.tpl.html'],
                dest: 'tmp/file_footer.js'
            },
            file_header: {
                options: {
                    fileHeaderString: '/* Module Start */\n'
                },
                src: ['test/fixtures/three.tpl.html'],
                dest: 'tmp/file_header.js'
            },
            file_header_footer: {
                options: {
                    fileHeaderString: '/* Module Start */\n',
                    fileFooterString: '/* Module End */\n'
                },
                src: ['test/fixtures/three.tpl.html'],
                dest: 'tmp/file_header_footer.js'
            },
            files_array_custom_options: {
                options: {
                    base: 'test',
                    module: 'my-custom-template-module'
                },
                files: [
                    {
                        dest: 'tmp/files_array_custom_options_1.js',
                        src: ['test/fixtures/one.tpl.html'],
                        module: 'my-custom-templates'
                    },
                    {
                        dest: 'tmp/files_array_custom_options_2.js',
                        src: ['test/fixtures/two.tpl.html'],
                        module: 'my-custom-templates'
                    }
                ]
            },
            files_array_default_options: {
                files: [
                    {
                        dest: 'tmp/files_array_default_options_1.js',
                        src: ['test/fixtures/one.tpl.html']
                    },
                    {
                        dest: 'tmp/files_array_default_options_2.js',
                        src: ['test/fixtures/two.tpl.html']
                    }
                ]
            },
            files_object_custom_options: {
                options: {
                    base: 'test',
                    module: 'my-custom-template-module'
                },
                files: {
                    'tmp/files_object_custom_options_1.js': ['test/fixtures/one.tpl.html'],
                    'tmp/files_object_custom_options_2.js': ['test/fixtures/two.tpl.html']
                }
            },
            files_object_default_options: {
                files: {
                    'tmp/files_object_default_options_1.js': ['test/fixtures/one.tpl.html'],
                    'tmp/files_object_default_options_2.js': ['test/fixtures/two.tpl.html']
                }
            },
            htmlmin: {
                options: {
                    htmlmin: {
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        removeAttributeQuotes: true,
                        removeComments: true,
                        removeEmptyAttributes: true,
                        removeRedundantAttributes: true,
                        removeScriptTypeAttributes: true,
                        removeStyleLinkTypeAttributes: true
                    }
                },
                src: ['test/fixtures/five.tpl.html'],
                dest: 'tmp/htmlmin.js'
            },
            issue_26_withCollapseWhitespaceFalseDefaultQuotes: {
                options: {
                    htmlmin: {
                        collapseWhitespace: false
                    }
                },
                src: ['test/fixtures/issue_26.tpl.html'],
                dest: 'tmp/issue_26_withCollapseWhitespaceFalseDefaultQuotes.js'
            },
            issue_26_withCollapseWhitespaceFalseDoubleQuotes: {
                options: {
                    htmlmin: {
                        collapseWhitespace: false
                    },
                    quoteChar: '"'
                },
                src: ['test/fixtures/issue_26.tpl.html'],
                dest: 'tmp/issue_26_withCollapseWhitespaceFalseDoubleQuotes.js'
            },
            issue_26_withCollapseWhitespaceFalseSingleQuotes: {
                options: {
                    htmlmin: {
                        collapseWhitespace: false
                    },
                    quoteChar: '\''
                },
                src: ['test/fixtures/issue_26.tpl.html'],
                dest: 'tmp/issue_26_withCollapseWhitespaceFalseSingleQuotes.js'
            },
            issue_26_withCollapseWhitespaceTrueDefaultQuotes: {
                options: {
                    htmlmin: {
                        collapseWhitespace: false
                    }
                },
                src: ['test/fixtures/issue_26.tpl.html'],
                dest: 'tmp/issue_26_withCollapseWhitespaceTrueDefaultQuotes.js'
            },
            issue_26_withCollapseWhitespaceTrueDoubleQuotes: {
                options: {
                    htmlmin: {
                        collapseWhitespace: false
                    },
                    quoteChar: '"'
                },
                src: ['test/fixtures/issue_26.tpl.html'],
                dest: 'tmp/issue_26_withCollapseWhitespaceTrueDoubleQuotes.js'
            },
            issue_26_withCollapseWhitespaceTrueSingleQuotes: {
                options: {
                    htmlmin: {
                        collapseWhitespace: false
                    },
                    quoteChar: '\''
                },
                src: ['test/fixtures/issue_26.tpl.html'],
                dest: 'tmp/issue_26_withCollapseWhitespaceTrueSingleQuotes.js'
            },
            issue_26_withoutCollapseWhitespaceDefaultQuotes: {
                src: ['test/fixtures/issue_26.tpl.html'],
                dest: 'tmp/issue_26_withoutCollapseWhitespaceDefaultQuotes.js'
            },
            issue_26_withoutCollapseWhitespaceDoubleQuotes: {
                options: {
                    quoteChar: '"'
                },
                src: ['test/fixtures/issue_26.tpl.html'],
                dest: 'tmp/issue_26_withoutCollapseWhitespaceDoubleQuotes.js'
            },
            issue_26_withoutCollapseWhitespaceSingleQuotes: {
                options: {
                    quoteChar: '\''
                },
                src: ['test/fixtures/issue_26.tpl.html'],
                dest: 'tmp/issue_26_withoutCollapseWhitespaceSingleQuotes.js'
            },
            module_as_function: {
                options: {
                    module: function (file) {
                        return 'NAME_FROM_FUNCTION';
                    }
                },
                src: ['test/fixtures/one.tpl.html', 'test/fixtures/two.tpl.html'],
                dest: 'tmp/module_as_function.js'
            },
            multi_lines: {
                src: ['test/fixtures/three.tpl.html'],
                dest: 'tmp/multi_lines.js'
            },
            multi_lines_4space: {
                options: {
                    indentString: '    '
                },
                src: ['test/fixtures/three.tpl.html'],
                dest: 'tmp/multi_lines_4spaces.js'
            },
            multi_lines_tabs: {
                options: {
                    indentString: '\t'
                },
                src: ['test/fixtures/three.tpl.html'],
                dest: 'tmp/multi_lines_tabs.js'
            },
            process_all_pug: {
                options: {
                    pug: {},
                    watch: true
                },
                src: [
                    'test/fixtures/process_pug.pug',
                    'test/fixtures/process_pug_custom.pug',
                    'test/fixtures/process_pug_with_include.pug',
                    'test/fixtures/pug_include.pug'
                ],
                dest: 'tmp/process_all_pug.js'
            },
            process_function: {
                options: {
                    process: function (html, filePath) {
                        html = html.replace('(ONE)', '1');
                        html = html.replace('(TWO)', '2');
                        html = html.replace('(THREE)', '3');
                        return html;
                    }
                },
                src: ['test/fixtures/process_function.tpl.html'],
                dest: 'tmp/process_function.js'
            },
            process_pug: {
                src: ['test/fixtures/process_pug.pug'],
                dest: 'tmp/process_pug.js'
            },
            process_pug_custom: {
                options: {
                    pug: {
                        doctype: 'html'
                    }
                },
                src: ['test/fixtures/process_pug_custom.pug'],
                dest: 'tmp/process_pug_custom.js'
            },
            process_pug_with_include: {
                options: {
                    pug: {}
                },
                src: ['test/fixtures/process_pug_with_include.pug'],
                dest: 'tmp/process_pug_with_include.js'
            },
            process_template: {
                testMessages: {
                    title: 'Main Title',
                    subtitle: 'Subtitle with {{ interpolation }}'
                },
                options: {
                    process: true
                },
                src: ['test/fixtures/process_template.tpl.html'],
                dest: 'tmp/process_template.js'
            },
            regex_in_template: {
                src: ['test/fixtures/pattern.tpl.html'],
                dest: 'tmp/regex_in_template.js'
            },
            rename: {
                options: {
                    rename: function (moduleName) {
                        return moduleName.replace('.html', '');
                    }
                },
                src: ['test/fixtures/one.tpl.html', 'test/fixtures/two.tpl.html'],
                dest: 'tmp/rename.js'
            },
            single_module: {
                options: {
                    singleModule: true
                },
                src: ['test/fixtures/one.tpl.html', 'test/fixtures/three.tpl.html'],
                dest: 'tmp/single_module.js'
            },
            single_module_strict: {
                options: {
                    singleModule: true,
                    useStrict: true
                },
                src: ['test/fixtures/one.tpl.html', 'test/fixtures/three.tpl.html'],
                dest: 'tmp/single_module_strict.js'
            },
            single_module_coffee: {
                options: {
                    singleModule: true,
                    target: 'coffee'
                },
                src: ['test/fixtures/one.tpl.html', 'test/fixtures/three.tpl.html'],
                dest: 'tmp/single_module.coffee'
            },
            single_quotes: {
                options: {
                    quoteChar: '\''
                },
                src: ['test/fixtures/four.tpl.html'],
                dest: 'tmp/single_quotes.js'
            },
            strict_mode: {
                options: {
                    useStrict: true
                },
                src: ['test/fixtures/one.tpl.html'],
                dest: 'tmp/strict_mode.js'
            },
            template_path_in_comment: {
                options: {
                    templatePathInComment: true
                },
                src: ['test/fixtures/three.tpl.html'],
                dest: 'tmp/template_path_in_comment.js'
            }
        }
    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('psHtml2jsTest', () => {
        let success = true;
        let files = glob.sync('test/expected/**/*.js');

        files.forEach(file => {
            const outFile = file.replace('test/expected', 'tmp');
            const expData = fileSvc.read(file).trim();
            const outData = fileSvc.read(outFile).trim();

            if (expData !== outData) {
                success = false;
                log(`Output file ${outFile} is invalid!`);
            }
        });

        if (success) {
            log('All tests passed successfully!');
        }
    });

    // Whenever the "dev" task is run, first lint, then run this
    // plugin's task(s).
    grunt.registerTask('dev', ['jshint', 'psHtml2js']);

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'psHtml2js', 'psHtml2jsTest']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['psHtml2js']);
};
