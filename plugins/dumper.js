var Dumper = function (options) {
    var version = '1.0.0';
    var counter = {};
    var logger;

    function init(opt){
        var Logger = require('bunyan');
        logger = new Logger({
            name: opt.name,
            streams: [{
                stream: process.stdout,
                level: 'debug'
            }, {
                path: opt.path + opt.file,
                level: opt.level
            }],
            serializers: Logger.stdSerializers
        });
    }

    function execute(message) {
        logger.trace(message);
    }

    // Call init when module is constructed.
    init(options);

    return {
        version: version,
        init: init,
        execute: execute
    };
};

module.exports = Dumper;
