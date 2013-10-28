// Version
var version = '1.1';
console.log("\n\n"
    + 'SPiD UDP LogServer ' + version
    + "\n"
    + '============================='
    + "");

var colors = require('colors');
var util = require('./lib/util.js');
console.log('lib/util.js version : ' + util.version.yellow);

// TODO: Merge config file and opt with config file as primary OR should we do this only for the master process?
var argv = util.process_args();
// TODO: Merge argv and opt with arg as primary

var opt = require(argv.c || './config/config.js');

var Logserver = require('./lib/logserver.js');
var logserver = new Logserver();
var stats_server = require('./lib/stats_server.js');

console.log('lib/logserver.js version : ' + logserver.version.yellow);

process.on('SIGHUP', function () {
    util.clog('Got SIGHUP signal.'.red);
    util.clog('Recycling log handles.'.red);
    logserver.reload_process(opt);
});

var stats = stats_server.create_process_stats();
stats_server.start(opt, __dirname, stats);
logserver.start_udp_server(opt, stats);
