/*
 * https://github.com/schibsted
 *
 * Copyright (c) 2014 Schibsted Payment
 * Licensed under the MIT license.
 */
'use strict';
var when    = require('when'),
    _       = require('underscore'),
    metrics = require('measured');


var StatsServer = function (opt, mock_services) {
    var opts = opt || {};
    mock_services = mock_services || {};
    var logger = opts.logger;
    var util = require('./util')({ logger: logger });

    var Express = require('express');
    var app = new Express();
    var webserver;

    var WebSocketServer = require('ws').Server;
    var wss;

    function create_process_stats() {
        // Measuring stuff for process reporting purpose.
        var collection = new metrics.Collection('http');
        return {
            collection: collection,
            rps: collection.meter('requestsPerSecond'),
            mem_usage: new metrics.Gauge(function () {
                return process.memoryUsage().rss;
            }),
            uptime: new metrics.Gauge(function () {
                return process.uptime();
            }),
            last_log_lines: [],
            timstamp: parseInt((new Date()).getTime(), 10),
            utime: parseInt((new Date()).getTime() / 1000, 10),
            max_rate: 0,
            execution_time: 0,
            avg_execution_time: 0,
            max_execution_time: 0,
            min_execution_time: 0,
            total_execution_time: 0,
            cnt: 0
        };
    }

    function make_stats(stats) {
        var stats_collection = stats.collection.toJSON();
        var current_rate = stats_collection.http.requestsPerSecond.currentRate;
        stats.max_rate = current_rate > stats.max_rate ? current_rate : stats.max_rate;
        var plugins = stats.plugins;
        for (var plugin in plugins) {
            if (plugins[plugin]) {
                if (plugins[plugin].max_rate === undefined) {
                    plugins[plugin].max_rate = 0;
                }
                current_rate = plugins[plugin].current_rate = parseFloat(stats_collection.http[plugin].currentRate);
                plugins[plugin].max_rate = parseFloat(current_rate > plugins[plugin].max_rate ? current_rate : plugins[plugin].max_rate);
                plugins[plugin].current_rate = parseInt(current_rate, 10);
                plugins[plugin].max_rate = parseFloat(plugins[plugin].max_rate);
                plugins[plugin].mean = parseFloat(stats_collection.http[plugin].mean);
                plugins[plugin].count = parseInt(stats_collection.http[plugin].count, 10);
                plugins[plugin].one_minute_rate = parseFloat(stats_collection.http[plugin]['1MinuteRate']);
                plugins[plugin].five_minute_rate = parseFloat(stats_collection.http[plugin]['5MinuteRate']);
                plugins[plugin].fifteen_minute_rate = parseFloat(stats_collection.http[plugin]['15MinuteRate']);
                var end = process.hrtime(plugins[plugin].start_time);
                var run_time = end[0] + (end[1] / 1000000000);
                plugins[plugin].run_time = run_time;
                plugins[plugin].execution_time = parseFloat(plugins[plugin].execution_time);
            }
        }

        var statistics = {
            stats: {
                mean: parseFloat(stats_collection.http.requestsPerSecond.mean),
                count: parseInt(stats_collection.http.requestsPerSecond.count, 10),
                current_rate: parseFloat(stats_collection.http.requestsPerSecond.currentRate),
                max_rate: parseFloat(stats.max_rate),
                '1MinuteRate': parseFloat(stats_collection.http.requestsPerSecond['1MinuteRate']),
                '5MinuteRate': parseFloat(stats_collection.http.requestsPerSecond['5MinuteRate']),
                '15MinuteRate': parseFloat(stats_collection.http.requestsPerSecond['15MinuteRate']),
                mem_usage: util.format_number((stats.mem_usage.toJSON() / 1024 / 1024), 2),
                uptime: stats.uptime,
                execution_time: parseFloat(stats.execution_time),
                avg_execution_time: parseFloat(stats.avg_execution_time),
                max_execution_time: parseFloat(stats.max_execution_time),
                min_execution_time: parseFloat(stats.min_execution_time),
                total_execution_time: parseFloat(stats.total_execution_time),
                last_log_lines: stats.last_log_lines,
                timestamp: parseInt((new Date()).getTime(), 10),
                utime: parseInt((new Date()).getTime() / 1000, 10),
                plugins: plugins
            }
        };
        return statistics;
    }

    function web_socket_server(opt, stats) {
        // Setting up admin websocket server.
        wss = new WebSocketServer({
            port: opt.admin.web_socket_port
        });
        logger.log('Listening for websocket connections on port: ' +
            opt.admin.web_socket_port);

        wss.on('connection', function (ws) {
            ws.on('message', function (message) {
                logger.log('received: %s', message);
            });
            var id = setInterval(function () {
                ws.send(JSON.stringify(make_stats(stats)), function () {
                    /* ignore errors */
                });
            }, 300);
            logger.log('started websocket client interval');
            // If client connection is lost. Clear interval timer.
            ws.on('close', function () {
                logger.log('stopping websocket client interval');
                clearInterval(id);
            });
        });
    }

    function web_server(opt, path, stats, callback) {
        app.use('/client', Express.static(path + 'client'));
        app.get('/stats', function (req, res) {
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify(make_stats(stats)));
        });

        webserver = app.listen(opt.admin.http_server_port, function () {
            if (_.isFunction(callback)) {
                callback();
            }
        });
        logger.log('Webserver for admin client webpage : http://127.0.0.1:' +
            opt.admin.http_server_port +
            '/client/');
    }

    return {
        start: function (opt, path, stats, callback) {
            web_server(opt, path, stats, callback);
            web_socket_server(opt, stats);
        },
        stop: function (opt, callback) {
            wss.close();
            setTimeout(function () {
                webserver.close(function() {
                    if (_.isFunction(callback)) {
                        callback();
                    }
                });
            }, 200);
        },
        create_process_stats: create_process_stats
    };

};

module.exports = StatsServer;
//
//module.exports.start = function(opt, path, stats) {
//    web_server(opt, path, stats);
//    web_socket_server(opt, stats);
//};
//module.exports.create_process_stats = create_process_stats;