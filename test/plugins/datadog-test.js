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
    plugin = require('../../plugins/datadog')({
        disabled: false,
        execute_if_regexp : 'datadog',
        name: 'datadog',
        batch_size: 1
    }, {
        dd: {
            add_metrics: function (series, callback) {
                callback();
            }
        }
    });

buster.testCase('plugins/datadog.js', {
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
            var message = {
                "datadog": true,
                "prefix": "datadog.test",
                "foo": "This is my message",
                "timers" : {
                    total: 1234
                }
            };
            plugin.execute(JSON.stringify(JSON.stringify(message)), {}, function () {
                plugin.execute(JSON.stringify(JSON.stringify(message)), {}, function () {
                    assert(true);
                    done();
                });
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
