var Filelogger = function (options) {
    var that;
    var version = '1.0.0';
    var logger;
    var regular_expression;
    var util = require('../lib/util');
    var Logger = require('../lib/logger');

    function regexp() {
        return regular_expression;
    }

    function init(opt) {
        if (opt.execute_if_regexp != undefined) {
            regular_expression = new RegExp(opt.execute_if_regexp);
        }
        logger = new Logger(opt);
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
        name: "file_logger"
    };

    // Call init when module is constructed.
    init(options);

    // Return object to make functions accessible.
    return that;
};

module.exports = Filelogger;
