/*
 * https://github.com/schibsted
 *
 * Copyright (c) 2014 Schibsted Payment
 * Licensed under the MIT license.
 */
'use strict';

var buster = require('buster'),
    assert = buster.assert,
    refute = buster.refute,
    when   = require('when'),
    _      = require('underscore'),
    plugin = require('../../plugins/dumper')({
        disabled: false,
        execute_if_regexp : '.',
        name: 'dumper'
    });

buster.testCase('plugins/dumper.js', {
    setUp: function () {
    },

    tearDown: function () {
    },

    'Date module:': {
        'init': function () {
            assert.isFunction(plugin.regexp);
            assert.isFunction(plugin.init);
            assert.isFunction(plugin.execute);
            assert.isFunction(plugin.end);
            assert.isString(plugin.name);
        },

        'execute': function (done) {
            plugin.execute(JSON.stringify('{"foo": "This is my message"}'), {}, function () {
                assert(true);
                done();
            });
        },

        'regexp': function () {
            if (_.isFunction(plugin.regexp)) {
                assert(_.isRegExp(plugin.regexp()));
                assert(true);
            }
        },

        'end': function () {
            if (_.isFunction(plugin.end)) {
                plugin.end();
                assert(true);
            }
        }
    }
});
