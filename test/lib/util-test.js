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
    util   = require('../../lib/util')({}, {});

buster.testCase('lib/logger', {
    setUp: function () {
    },
    tearDown: function () {
    },
    'Date module:': {
        'format_number': function () {
            var number = util.format_number(12345);
            assert.equals(number, '12,345.00');
        },
        'format_number w/4 decimals': function () {
            var number = util.format_number(12345, 4);
            assert.equals(number, '12,345.0000');
        },
        'format_number w/2 decimals and , as dec point': function () {
            var number = util.format_number(12345, 2, ',');
            assert.equals(number, '12,345,00');
        },
        'format_number w/2 decimals and , as dec point and . as thousand sep': function () {
            var number = util.format_number(12345, 2, ',', '.');
            assert.equals(number, '12.345,00');
        },
        'iso_timestamp wo/input': function () {
            var iso_date_format = util.iso_timestamp();
            assert.match(iso_date_format, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
        },
        'iso_timestamp w/input': function () {
            var sec = 1412597896; //Date.parse("March 21, 2012") / 1000;
            var d = new Date(sec);
            var iso_date_format = util.iso_timestamp(d);
            assert.match(iso_date_format, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
            assert.match(iso_date_format, /2014-10-06 \d{2}:18:16/);
        },
        'iso_date wo/input': function () {
            var iso_date_format = util.iso_date();
            assert.match(iso_date_format, /^\d{4}-\d{2}-\d{2}/);
        },
        'iso_date w/input': function () {
            var sec = 1412597896; //Date.parse("March 21, 2012") / 1000;
            var d = new Date(sec);
            var iso_date_format = util.iso_date(d);
            assert.match(iso_date_format, /^\d{4}-\d{2}-\d{2}/);
            assert.match(iso_date_format, /2014-10-06/);
        }
    }
});
