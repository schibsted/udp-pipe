var util = require('./util');
var color = require('colors');

function process_stats(opt) {
    // Measuring stuff for process reporting purpose.
    var metrics = require('measured');
    var collection = new metrics.Collection('http');
    var rps = collection.meter('requestsPerSecond');
    opt.stats = {
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


function make_stats(opt) {
    var _stats = opt.stats.collection.toJSON();
    var _curr = _stats.http.requestsPerSecond.currentRate;
    opt.stats.max_rate = _curr > opt.stats.max_rate ? _curr : opt.stats.max_rate;
    var _opt = {
        stats: {
            mean: util.sprintf("%.1f", _stats.http.requestsPerSecond.mean),
            count: util.format_number(_stats.http.requestsPerSecond.count, 0),
            current_rate: util.sprintf("%.1f", _stats.http.requestsPerSecond.currentRate),
            max_rate: util.sprintf("%.1f", opt.stats.max_rate),
            '1MinuteRate': util.sprintf("%.1f", _stats.http.requestsPerSecond['1MinuteRate']),
            '5MinuteRate': util.sprintf("%.1f", _stats.http.requestsPerSecond['5MinuteRate']),
            '15MinuteRate': util.sprintf("%.1f", _stats.http.requestsPerSecond['15MinuteRate']),
            mem_usage: util.format_number((opt.stats.mem_usage.toJSON() / 1024 / 1024), 2) + ' MB',
            uptime: util.format_number(JSON.stringify(opt.stats.uptime), 0) + ' sec',
            last_log_lines: opt.stats.last_log_lines
        }
    };
    return _opt;
}


function web_socket_server(opt) {
    // Setting up admin websocket server.
    var WebSocketServer = require('ws').Server;
    var wss = new WebSocketServer({
        port: opt.admin.web_socket_port
    });
    util.clog('Listening for websocket connections on port: '.blue
        + opt.admin.web_socket_port);
    wss.on('connection', function (ws) {
        // Incoming messages from clients.
        ws.on('message', function (message) {
            util.clog('received: %s', message);
        });
        // Send info to client at an interval.
        var id = setInterval(function () {
            ws.send(JSON.stringify(make_stats(opt)), function () {
                /* ignore errors */
            });
            //util.clog('sending data to client: ' + JSON.stringify(stats));
        }, 300);
        util.clog('started websocket client interval'.green);
        // If client connection is lost. Clear interval timer.
        ws.on('close', function () {
            util.clog('stopping websocket client interval'.red);
            clearInterval(id);
        });
    });
}


function web_server(opt, path) {
    var express = require('express');
    // Serving websocket server client webpage (html, css, js and images)
    var webserver = new express();
    // Map static folder.
    webserver.use('/client', express.static(path + '/client'));
    // Map stats url to JSON stats.
    webserver.get('/stats', function (req, res) {
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify(make_stats(opt)));
    });
    // Listen for traffic
    webserver.listen(opt.admin.http_server_port);
    console.log('Webserver for admin client webpage : http://127.0.0.1:'.green
        + opt.admin.http_server_port
        + '/client/'.green);
}

module.exports.start = function(opt, path) {
    web_server(opt, path);
    web_socket_server(opt);
};
module.exports.process_stats = process_stats;