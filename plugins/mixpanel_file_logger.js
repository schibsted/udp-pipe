var Mixpanel_file_logger = function (options) {
    var that;
    var version = '1.0.0';
    var logger;
    var regular_expression;
    var util = require('../lib/util');

    function regexp() {
        return regular_expression;
    }

    function init(opt) {
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

    function execute(message, remote_address_info, callback) {
        var start = process.hrtime();
        var content = {
            timestamp : util.iso_date(),
            from      : remote_address_info.address,
            port      : remote_address_info.port
        };
        try {
            var message_data   = JSON.parse(message);
            message_data['event']['mixpanel'] = JSON.parse(message_data['event']['mixpanel']);
            content['message'] = message_data;
        } catch (err) {
            var message_data   = message.toString('utf8');
            content['message'] = message_data;
        }
        var end            = process.hrtime(start);
        var total_time     = end[0] + (end[1] / 1000000000);
        content.total_time = total_time;

        logger.trace(content);
        callback();
    }

    // Export functions and vars
    that = {
        version: version,
        init: init,
        execute: execute,
        regexp: regexp,
        name: "mixpanel_file_logger"
    };

    // Call init when module is constructed.
    init(options);

    // Return object to make functions accessible.
    return that;
};

module.exports = Mixpanel_file_logger;
