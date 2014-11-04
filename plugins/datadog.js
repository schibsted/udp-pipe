var Datadog = function (options) {
    var that;
    var version = '1.0.0';
    var logger;
    var name = "datadog";
    var dogapi = require('dogapi');
    var dd = new dogapi({
        api_key: options.api_key,
        app_key: options.app_key,
        api_version: options.api_version,
        api_host: options.api_host
    });
    var regular_expression;
    var series = [];
    var batch_size = options.batch_size || 10;
    var counter = 0;

    console.log(options);

    function regexp() {
        return regular_expression;
    }

    function init(opt){
        if (opt.execute_if_regexp != undefined) {
            regular_expression = new RegExp(opt.execute_if_regexp);
        }
    }

    function execute(message, remote_address_info, callback) {
        var message_json = JSON.parse(JSON.parse(message));
        if (message_json.datadog) {
            var now = parseInt(new Date() / 1000, 10);
            for (var key in message_json.timers) {
                var total = message_json.timers[key].total * 1000;
                var parsed_key = key.replace(/[^a-z0-9]+/gi, '.');
                var metric = {
                    metric: options.name + '.' + message_json.prefix + '.' + parsed_key,
                    points: [
                        [now, total]
                    ],
                    host: 'localhost',
                    type: 'gauge'
                };
                series.push(metric);
            }
            counter++;
            if (counter > batch_size) {
                dd.add_metrics({ series: series }, function (result, result2) {
                    callback();
                });
                counter = 0;
                series = [];
            }
        }
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

module.exports = Datadog;
