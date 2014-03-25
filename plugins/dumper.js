var Dumper = function (options) {
    var version = '1.0.0';
    var counter = {};
    var logger;
    var Logger = require('../lib/logger');

    function init(opt){
        logger = new Logger(opt);
    }

    function execute(message, remote_address_info, callback) {
        logger.trace(message);
        callback();
    }

    // Call init when module is constructed.
    init(options);

    return {
        version: version,
        init: init,
        execute: execute,
        name: "dumper"
    };
};

module.exports = Dumper;
