// Version
var version = '1.1';
console.log("\n\n"
    + 'SPiD UDP LogServer ' + version
    + "\n"
    + '============================='
    + "");

// Modules.
var colors = require('colors');

var Util = require('./lib/util.js');
var util = new Util();
console.log('lib/util.js version : ' + util.version.yellow);

// TODO: Merge config file and opt with config file as primary OR should we do this only for the master process?
var argv = util.process_args();
// TODO: Merge argv and opt with arg as primary

// Options for the server.
var opt = require(argv.c || './config/config.js');

var Logserver = require('./lib/logserver.js');
var logserver = new Logserver();
console.log('lib/logserver.js version : ' + logserver.version.yellow);

// Default behavior
process.on('SIGHUP', function () {
    util.clog('Got SIGHUP signal.'.red);
    util.clog('Recycling log handles.'.red);
    logserver.reload_process(opt);
});


// Create process stats logging.
logserver.process_stats(opt);

// Web socket client webpage.
logserver.web_server(opt, __dirname);

// Web socket server.
logserver.web_socket_server(opt);

// Launch server instance.
logserver.udp_server(opt);
