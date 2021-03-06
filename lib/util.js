/*
 * https://github.com/schibsted
 *
 * Copyright (c) 2014 Schibsted Payment
 * Licensed under the MIT license.
 */
'use strict';

var Util = function (opt, mock_services) {
    var opts = opt || {};
    mock_services = mock_services || {};

    function process_args() {
        // TODO: Must make this generic.
        return require('optimist')
            .usage('Usage: $0')
            .describe('p', 'Port number to listen to')
            .argv;
    }

    function format_number(number, decimals, decPoint, thousandsSep) {
        decimals = isNaN(decimals) ? 2 : Math.abs(decimals);
        decPoint = (decPoint === undefined) ? '.' : decPoint;
        thousandsSep = (thousandsSep === undefined) ? ',' : thousandsSep;

        var sign = number < 0 ? '-' : '';
        number = Math.abs(+number || 0);

        var intPart = parseInt(number.toFixed(decimals), 10) + '';
        var j = intPart.length > 3 ? intPart.length % 3 : 0;

        return sign + (j ? intPart.substr(0, j) + thousandsSep : '') + intPart.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousandsSep) + (decimals ? decPoint + Math.abs(number - intPart).toFixed(decimals).slice(2) : '');
    }

    function pad(number) {
        var r = String(number);
        if ( r.length === 1 ) {
            r = '0' + r;
        }
        return r;
    }

    function iso_timestamp(date) {
        var now;
        if (date) {
            now = new Date(0); // The 0 there is the key, which sets the date to the epoch
            now.setUTCSeconds(date);
        } else {
            now = new Date();
        }
        var mm = now.getMonth() + 1;
        var dd = now.getDate();
        var yy = now.getFullYear();
        var hh = now.getHours();
        var mi = now.getMinutes();
        var ss = now.getSeconds();
        var ms = now.getMilliseconds();

        return pad(yy) + '-' +
            pad(mm) + '-' +
            pad(dd) + ' ' +
            pad(hh) + ':' +
            pad(mi) + ':' +
            pad(ss);
    }

    function iso_date(date) {
        var now;
        if (date) {
            now = new Date(0); // The 0 there is the key, which sets the date to the epoch
            now.setUTCSeconds(date);
        } else {
            now = new Date();
        }
        var mm = now.getMonth() + 1;
        var dd = now.getDate();
        var yy = now.getFullYear();

        return pad(yy) + '-' +
            pad(mm) + '-' +
            pad(dd);
    }





    return {
        process_args: process_args,
        format_number: format_number,
        iso_timestamp: iso_timestamp,
        iso_date: iso_date
    };
};
module.exports = Util;