/*
 * https://github.com/schibsted
 *
 * Copyright (c) 2014 Schibsted Payment
 * Licensed under the MIT license.
 */
'use strict';

var buster       = require('buster'),
    assert       = buster.assert,
    refute       = buster.refute,
    when         = require('when'),
    request      = require('request'),
    EventEmitter = require('events').EventEmitter,
    opt          = require('../../config/config-test.js');

var stats, logserver, stats_server;
var udp_message = '{"foo": "bar", "gomle": "foobar"}';

buster.testCase('lib/logserver', {
    setUp: function (done) {
        //console.log('==> setUp');
        this.timeout = 2000;
        logserver = require('../../lib/logserver.js')({ logger: {
            log: function () {},
            err: function () {}
        }});
        stats_server = require('../../lib/stats-server.js')({ logger: {
            log: function () {},
            err: function () {}
        }});
        opt = logserver.reload_module(__dirname + '/../../config/config-test.js');
        stats = stats_server.create_process_stats();
        stats_server.start(opt, __dirname, stats);
        logserver.start_udp_server(opt, stats, function () {
            done();
        });
    },
    tearDown: function (done) {
        //console.log('==> tearDown');
        logserver.reload_process(opt);
        logserver.stop_udp_server(opt, function () {
            stats_server.stop(opt, function () {
                done();
            });
        });
    },

    'logserver': {
        'get JSON stats via http': function (done) {
            logserver.send_udp(udp_message, '127.0.0.1', opt.admin.udp_server_port);
            request('http://127.0.0.1:' + opt.admin.http_server_port + '/stats', function (error, response, body) {
                var stats = JSON.parse(body);
                var last_log_lines = JSON.parse(stats.stats.last_log_lines);
                var output_message = JSON.parse(last_log_lines.message);
                assert.isNumber(stats.stats.mean);
                assert.isNumber(stats.stats.count);
                assert.isNumber(stats.stats.current_rate);
                assert.isNumber(stats.stats.max_rate);
                assert.isNumber(stats.stats['1MinuteRate']);
                assert.isNumber(stats.stats['5MinuteRate']);
                assert.isNumber(stats.stats['15MinuteRate']);
                assert.isString(stats.stats.mem_usage);
                assert.isNumber(stats.stats.uptime);
                assert.isNumber(stats.stats.execution_time);
                assert.isNumber(stats.stats.avg_execution_time);
                assert.isNumber(stats.stats.max_execution_time);
                assert.isNumber(stats.stats.min_execution_time);
                assert.isNumber(stats.stats.total_execution_time);
                assert.isArray(stats.stats.last_log_lines);
                assert.isNumber(stats.stats.timestamp);
                assert.isNumber(stats.stats.utime);
                assert.isObject(stats.stats.plugins);
                assert.isObject(stats.stats.plugins.dumper);
                assert.isNumber(stats.stats.plugins.dumper.cnt);
                assert.isArray(stats.stats.plugins.dumper.start_time);
                assert.isNumber(stats.stats.plugins.dumper.run_time);
                assert.isNumber(stats.stats.plugins.dumper.execution_time);
                assert.isNumber(stats.stats.plugins.dumper.total_execution_time);
                assert.isNumber(stats.stats.plugins.dumper.utime);
                assert.isNumber(stats.stats.plugins.dumper.avg_execution_time);
                assert.isNumber(stats.stats.plugins.dumper.max_execution_time);
                assert.isNumber(stats.stats.plugins.dumper.min_execution_time);
                assert.isNumber(stats.stats.plugins.dumper.max_rate);
                assert.isNumber(stats.stats.plugins.dumper.current_rate);
                assert.isNumber(stats.stats.plugins.dumper.mean);
                assert.isNumber(stats.stats.plugins.dumper.count);
                assert.isNumber(stats.stats.plugins.dumper.one_minute_rate);
                assert.isNumber(stats.stats.plugins.dumper.five_minute_rate);
                assert.isNumber(stats.stats.plugins.dumper.fifteen_minute_rate);
                assert.isNumber(stats.stats.mean);
                assert.equals(output_message, udp_message);
                assert.equals(stats.stats.count, 1);
                assert.equals(stats.stats.plugins.dumper.count, 1);
                assert(true);
                //assert.equals(200, response.statusCode);
                done();
            });
        },
        'get JSON stats via websockets': function (done) {
            logserver.send_udp(udp_message, '127.0.0.1', opt.admin.udp_server_port);
            var WebSocket = require('ws'),
                ws = new WebSocket('ws://127.0.0.1:' + opt.admin.web_socket_port);
            ws.on('open', function() {
                ws.send('something');
            });
            ws.on('message', function (message) {
                //console.log('received: %s', message);
                var stats = JSON.parse(message);
                var last_log_lines = JSON.parse(stats.stats.last_log_lines);
                var output_message = JSON.parse(last_log_lines.message);
                assert.isNumber(stats.stats.mean);
                assert.isNumber(stats.stats.count);
                assert.isNumber(stats.stats.current_rate);
                assert.isNumber(stats.stats.max_rate);
                assert.isNumber(stats.stats['1MinuteRate']);
                assert.isNumber(stats.stats['5MinuteRate']);
                assert.isNumber(stats.stats['15MinuteRate']);
                assert.isString(stats.stats.mem_usage);
                assert.isNumber(stats.stats.uptime);
                assert.isNumber(stats.stats.execution_time);
                assert.isNumber(stats.stats.avg_execution_time);
                assert.isNumber(stats.stats.max_execution_time);
                assert.isNumber(stats.stats.min_execution_time);
                assert.isNumber(stats.stats.total_execution_time);
                assert.isArray(stats.stats.last_log_lines);
                assert.isNumber(stats.stats.timestamp);
                assert.isNumber(stats.stats.utime);
                assert.isObject(stats.stats.plugins);
                assert.isObject(stats.stats.plugins.dumper);
                assert.isNumber(stats.stats.plugins.dumper.cnt);
                assert.isArray(stats.stats.plugins.dumper.start_time);
                assert.isNumber(stats.stats.plugins.dumper.run_time);
                assert.isNumber(stats.stats.plugins.dumper.execution_time);
                assert.isNumber(stats.stats.plugins.dumper.total_execution_time);
                assert.isNumber(stats.stats.plugins.dumper.utime);
                assert.isNumber(stats.stats.plugins.dumper.avg_execution_time);
                assert.isNumber(stats.stats.plugins.dumper.max_execution_time);
                assert.isNumber(stats.stats.plugins.dumper.min_execution_time);
                assert.isNumber(stats.stats.plugins.dumper.max_rate);
                assert.isNumber(stats.stats.plugins.dumper.current_rate);
                assert.isNumber(stats.stats.plugins.dumper.mean);
                assert.isNumber(stats.stats.plugins.dumper.count);
                assert.isNumber(stats.stats.plugins.dumper.one_minute_rate);
                assert.isNumber(stats.stats.plugins.dumper.five_minute_rate);
                assert.isNumber(stats.stats.plugins.dumper.fifteen_minute_rate);
                assert.isNumber(stats.stats.mean);
                assert.equals(output_message, udp_message);
                assert.equals(stats.stats.count, 1);
                assert.equals(stats.stats.plugins.dumper.count, 1);
                assert(true);
                ws.close();
                done();
            });
        },

        'test UDP server by sending and UDP package': function (done) {
            var logserver_events = logserver.get_events();
            logserver_events.on('message', function (msg, remote_address_info) {
                var output_message = JSON.parse(msg);
                assert.equals(output_message, udp_message);
                done();
            });
            logserver.send_udp(udp_message, '127.0.0.1', opt.admin.udp_server_port);
        }

    }
});
