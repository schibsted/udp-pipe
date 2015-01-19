/*
 * https://github.com/schibsted
 *
 * Copyright (c) 2014 Schibsted Payment
 * Licensed under the MIT license.
 */
'use strict';
var when         = require('when'),
    _            = require('underscore'),
    fs           = require('fs'),
    dgram        = require('dgram'),
    path         = require('path'),
    EventEmitter = require('events').EventEmitter;

var Logserver = function (opt, mock_services) {
    var opts = opt || {};
    var logger = opts.logger;
    var util = require('./util')({ logger: logger });
    var server;
    mock_services = mock_services || {};
    server = mock_services.server || dgram.createSocket("udp4");

    var total = 0;
    var timer_start;
    var process_statistics;
    var plugins = [];


    function reload_module (module) {
        delete require.cache[require.resolve(module)];
        return require(module);
    }


    function reload_process (opt) {
        // TODO: Reload all plugins and initialize them all over
        // Important to reload plugins completely, due to coding standard!
        // Config inside plugins is not possible to change runtime due to design choice.
        clear_plugins(opt);
        load_plugins(opt);
    }


    function clear_plugins () {
        Logserver.events.removeAllListeners('message');
        // TODO: Do we need to delete require cache?
        // delete require.cache[];
        plugins.forEach(function (plugin) {
            if (_.isFunction(plugin.end)) {
                plugin.end();
            }
        });
        plugins = [];
    }


    function load_plugins (opt) {
        var plugin_path = path.normalize(__dirname + (opt.plugin_path || '/../plugins'));
        //console.log('load_plugins: path: ', plugin_path, __dirname);
        var stat = fs.lstatSync(plugin_path);
        if (stat.isDirectory()) {
            //console.log('load_plugins: isDirectory', plugin_path);
            fs.readdirSync(plugin_path).forEach(function (file) {
                //console.log('load_plugins: Plugin file: ', file);
                if (file.match(/\.js$/)) {
                    if (plugin_is_enabled(opt.plugins[file])) {
                        //console.log('load_plugins: plugin_is_enabled: ', plugin_path, file);
                        try {
                            var plugin = get_plugin_module(opt.plugins[file], plugin_path, file);
                            plugins.push(plugin);
                            execute_plugin_on_event(opt, plugin, "message");
                        } catch (err) {
                            logger.err('load_plugins: crashed on require:', file, err);
                        }
                    }
                }
            });
        }
    }


    function execute_plugin_on_event (opt, plugin, event) {
        if (typeof (plugin.execute) === 'function') {
            Logserver.events.on(event, function (message, remote_address_info) {
                try {
                    if (!_.isFunction(plugin.regexp) || message.match(plugin.regexp())) {
                        var start = process.hrtime();
                        if (!timer_start) {
                            timer_start = start;
                        }
                        plugin.execute(message, remote_address_info, function() {
                            var end = process.hrtime(start);
                            var execution_time = end[0] + (end[1] / 1000000000);

                            var end_since_start = process.hrtime(timer_start);
                            var elapsed_since_start = end_since_start[0] + (end_since_start[1] / 1000000000);
                            //log.debug(plugin.name + ": Total time=" + total_time + ", message = " + message + ", elapsed since start = " + elapsed_since_start);

                            if (_.isObject(process_statistics)) {
                                update_plugin_execution_stats(plugin, {
                                    execution_time: execution_time
                                });
                            }
                        });
                    }
                } catch (err) {
                    logger.err('Error in plugin ', plugin, err);
                    var log_file = opt.log.path + plugin.name + '-' + util.iso_date() + '-error.log';
                    fs.appendFile(log_file, message + "\n" + 'Error: ' + err, function (err) {
                        if (err) {
                            logger.err(err);
                        }
                        throw err;
                    });
                }
            });
        }
    }


    function plugin_is_enabled (plugin) {
        return plugin !== undefined && plugin.disabled !== true;
    }


    function get_plugin_module (opt, plugin_path, file) {
        var filename = path.normalize(plugin_path + '/' + file);
        logger.log('info', 'Loading plugin: ' + file);
        return require(filename)(opt);
    }


    function update_recent_log_lines_buffer (content) {
        process_statistics.last_log_lines.splice(0, 0, JSON.stringify(content, undefined, 2));
        var last_log_lines_length = process_statistics.last_log_lines.length;
        if (last_log_lines_length >= 5) {
            process_statistics.last_log_lines.splice(5, last_log_lines_length);
        }
        process_statistics.cnt++;
        process_statistics.execution_time = content.execution_time;
        process_statistics.total_execution_time += content.execution_time;
        process_statistics.avg_execution_time =
            process_statistics.total_execution_time / process_statistics.cnt;
        if (content.execution_time > process_statistics.max_execution_time) {
            process_statistics.max_execution_time = content.execution_time;
        }
        if (process_statistics.min_execution_time === 0 || content.execution_time < process_statistics.min_execution_time) {
            process_statistics.min_execution_time = content.execution_time;
        }

    }


    function update_plugin_execution_stats (plugin, content) {
        if (_.isObject(process_statistics) && _.isObject(process_statistics.collection) && _.isFunction(process_statistics.collection.meter)) {
            process_statistics.collection.meter(plugin.name).mark();
        }
        if (!process_statistics.hasOwnProperty('plugins')) {
            process_statistics['plugins'] = {};
        }
        if (!process_statistics.plugins.hasOwnProperty(plugin.name)) {
            var start_time = process.hrtime();
            process_statistics.plugins[plugin.name] = {
                cnt: 0,
                start_time: start_time,
                run_time: 0,
                execution_time: 0,
                total_execution_time: 0,
                utime: 0,
                avg_execution_time: 0,
                max_execution_time: 0,
                min_execution_time: 0
            };
        }
        process_statistics.plugins[plugin.name].cnt++;
        process_statistics.plugins[plugin.name].execution_time = content.execution_time;
        process_statistics.plugins[plugin.name].total_execution_time += content.execution_time;
        process_statistics.plugins[plugin.name].avg_execution_time =
            process_statistics.plugins[plugin.name].total_execution_time / process_statistics.plugins[plugin.name].cnt;
        if (content.execution_time > process_statistics.plugins[plugin.name].max_execution_time) {
            process_statistics.plugins[plugin.name].max_execution_time = content.execution_time;
        }
        if (process_statistics.plugins[plugin.name].min_execution_time === 0 || content.execution_time < process_statistics.plugins[plugin.name].min_execution_time) {
            process_statistics.plugins[plugin.name].min_execution_time = content.execution_time;
        }
        var end_time = process.hrtime(process_statistics.plugins[plugin.name].start_time);
        var run_time = end_time[0] + (end_time[1] / 1000000000);
        process_statistics.plugins[plugin.name].run_time = run_time;
    }


    function start_udp_server (opt, stats, callback) {
        process_statistics = stats;
        load_plugins(opt);

        server.on("message", function (msg, remote_address_info) {
            if (_.isObject(process_statistics) && _.isObject(process_statistics.rps) && _.isFunction(process_statistics.rps.mark)) {
                // Tick stats counter.
                process_statistics.rps.mark();
            }

            var start = process.hrtime();
            var content = {
                timestamp: util.iso_timestamp(),
                from: remote_address_info.address,
                port: remote_address_info.port,
                message: msg.toString('utf8')
            };

            function emit_message_to_plugins(emitter, message, remote_address_info) {
                emitter.emit('message', message, remote_address_info);
            }

            emit_message_to_plugins(Logserver.events, content['message'], remote_address_info);

            var end = process.hrtime(start);
            content.execution_time = end[0] + (end[1] / 1000000000);

            if (_.isObject(process_statistics)) {
                update_recent_log_lines_buffer(content);
            }
        });

        server.on("listening", function () {
            var address = server.address();
            logger.log('info', "UDP server listening on " + address.address + ":" + address.port);
        });

        server.bind(opt.admin.udp_server_port, function () {
            if (_.isFunction(callback)) {
                var address = server.address();
                logger.log('debug', "UDP bind ready on " + address.address + ":" + address.port);
                callback(address);
            }
        });
        logger.log('debug', 'Started with pid: ' + process.pid);
    }


    function stop_udp_server (opt, callback) {
        server.close();
        server.unref();
        clear_plugins();
        process_statistics.collection.end();
        if (_.isFunction(callback)) {
            callback();
        }
    }

    function get_events () {
        return Logserver.events;
    }


    function send_udp (msg, ip, port) {
        var dgram  = require('dgram');
        var client = dgram.createSocket("udp4");
        var start = process.hrtime();
        var message = new Buffer(JSON.stringify(msg));
        try {
            client.send(message, 0, message.length, port, ip, function(err, bytes) {
                logger.log('info', 'Sent UDP to ' + ip + ':' + port);
                total++;
                client.close();
            });
        } catch (err) {
            logger.error('Could not send UDP to ' + ip + ':' + port + '. Error: ', err);
        }
        var end = process.hrtime(start);
        var total_time = end[0] + (end[1] / 1000000000);
        logger.log('debug', 'Time used: ' + total_time + 's');
    }


    return {
        reload_process: reload_process,
        reload_module: reload_module,
        start_udp_server: start_udp_server,
        stop_udp_server: stop_udp_server,
        get_events: get_events,
        send_udp: send_udp
    };
};

Logserver.events = new EventEmitter();
module.exports = Logserver;