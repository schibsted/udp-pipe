var Dumper = function (options) {
    var version = '1.0.0';
    var counter = {};

    function init (opt) {
        //console.log('plugins/dumper.js: init()');
    }

    function end() {
        //console.log('plugins/dumper.js: end()');
    }

    function execute (message, remote_address_info, callback) {
        console.log('plugins/dumper.js:', message);
        callback();
    }

    // Call init when module is constructed.
    init(options);

    return {
        version: version,
        init: init,
        execute: execute,
        end: end,
        name: "dumper"
    };
};


module.exports = Dumper;
