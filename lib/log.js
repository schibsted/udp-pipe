module.exports = function(options) {
    return {
        debug: function(msg) {
            if(options.level == "trace" || options.level == "debug") console.log(msg);
        },
        error: function(msg) {
            console.log(msg);
        },
        info: function(msg) {
            if(options.level == "info" || options.level == "error") console.log(msg);
        }
    }
};