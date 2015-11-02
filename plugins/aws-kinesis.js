var AWS = require('aws-sdk');
var uuid = require('node-uuid');

var aws_kinesis = function (options) {
    var version = '1.0.0';
    var kinesis;
    var internal_queue = [];
    var regular_expression;

    function regexp() {
        return regular_expression;
    }

    function init() {
        if (options.execute_if_regexp != undefined) {
            regular_expression = new RegExp(options.execute_if_regexp);
        }
        if (options.credentials_file) {
            AWS.config.loadFromPath(options.credentials_file);
        }
        AWS.config.update({region: options.region});
        kinesis = new AWS.Kinesis({apiVersion: '2013-12-02'});
    }

    function execute(message, remote_address_info, callback) {
        if(options.batch_size > 1) {
            // too naïve.
            internal_queue.push({
                Data: JSON.stringify(message), // new Buffer('...') || 'STRING_VALUE', /* required */
                PartitionKey: message.spid || uuid.v4(), /* required */
                //Id: uuid.v4(),
                //MessageBody: message
            });

            if(internal_queue.length >= options.batch_size) {
                var params = {
                    Records: internal_queue,
                    StreamName: options.stream_name /* required */
                };
                kinesis.putRecords(params, function aws_kinesis_callback (err, data) {
                    if (err) {
                        console.log(err);
                        callback(err);
                    } else {
                        callback(null, data);
                    }
                });
                internal_queue = [];
            }
        } else {
            var params = {
                Data: JSON.stringify(message), // new Buffer('...') || 'STRING_VALUE', /* required */
                PartitionKey: message.spid || uuid.v4(), // 'STRING_VALUE', /* required */
                StreamName: options.stream_name, /* required */
                //ExplicitHashKey: 'STRING_VALUE',
                //SequenceNumberForOrdering: 'STRING_VALUE'
            };
            kinesis.putRecord(params, function aws_kinesis_callback (err, data) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, data);
                }
            });

        }
    }

    init();

    return {
        version: version,
        init: init,
        execute: execute,
        regexp: regexp,
        name: options.name
    };
};

module.exports = aws_kinesis;