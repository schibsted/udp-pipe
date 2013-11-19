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
        timstamp: parseInt((new Date()).getTime()),
        utime:  parseInt((new Date()).getTime() / 1000),
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
        if (plugins[plugin].max_rate === undefined)
            plugins[plugin].max_rate = 0;
        var current_rate = plugins[plugin].current_rate = parseFloat(stats_collection.http[plugin].currentRate);
        plugins[plugin].max_rate = parseFloat(current_rate > plugins[plugin].max_rate ? current_rate : plugins[plugin].max_rate);
        plugins[plugin].current_rate = parseInt(current_rate);
        plugins[plugin].max_rate = parseFloat(plugins[plugin].max_rate);
        plugins[plugin].mean = parseFloat(stats_collection.http[plugin].mean);
        plugins[plugin].count = parseInt(stats_collection.http[plugin].count);
        plugins[plugin].one_minute_rate = parseFloat(stats_collection.http[plugin]['1MinuteRate']);
        plugins[plugin].five_minute_rate = parseFloat(stats_collection.http[plugin]['5MinuteRate']);
        plugins[plugin].fifteen_minute_rate = parseFloat(stats_collection.http[plugin]['15MinuteRate']);
        var end = process.hrtime( plugins[plugin].start_time );
        var run_time = end[0] + (end[1] / 1000000000);
        plugins[plugin].run_time = run_time;
        plugins[plugin].execution_time = parseFloat(plugins[plugin].execution_time);
    }

    var statistics = {
        stats: {
            mean: parseFloat(stats_collection.http.requestsPerSecond.mean),
            count: parseInt(stats_collection.http.requestsPerSecond.count),
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
            timestamp: parseInt((new Date()).getTime()),
            utime:  parseInt((new Date()).getTime() / 1000),
            plugins: plugins
        }
    };
    return statistics;
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