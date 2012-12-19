var nodeunit = require('nodeunit');
var events = require('events');
var foo = require('../lib/foo');


exports['calculate'] = function (test) {
    test.equal(foo.calculate(2), 4);
    test.equal(foo.calculate(5), 10);
    test.throws(function () { foo.calculate(); });
    test.throws(function () { foo.calculate(null); });
    test.throws(function () { foo.calculate(true); });
    test.throws(function () { foo.calculate([]); });
    test.throws(function () { foo.calculate({}); });
    test.throws(function () { foo.calculate('asdf'); });
    test.throws(function () { foo.calculate('123'); });
    test.done();
};

exports.group = {
    test2: function (test) {
        //...
    test.ok(true);
    test.done();
    },
    test3: function (test) {
        //...
    test.ok(true);
    test.done();
    }
};

// // exports['read a number'] = function (test) {
// //     var ev = new events.EventEmitter();
// //     process.openStdin = function () { return ev; };
// //     process.exit = test.done;
// //     console.log = function (str) {
// //         test.equal(str, 'doubled: 24');
// //     };
// //     foo.read();
// //     ev.emit('data', '12');
// // };
// //
// // exports['test Read'] = function(test) {
// //     var ev = new events.EventEmitter()
// //     process.openStdin = function () { return ev; };
// //     foo.read(function () {
// //   test.ok(true);
// //   test.done();
// //     });
// //     ev.emit('data', 8);
// // };


//exports.read = nodeunit.testCase({
//    setUp: function () {
//        this._openStdin = process.openStdin;
//        this._log = console.log;
//        this._calculate = foo.calculate;
//        this._exit = process.exit;
//        var ev = this.ev = new events.EventEmitter();
//        process.openStdin = function () { return ev; };
//  //console.log('setup');
//    },
//    tearDown: function () {
//        // reset all the overidden functions:
//        process.openStdin = this._openStdin;
//        process.exit = this._exit;
//        foo.calculate = this._calculate;
//        console.log = this._log;
//    },
//
//    'a value other than a number': function (test) {
//        test.expect(1);
//
//        process.exit = test.done;
//        foo.calculate = function () {
//            throw new Error('Expected a number');
//        };
//        console.log = function (str) {
//            test.equal(str, 'Error: Expected a number');
//        };
//        foo.read();
//        this.ev.emit('data', 'asdf');
//    },
//
//    'a number': function (test) {
//        test.expect(1);
//        process.exit = test.done;
//        console.log = function (str) {
//            test.equal(str, 'foo: 24');
//        };
//        foo.read();
//        this.ev.emit('data', '12');
//  test.done();
//    }
//
//});

