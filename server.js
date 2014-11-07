/*
 * https://github.com/schibsted
 *
 * Copyright (c) 2014 Schibsted Payment
 * Licensed under the MIT license.
 */
'use strict';

var colors       = require('colors'),
    app_path      = __dirname + '/',
    logger       = require(app_path + 'lib/logger')(),
    util         = require(app_path + 'lib/util.js')({ logger: logger }),
    logserver    = require(app_path + 'lib/logserver.js')({ logger: logger }),
    stats_server = require(app_path + 'lib/stats-server.js')({ logger: logger });

// TODO: Merge config file and opt with config file as primary OR should we do this only for the master process?
var argv = util.process_args();
// TODO: Merge argv and opt with arg as primary
var config_file = argv.c || __dirname + '/config/config.js';
var opt = require(config_file);

logger.log('SPiD UDP LogServer ' + util.iso_timestamp());

process.on('SIGHUP', function () {
    logger.log(util.iso_timestamp() + ':');
    logger.log('Got SIGHUP signal.'.red);
    logger.log('Recycling log file.'.red);
    opt = logserver.reload_module(config_file);
    logger.log('Reloading plugins.'.red);
    logserver.reload_process(opt);
});

var stats = stats_server.create_process_stats();
stats_server.start(opt, app_path, stats, function () {
    logserver.start_udp_server(opt, stats, function (address) {
        logger.log('Up and listening for UDP on: ' + address.address + ':' + address.port);
    });
});


