var EventEmitter = require('events').EventEmitter;

var Logserver = function () {
    var that;
    var version = '0.0.6';
    var plugins = {};

    var UtilClass = require('./util');
    util = new UtilClass();


    function reload_process(opt) {
        // TODO: Reload all plugins and initialize them all over
    }


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


    function udp_server(opt) {
        var colors = require('colors');
        // Check for plugins
        var fs = require('fs');
        var path = './plugins';
        try {
            // Query dir
            var stat = fs.lstatSync(path);
            if (stat.isDirectory()) {
                // If plugin dir is present parse all files.
                fs.readdirSync(path).forEach(function (file) {
                    if (file.match(/\.js$/) && !file.match(/^boilerplate.js$/)) {
                        if (opt.plugins[file] != undefined) {
                            // Setup all plugins.
                            var filename = '.' + path + '/' + file;
                            console.log('Loading plugin: ' + filename);
                            // Load plugins if present
                            var PluginClass = require(filename);
                            plugins[filename] = new PluginClass();
                            if (typeof (plugins[filename].init) === 'function') {
                                try {
                                    plugins[filename].init(opt.plugins[file]);
                                } catch (error) {
                                    console.log(error);
                                }
                            }
                            if (typeof (plugins[filename].execute) === 'function') {
                                // Attach plugin to udp message event.
                                that.on('message', function (message) {
                                    try {
                                        plugins[filename].execute(message);
                                    } catch (error) {
                                        console.log(error);
                                    }
                                });
                            }
                        }
                    }
                });
            }
        } catch (err) {
            console.log(err);
        }
        // Setup UDP server on ip4
        var dgram = require("dgram");
        var server = dgram.createSocket("udp4");
        // When server receives a message. Extecute this.
        server.on("message", function (msg, rinfo) {
            // Tick stats counter.
            opt.stats.rps.mark();
            // Max message size is:
            //     The practical limit for the data length which is imposed by the underlying IPv4 protocol is 65,507 bytes (65,535,  8 byte UDP header, 20 byte IP header)
            var start = process.hrtime();
            var content = {
                timestamp: util.iso_date(),
                from: rinfo.address,
                port: rinfo.port
            };
            var message;
            try {
                message = JSON.parse(msg);
                content['message'] = message;
            } catch (err) {
                var message = msg.toString('utf8');
                content['message'] = message;
            }

            // Emit message event to this object so plugins can do event stuff.
            that.emit('message', message);

            // Stop timer
            var end = process.hrtime(start);
            var total_time = end[0] + (end[1] / 1000000000);
            content.total_time = total_time;

            // Store 5 last messages in an array in memory for admin interface.
            opt.stats.last_log_lines.splice(0, 0, JSON.stringify(content, undefined, 2));
            var last_log_lines_length = opt.stats.last_log_lines.length;
            if (last_log_lines_length >= 5) {
                opt.stats.last_log_lines.splice(5, last_log_lines_length);
            }
        });

        // When server is started. Execute this.
        server.on("listening", function () {
            var address = server.address();
            util.clog("UDP server listening on ".blue + address.address + ":" + address.port);
        });

        // Start server.
        server.bind(opt.admin.udp_server_port);
        util.clog('Started with pid: '.green + process.pid);
    }


    // Export public functions from this Class.
    that = {
        version: version,
        process_stats: process_stats,
        reload_process: reload_process,
        web_socket_server: web_socket_server,
        web_server: web_server,
        udp_server: udp_server
    };

    // Inherit public functions from other class.
    that.__proto__ = EventEmitter.prototype;

    // Return object to make functions accessible.
    return that;
};

module.exports = Logserver;