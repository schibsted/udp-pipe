var EventEmitter = require('events').EventEmitter;
var LogClass = require('./log');

var Logserver = function () {
    var that;
    var version = '0.0.6';
    var util = require('./util');
    var timer_start;

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
        var log = new LogClass(opt.log);
        var colors = require('colors');
        // Check for plugins
        var fs = require('fs');
        var plugin_path = './plugins';

        function execute_plugin_on_event(plugin, event) {
            if (typeof (plugin.execute) === 'function') {
                that.on(event, function (message) {
                    try {
                        var start = process.hrtime();
                        if (!timer_start) timer_start = start;
                        plugin.execute(message, function() {
                            var end = process.hrtime(start);
                            var total_time = end[0] + (end[1] / 1000000000);

                            var end_since_start = process.hrtime(timer_start);
                            var elapsed_since_start = end_since_start[0] + (end_since_start[1] / 1000000000);
                            log.debug(plugin.name + ": Total time=" + total_time + ", message = " + message + ", elapsed since start = " + elapsed_since_start);
                        });
                    } catch (error) {
                        console.log(error);
                    }
                });
            }
        }

        function plugin_is_enabled(file) {
            return opt.plugins[file] != undefined && opt.plugins[file].disabled != true;
        }

        function get_plugin_class(file) {
            var filename = '.' + plugin_path + '/' + file;
            console.log('Loading plugin: ' + filename);
            return require(filename);
        }

        function load_plugins() {
            try {
                var stat = fs.lstatSync(plugin_path);
                if (stat.isDirectory()) {
                    fs.readdirSync(plugin_path).forEach(function (file) {
                        if (file.match(/\.js$/)) {
                            if (plugin_is_enabled(file)) {
                                var PluginClass = get_plugin_class(file);
                                var plugin = new PluginClass(opt.plugins[file]);
                                execute_plugin_on_event(plugin, "message");
                            }
                        }
                    });
                }
            } catch (err) {
                console.log(err);
            }
        }

        function parseMessage(msg) {
            try {
                return JSON.parse(msg);
            } catch (err) {
                return msg.toString('utf8');
            }
        }

        load_plugins();

        var dgram = require("dgram");
        var server = dgram.createSocket("udp4");

        function update_recent_log_lines_buffer(content) {
            opt.stats.last_log_lines.splice(0, 0, JSON.stringify(content, undefined, 2));
            var last_log_lines_length = opt.stats.last_log_lines.length;
            if (last_log_lines_length >= 5) {
                opt.stats.last_log_lines.splice(5, last_log_lines_length);
            }
        }

        server.on("message", function (msg, rinfo) {
            // Tick stats counter.
            opt.stats.rps.mark();

            var start = process.hrtime();
            var content = {
                timestamp: util.iso_date(),
                from: rinfo.address,
                port: rinfo.port,
                message: parseMessage(msg)
            };

            // Emit message event to this object so plugins can do event stuff.
            that.emit('message', content['message']);

            var end = process.hrtime(start);
            content.total_time = end[0] + (end[1] / 1000000000);

            update_recent_log_lines_buffer(content);
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