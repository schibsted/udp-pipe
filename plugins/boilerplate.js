var Boilerplate = function (options) {
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
        if (json.text.match(/norway/gi)) {
            console.log('test.js : '
                + uname + ': '
                + JSON.stringify(json.text)
                + ' (' + counter[uname] + ')'
            );
        }
    }

    // Export functions and vars
    that = {
        version: version,
        init: init,
        execute: execute
    };

    // Call init when module is constructed.
    init(options);

    // Return object to make functions accessible.
    return that;
};

module.exports = Boilerplate;
