var nodeunit = require('nodeunit');
var events = require('events');
var UtilClass = require('../lib/util');
var util = new UtilClass();


exports.group = {
    'clog' : function (test) {
        test.expect(2);
        test.ok(function () { util.clog() }, 'without input');
        test.ok(function () { util.clog('With some text data...') }, 'with input data');
        test.done();
    },
    'process_args from input' : function (test) {
        test.expect(1);
        test.doesNotThrow(function () { util.process_args() });
        test.done();
    },
    'format_number' : function (test) {
        test.expect(5);
        test.strictEqual(util.format_number(1234.1234),              '1,234.12');
        test.strictEqual(util.format_number(1234.1234, 1),           '1,234.1');
        test.strictEqual(util.format_number(1234.1234, 1, ','),      '1,234,1');
        test.strictEqual(util.format_number(1234.1234, 3, ',', '.'), '1.234,123');
        test.strictEqual(util.format_number(undefined, 3, ',', '.'), '0,000');
        test.done();
    },




    'foo' : function (test) {
        //test.throws(function () { util.calculate(); });
        //test.throws(function () { util.calculate(null); });
        //test.throws(function () { util.calculate(true); });
        //test.throws(function () { util.calculate([]); });
        //test.throws(function () { util.calculate({}); });
        //test.throws(function () { util.calculate('asdf'); });
        //test.throws(function () { util.calculate('123'); });
        test.done();
    }

};