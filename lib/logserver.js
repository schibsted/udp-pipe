var EventEmitter = require('events').EventEmitter;
var LogClass = require('./log');

var Logserver = function () {
    var that;
    var version = '0.0.6';
    var util = require('./util');
    var timer_start;

    function reload_process(opt) {
        // TODO: Reload all plugins and initialize them all over
        // Important to reload plugins completely, due to coding standard!
        // Config inside plugins is not possible to change runtime due to design choice.
    }

    function udp_server(opt, stats) {
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
                    } catch (err) {
                        log.error(err);
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
            stats.last_log_lines.splice(0, 0, JSON.stringify(content, undefined, 2));
            var last_log_lines_length = stats.last_log_lines.length;
            if (last_log_lines_length >= 5) {
                stats.last_log_lines.splice(5, last_log_lines_length);
            }
        }

        server.on("message", function (msg, rinfo) {
            // Tick stats counter.
            stats.rps.mark();

            var start = process.hrtime();
            var content = {
                timestamp: util.iso_date(),
                from: rinfo.address,
                port: rinfo.port,
                message: parseMessage(msg)
            };

            function emit_message_to_plugins(emitter, message) {
                emitter.emit('message', message);
            }

            emit_message_to_plugins(that, content['message']);

            var end = process.hrtime(start);
            content.total_time = end[0] + (end[1] / 1000000000);

            update_recent_log_lines_buffer(content);
        });

        server.on("listening", function () {
            var address = server.address();
            util.clog("UDP server listening on ".blue + address.address + ":" + address.port);
        });

        server.bind(opt.admin.udp_server_port);
        util.clog('Started with pid: '.green + process.pid);
    }

    that = {
        version: version,
        reload_process: reload_process,
        start_udp_server: udp_server
    };

    that.__proto__ = EventEmitter.prototype;
    return that;
};

module.exports = Logserver;