/*
 * https://github.com/5orenso
 *
 * Copyright (c) 2014 Øistein Sørensen
 * Licensed under the MIT license.
 */
'use strict';
var when     = require('when'),
    winston  = require('winston'),
    syslog   = require('winston-syslog').Syslog,
    _        = require('underscore'),
    app_path = __dirname + '/../',
    date     = require('./date')(),
    hostname = require('os').hostname();

//winston.add(winston.transports.Syslog, {
//    facility: 'UDPlogger',
//    app_name: 'UDPlogger',
//    localhost: hostname
//});
//winston.setLevels(winston.config.syslog.levels);

    //host: '127.0.0.1', // The host running syslogd, defaults to localhost.
    //port: 514,         // The port on the host that syslog is running on, defaults to syslogd's default port.
    //protocol: 'udp4',  // The network protocol to log over (e.g. tcp4, udp4, etc).
    // pid: PID of the process that log messages are coming from (Default process.pid).
    // facility: Syslog facility to use (Default: local0).
    // localhost: Host to indicate that log messages are coming from (Default: localhost).
    // type: The type of the syslog protocol to use (Default: BSD).
    // app_name: The name of the application (Default: process.title).

var logger = null; // cached

var Logger = function (opt, mock_services) {
    var opts = opt || {};
    mock_services = mock_services || {};

    if (mock_services.logger) {
        logger = mock_services.logger;
    } else if (!logger) {
        logger = new (winston.Logger)({
            transports: [
                // level: debug, info, notice, warning, error, crit, alert, emerg
                //new (winston.transports.SyslogAin2)({}),
                new (winston.transports.Syslog)({
                    level: 'error',
                    facility: 'UDPlogger',
                    app_name: 'UDPlogger',
                    localhost: hostname
                }),
                // error and all other levels above is logged to the console.
                new (winston.transports.Console)({ level: 'info' }),
                // new (winston.transports.File)({ filename: 'somefile.log' })
                // TODO: Setup standard weblogging using files or services.
                // TODO: Add more transporters. See https://github.com/flatiron/winston
            ]
        });
        logger.setLevels(winston.config.syslog.levels);
    }

    return {
        log: function () {
            var level = 'info';
            if (arguments[0].match(/^(debug|info|notice|warning|error|crit|alert|emerg)$/)) {
                level = arguments[0];
                delete arguments[0];
            }
            var msg = [];
            var meta = null;
            for (var i = 0, l = arguments.length; i < l; i++) {
                if (_.isString(arguments[i]) || _.isNumber(arguments[i])) {
                    msg.push(arguments[i]);
                } else if (_.isObject(arguments[i]) && !meta) {
                    meta = arguments[i];
                } else if (_.isObject(arguments[i])) {
                    msg.push(JSON.stringify(arguments[i]));
                }
            }
            return when.promise( function (resolve, reject) {
                //console.log(level, date.iso_date() + ' [' + (opts.workerId || '') + ']' + ': ' + msg.join(' -> '), meta);
                resolve(logger.log(level, date.iso_date() + ' [' + (opts.workerId || '') + ']' + ': ' + msg.join(' -> '), meta));
            });
        },

        err: function (message) {
            var msg = [];
            var meta = null;
            for (var i = 0, l = arguments.length; i < l; i++) {
                if (_.isString(arguments[i]) || _.isNumber(arguments[i])) {
                    msg.push(arguments[i]);
                } else if (_.isObject(arguments[i]) && !meta) {
                    meta = arguments[i];
                } else if (_.isObject(arguments[i])) {
                    msg.push(JSON.stringify(arguments[i]));
                }
            }
            return when.promise( function (resolve, reject) {
                resolve(logger.log('error', date.iso_date() + ' [' + (opts.workerId || '') + ']' + ': ' + msg.join(' -> '), meta));
                // TODO: Should handle errors.
            });
        },

        set: function (key, value) {
            opts[key] = value;
            return true;
        },

        get: function (key) {
            return opts[key];
        }
    };
};
module.exports = Logger;
