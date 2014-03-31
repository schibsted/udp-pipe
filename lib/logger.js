/*
 * UDPlogger
 * https://github.com/schibsted/UDPlogger
 *
 * Copyright (c) 2014 Øistein Sørensen
 * Licensed under the MIT license.
 */

'use strict';
var Class = require('class.extend');
var winston = require('winston');

module.exports = Class.extend({
    init: function (opts) {
        this.opts = opts;
        this.logger = new (winston.Logger)({
            transports: [
                new (winston.transports.File)({
                    filename: this.opts.path + this.opts.file,
                    json: true
                })
            ]
        });
    },

    log: function(message) {
        this.logger.info(JSON.stringify(message));
    },


    trace: function(message) {
        this.logger.info(JSON.stringify(message));
    },

    close: function() {
        this.logger.close();
    }

//{
//    name: opt.name,
//        streams: [{
//    type: 'file',
//    path: opt.path + opt.file,
//    level: opt.level,
//    closeOnExit: true
//}],
//    serializers: Logger.stdSerializers
//}

});
