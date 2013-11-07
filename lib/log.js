var winston = require('winston');

module.exports = function(options) {
    var custom_winston_logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({ json: false, timestamp: true })
        ],/*
        exceptionHandlers: [
            new (winston.transports.Console)({ json: false, timestamp: true })
        ],*/
        exitOnError: false
    });

    var log = function(level, msg) {

        if(msg instanceof Error && msg.stack) {
            custom_winston_logger.log(level, msg.stack);
        } else {
            custom_winston_logger.log(level, msg);
        }
    };

    return {
        debug: function(msg) {
            log('info', msg); // should be debug
        },
        error: function(msg) {
            log('error', msg);
        },
        info: function(msg) {
            log('info', msg);
        }
    }
};