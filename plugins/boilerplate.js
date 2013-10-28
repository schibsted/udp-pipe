var Boilerplate = function (options) {
    var that;
    var version = '1.0.0';
    var logger;
    var name = "boilerplate";

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

    function execute(message, callback) {
        if (message.text != undefined) {
            if (message.text.match(/norway/gi)) {
                console.log('boilerplate.js : '
                    + JSON.stringify(message.text)
                );
            }
        }
        callback();
    }

    // Export functions and vars
    that = {
        version: version,
        init: init,
        execute: execute,
        name: name
    };

    // Call init when module is constructed.
    init(options);

    // Return object to make functions accessible.
    return that;
};

module.exports = Boilerplate;
