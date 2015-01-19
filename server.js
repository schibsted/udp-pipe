/*
 * https://github.com/schibsted
 *
 * Copyright (c) 2014 Schibsted Payment
 * Licensed under the MIT license.
 */
'use strict';

var app_path      = __dirname + '/',
    util          = require(app_path + 'lib/util.js')(),
    argv          = util.process_args(),
    config_file   = argv.c || __dirname + '/config/config.js',
    opt           = require(config_file),
    logger        = require(app_path + 'lib/logger')(opt),
    logserver     = require(app_path + 'lib/logserver.js')({ logger: logger }),
    stats_server  = require(app_path + 'lib/stats-server.js')({ logger: logger });

logger.log('SPiD UDP LogServer ' + util.iso_timestamp());

process.on('SIGHUP', function () {
    logger.log(util.iso_timestamp() + ':');
    logger.log('info', 'Got SIGHUP signal.');
    logger.log('info', 'Recycling log file.');
    opt = logserver.reload_module(config_file);
    logger.log('info', 'Reloading plugins.');
    logserver.reload_process(opt);
});

var stats = stats_server.create_process_stats();
stats_server.start(opt, app_path, stats, function () {
    logserver.start_udp_server(opt, stats, function (address) {
        logger.log('info', 'Up and listening for UDP on: ' + address.address + ':' + address.port);
    });
});


