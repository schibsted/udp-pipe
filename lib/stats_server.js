var util = require('./util');
var color = require('colors');

function create_process_stats() {
    // Measuring stuff for process reporting purpose.
    var metrics = require('measured');
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
        max_rate: 0
    };
}

function make_stats(stats) {
    var stats_collection = stats.collection.toJSON();
    var currentRate = stats_collection.http.requestsPerSecond.currentRate;
    stats.max_rate = currentRate > stats.max_rate ? currentRate : stats.max_rate;
    return {
        stats: {
            mean: stats_collection.http.requestsPerSecond.mean.toFixed(1),
            count: util.format_number(stats_collection.http.requestsPerSecond.count, 0),
            current_rate: stats_collection.http.requestsPerSecond.currentRate.toFixed(1),
            max_rate: stats.max_rate.toFixed(1),
            '1MinuteRate': stats_collection.http.requestsPerSecond['1MinuteRate'].toFixed(1),
            '5MinuteRate': stats_collection.http.requestsPerSecond['5MinuteRate'].toFixed(1),
            '15MinuteRate': stats_collection.http.requestsPerSecond['15MinuteRate'].toFixed(1),
            mem_usage: util.format_number((stats.mem_usage.toJSON() / 1024 / 1024), 2) + ' MB',
            uptime: util.format_number(JSON.stringify(stats.uptime), 0) + ' sec',
            last_log_lines: stats.last_log_lines
        }
    };
}

function web_socket_server(opt, stats) {
    // Setting up admin websocket server.
    var WebSocketServer = require('ws').Server;
    var wss = new WebSocketServer({
        port: opt.admin.web_socket_port
    });
    console.log('Listening for websocket connections on port: '.blue
        + opt.admin.web_socket_port);

    wss.on('connection', function (ws) {
        ws.on('message', function (message) {
            console.log('received: %s', message);
        });
        var id = setInterval(function () {
            ws.send(JSON.stringify(make_stats(stats)), function () {
                /* ignore errors */
            });
        }, 300);
        console.log('started websocket client interval'.green);
        // If client connection is lost. Clear interval timer.
        ws.on('close', function () {
            console.log('stopping websocket client interval'.red);
            clearInterval(id);
        });
    });
}

function web_server(opt, path, stats) {
    var express = require('express');
    var webserver = new express();
    webserver.use('/client', express.static(path + '/client'));
    webserver.get('/stats', function (req, res) {
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify(make_stats(stats)));
    });

    webserver.listen(opt.admin.http_server_port);
    console.log('Webserver for admin client webpage : http://127.0.0.1:'.green
        + opt.admin.http_server_port
        + '/client/'.green);
}

module.exports.start = function(opt, path, stats) {
    web_server(opt, path, stats);
    web_socket_server(opt, stats);
};
module.exports.create_process_stats = create_process_stats;