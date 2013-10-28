var Util = function () {
    var version = '0.0.1';

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

    function iso_date(date) {
        var now = date ? date : new Date();
        return now.toISOString()
            .replace(/T/, ' ')
            .replace(/\..+/, '');
    }

    return {
        version: version,
        process_args: process_args,
        format_number: format_number,
        iso_date: iso_date
    };
};

module.exports = new Util();