var Datadog = function (options, mock_services) {
    var opts = options || {};
    mock_services = mock_services || {};

    var version = '1.0.0';
    var name = "datadog";
    var regular_expression;

    var dogapi = mock_services.dogapi || require('dogapi');
    var dd = mock_services.dd || new dogapi({
        api_key: opts.api_key,
        app_key: opts.app_key,
        api_version: opts.api_version,
        api_host: opts.api_host
    });
    var series = [];
    var batch_size = opts.batch_size || 10;
    var counter = 0;

    function regexp() {
        console.log('plugins/datadog.js: regexp()', regular_expression);
        return regular_expression;
    }

    function init(opt){
        console.log('plugins/datadog.js: opts:', opt);
        if (opt.execute_if_regexp != undefined) {
            regular_expression = new RegExp(opt.execute_if_regexp);
        }
    }

    function end () {
        //console.log('plugins/boilerplate.js: end()');
    }

    function execute(message, remote_address_info, callback) {
        var message_json = JSON.parse(JSON.parse(message));
        if (message_json.datadog) {
            var now = parseInt(new Date() / 1000, 10);
            for (var key in message_json.timers) {
                var total = message_json.timers[key].total * 1000;
                var parsed_key = key.replace(/[^a-z0-9]+/gi, '.');
                var metric = {
                    metric: opts.name + '.' + message_json.prefix + '.' + parsed_key,
                    points: [
                        [now, total]
                    ],
                    host: message_json.host || 'localhost',
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
            } else {
                callback();
            }
        } else {
            callback();
        }
    }

    // Call init when module is constructed.
    init(opts);

    // Export functions and vars
    return {
        version: version,
        init: init,
        regexp: regexp,
        execute: execute,
        end: end,
        name: name
    };

};

module.exports = Datadog;
