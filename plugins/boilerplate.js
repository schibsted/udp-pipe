var Boilerplate = function (options, mock_services) {
    var opts = options || {};
    mock_services = mock_services || {};

    var version = '1.0.0';
    var name = "boilerplate";
    var regular_expression;

    function regexp () {
        console.log('plugins/boilerplate.js: regexp()', regular_expression);
        return regular_expression;
    }

    function init (opt){
        console.log('plugins/boilerplate.js: opts:', opt);
        //console.log('plugins/boilerplate.js: init()');
        if (opt.execute_if_regexp != undefined) {
            regular_expression = new RegExp(opt.execute_if_regexp);
        }
    }

    function end () {
        //console.log('plugins/boilerplate.js: end()');
    }

    function execute (message, remote_address_info, callback) {
        var message_json = JSON.parse(JSON.parse(message));
        if (message_json.text != undefined) {
            if (message_json.text.match(/norway/gi)) {
                console.log('plugins/boilerplate.js : ', message_json.text);
            }
        }
        callback();
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

module.exports = Boilerplate;
