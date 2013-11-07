var Boilerplate = function (options) {
    var that;
    var version = '1.0.0';
    var logger;
    var name = "boilerplate";
    var regular_expression;

    function regexp() {
        return regular_expression;
    }

    function init(opt){
        if (opt.execute_if_regexp != undefined) {
            regular_expression = new RegExp(opt.execute_if_regexp);
        }
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
        regexp: regexp,
        name: name
    };

    // Call init when module is constructed.
    init(options);

    // Return object to make functions accessible.
    return that;
};

module.exports = Boilerplate;
