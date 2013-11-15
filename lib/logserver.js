var EventEmitter = require('events').EventEmitter;
var LogClass = require('./log');

var Logserver = function () {
    var that;
    var util = require('./util');
    var fs = require('fs');
    var timer_start;
    var process_statistics;

    function reload_module (module) {
        delete require.cache[require.resolve(module)];
        return require(module);
    }

    function reload_process(opt) {
        // TODO: Reload all plugins and initialize them all over
        // Important to reload plugins completely, due to coding standard!
        // Config inside plugins is not possible to change runtime due to design choice.
        clear_plugins();
        load_plugins(opt);
    }

    function clear_plugins() {
        that.removeAllListeners('message');
        // TODO: Do we need to delete require cache?
        // delete require.cache[];
    }

    function load_plugins(opt) {
        var plugin_path = './plugins';
        try {
            var stat = fs.lstatSync(plugin_path);
            if (stat.isDirectory()) {
                fs.readdirSync(plugin_path).forEach(function (file) {
                    if (file.match(/\.js$/)) {
                        if (plugin_is_enabled(opt.plugins[file])) {
                            var PluginClass = get_plugin_class(plugin_path, file);
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

    function execute_plugin_on_event(plugin, event) {
        if (typeof (plugin.execute) === 'function') {
            that.on(event, function (message, remote_address_info) {
                try {
                    if (typeof (plugin.regexp) != 'function' || message.match(plugin.regexp())) {
                        var start = process.hrtime();
                        if (!timer_start) timer_start = start;
                        plugin.execute(message, remote_address_info, function() {
                            var end = process.hrtime(start);
                            var execution_time = end[0] + (end[1] / 1000000000);

                            var end_since_start = process.hrtime(timer_start);
                            var elapsed_since_start = end_since_start[0] + (end_since_start[1] / 1000000000);
                            //log.debug(plugin.name + ": Total time=" + total_time + ", message = " + message + ", elapsed since start = " + elapsed_since_start);

                            update_plugin_execution_stats(plugin, {
                                execution_time : execution_time
                            });
                        });
                    }
                } catch (err) {
                    console.error(err);
                }
            });
        }
    }

    function plugin_is_enabled(plugin) {
        return plugin != undefined && plugin.disabled != true;
    }

    function get_plugin_class(plugin_path, file) {
        var filename = '.' + plugin_path + '/' + file;
        console.log('Loading plugin: ' + filename);
        return require(filename);
    }

    function update_recent_log_lines_buffer(content) {
        process_statistics.last_log_lines.splice(0, 0, JSON.stringify(content, undefined, 2));
        var last_log_lines_length = process_statistics.last_log_lines.length;
        if (last_log_lines_length >= 5) {
            process_statistics.last_log_lines.splice(5, last_log_lines_length);
        }
        process_statistics.cnt++;
        process_statistics.total_execution_time += content.execution_time;
        process_statistics.avg_execution_time =
            process_statistics.total_execution_time / process_statistics.cnt;
        if (content.execution_time > process_statistics.max_execution_time)
            process_statistics.max_execution_time = content.execution_time;
        if (process_statistics.min_execution_time === 0 || content.execution_time < process_statistics.min_execution_time)
            process_statistics.min_execution_time = content.execution_time;


    }

    function update_plugin_execution_stats(plugin, content) {
        process_statistics.collection.meter(plugin.name).mark();
        if (!process_statistics.hasOwnProperty('plugins')) {
            process_statistics['plugins'] = {};
        }
        if (!process_statistics.plugins.hasOwnProperty(plugin.name)) {
            var start_time = process.hrtime();
            process_statistics.plugins[plugin.name] = {
                cnt: 0,
                start_time: start_time,
                run_time: 0,
                total_execution_time: 0,
                avg_execution_time: 0,
                max_execution_time: 0,
                min_execution_time: 0
            };
        }
        process_statistics.plugins[plugin.name].cnt++;
        process_statistics.plugins[plugin.name].total_execution_time += content.execution_time;
        process_statistics.plugins[plugin.name].avg_execution_time =
            process_statistics.plugins[plugin.name].total_execution_time / process_statistics.plugins[plugin.name].cnt;
        if (content.execution_time > process_statistics.plugins[plugin.name].max_execution_time)
            process_statistics.plugins[plugin.name].max_execution_time = content.execution_time;
        if (process_statistics.plugins[plugin.name].min_execution_time === 0 || content.execution_time < process_statistics.plugins[plugin.name].min_execution_time)
            process_statistics.plugins[plugin.name].min_execution_time = content.execution_time;
        var end_time = process.hrtime(process_statistics.plugins[plugin.name].start_time);
        var run_time = end_time[0] + (end_time[1] / 1000000000);
        process_statistics.plugins[plugin.name].run_time = run_time;
    }

    function start_udp_server(opt, stats) {
        process_statistics = stats;
        var log = new LogClass(opt.log);
        var colors = require('colors');
        load_plugins(opt);

        var dgram = require("dgram");
        var server = dgram.createSocket("udp4");


        server.on("message", function (msg, remote_address_info) {
            // Tick stats counter.
            process_statistics.rps.mark();

            var start = process.hrtime();
            var content = {
                timestamp: util.iso_date(),
                from: remote_address_info.address,
                port: remote_address_info.port,
                message: msg.toString('utf8')
            };

            function emit_message_to_plugins(emitter, message, remote_address_info) {
                emitter.emit('message', message, remote_address_info);
            }

            emit_message_to_plugins(that, content['message'], remote_address_info);

            var end = process.hrtime(start);
            content.execution_time = end[0] + (end[1] / 1000000000);

            update_recent_log_lines_buffer(content);
        });

        server.on("listening", function () {
            var address = server.address();
            console.log("UDP server listening on ".blue + address.address + ":" + address.port);
        });

        server.bind(opt.admin.udp_server_port);
        console.log('Started with pid: '.green + process.pid);
    }

    that = {
        reload_process: reload_process,
        reload_module: reload_module,
        start_udp_server: start_udp_server
    };

    that.__proto__ = EventEmitter.prototype;
    return that;
};

module.exports = Logserver;