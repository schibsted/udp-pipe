var colors = require('colors');
var util = require('./lib/util.js');

// TODO: Merge config file and opt with config file as primary OR should we do this only for the master process?
var argv = util.process_args();
// TODO: Merge argv and opt with arg as primary
var config_file = argv.c || __dirname + '/config/config.js';
var opt = require(config_file);

console.log("\n\n" +
    'SPiD UDP LogServer ' +
    "\n" +
    '=============================' +
    "");

var Logserver = require('./lib/logserver.js');
var logserver = new Logserver();
var stats_server = require('./lib/stats_server.js');

process.on('SIGHUP', function () {
    console.log(util.iso_date() + ':');
    console.log('Got SIGHUP signal.'.red);
    console.log('Recycling log file.'.red);
    opt = logserver.reload_module(config_file);
    console.log('Reloading plugins.'.red);
    logserver.reload_process(opt);
});

var stats = stats_server.create_process_stats();
stats_server.start(opt, __dirname, stats);
logserver.start_udp_server(opt, stats);
