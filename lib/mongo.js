var EventEmitter = require('events').EventEmitter;

var Mongo = function (opt) {
    var that;
    var version = '0.0.1';
    var collections = {};

    var mongodb = require('mongodb');
    //var EventEmitter = require('events').EventEmitter;
    //var events = new new EventEmitter();

    var db = new mongodb.Db(opt.db,
                            new mongodb.Server(opt.server, opt.port, {}),
                            {safe:true});


    function open (table, callback) {
        // Open connection to server.
        db.open(function (err, result) {
            if (err) { throw err; }
            db.authenticate(opt.uname, opt.passwd, function (err, result) {
                if (err) { throw err; }
                // You are now connected and authenticated.
                // Connect to collection.
                db.collection(table, function(err, collection) {
                    if (err) { throw err; }
                    // Connection to connection is successful.
                    collections[table] = collection;
                    callback(false, collection);
                });
            });
        });
    }


    function insert (table, content, callback) {
        if (collections[table] !== undefined) {
            collections[table].insert(content, {safe:true}, function (err, result) {
                if (err) { throw err; }
                that.emit('mongoinsert', result); // Do we need events for this?
                callback(false, result);
            });
        }
    }


    function update () {

    }


    function select () {

    }


    // Export public functions from this Class.
    that = {
        version : version,
        db : db,
        open : open,
        insert : insert

    };
    // Inherit public functions from other class.
    that.__proto__ = EventEmitter.prototype;
    // Return object to make functions accessible.
    return that;
};

module.exports = Mongo;

