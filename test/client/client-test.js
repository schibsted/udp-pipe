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
    path         = require('path'),
    EventEmitter = require('events').EventEmitter,
    app_path     = __dirname + '/../../',
    opt          = require('../../config/config-test.js');

var stats, logserver, stats_server;

buster.testCase('lib/logserver', {
    setUp: function (done) {
        //console.log('==> setUp');
        this.timeout = 10000;
        logserver = require('../../lib/logserver.js')({
            logger: {
                log: function () {
                },
                err: function () {
                }
            }
        });
        stats_server = require('../../lib/stats-server.js')({
            logger: {
                log: function () {
                },
                err: function () {
                }
            }
        });
        opt = logserver.reload_module(__dirname + '/../../config/config-test.js');
        stats = stats_server.create_process_stats();
        stats_server.start(opt, path.normalize(app_path), stats, function () {
            logserver.start_udp_server(opt, stats, function () {
                done();
            });
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
        'get client html and check for required divs and javascript': function (done) {
            request('http://127.0.0.1:' + opt.admin.http_server_port + '/client/', function (error, response, body) {
                assert.equals(response.statusCode, 200);
                assert.match(body, '<script src="js/websocket.js"></script>');
                assert.match(body, '<div id="process_graph" style="width:100%;height:200px;"></div>');
                assert.match(body, '<div id="time_graph" style="width:100%;height:200px;"></div>');
                assert.match(body, '<div id="process_graph_5min" style="width:100%;height:200px;"></div>');
                done();
            });
        }
    }

});