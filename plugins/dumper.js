var Dumper = function (options, mock_services) {
    var opts = options || {};
    mock_services = mock_services || {};

    var version = '1.0.0';
    var counter = {};
    var name = "boilerplate";
    var regular_expression;


    function regexp () {
        console.log('plugins/dumper.js: regexp()', regular_expression);
        return regular_expression;
    }

    function init (opt) {
        console.log('plugins/dumper.js: opts:', opt);
        if (opt.execute_if_regexp != undefined) {
            regular_expression = new RegExp(opt.execute_if_regexp);
        }
        console.log('plugins/dumper.js: init()');
    }

    function end () {
        console.log('plugins/dumper.js: end()');
    }

    function execute (message, remote_address_info, callback) {
        var message_json = JSON.parse(JSON.parse(message));
        console.log('plugins/dumper.js:', message_json);
        callback();
    }

    // Call init when module is constructed.
    init(opts);

    return {
        version: version,
        init: init,
        execute: execute,
        end: end,
        regexp: regexp,
        name: "dumper"
    };
};


module.exports = Dumper;
