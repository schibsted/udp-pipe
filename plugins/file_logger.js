var Filelogger = function () {
    var that;
    var version = '1.0.0';
    var counter = {};
    var logger;


    function init(opt){
        var Logger = require('bunyan');
        // Setup file streams for logging.
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
        var json = message;
        var uname = json.user.screen_name;
        if (counter[uname] === undefined) {
            counter[uname] = 1;
        } else {
            counter[uname]++;
        }
        logger.trace(json);
    }

    // Export functions and vars
    that = {
        version: version,
        init: init,
        execute: execute
    };

    // Return object to make functions accessible.
    return that;
};

module.exports = Filelogger;
