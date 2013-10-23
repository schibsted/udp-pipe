var Plugin = function () {
    var that;
    var version = '0.0.1';
    var counter = {};

    function format(message) {
        var msg = message;
        // Format string...
        //
        return msg;
    }

    function local_event(udp_server, message) {
        // Attach to events
        udp_server.on('message', function (message) {
            var json = JSON.parse(message);
            var uname = json.user.screen_name;
            if (counter[uname] === undefined) {
                counter[uname] = 1;
            } else {
                counter[uname]++;
            }
            if (json.text.match(/tour de france/gi)) {
                console.log('test.js : '
                    + uname + ': '
                    + JSON.stringify(json.text)
                    + ' (' + counter[uname] + ')'
                );
            }
        });
    }

    // Export functions and vars
    that = {
        version: version,
        format: format,
        local_event: local_event
    };

    // Return object to make functions accessible.
    return that;
};

module.exports = Plugin;
