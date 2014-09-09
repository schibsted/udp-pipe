var AWS = require('aws-sdk');
var uuid = require('node-uuid');

var aws_sqs = function (options) {
    var version = '1.0.0';
    var sqs;
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
        AWS.config.update({region: 'eu-west-1'});
        sqs = new AWS.SQS({apiVersion: '2012-11-05'});
    }

    function execute(message, remote_address_info, callback) {
        if(options.batch_size > 1) {
            // too naïve.
            internal_queue.push({
                Id: uuid.v4(),
                MessageBody: message
            });

            if(internal_queue.length >= options.batch_size) {
                sqs.sendMessageBatch({
                    QueueUrl: options.queue_url,
                    Entries: internal_queue
                }, function(err, data) {
                    if(err) console.log("Error: " + err.stack);
                    else callback();
                });
                internal_queue = [];
            }
        } else {
            sqs.sendMessage({
                QueueUrl: options.queue_url,
                MessageBody: JSON.stringify(message)
            }, function aws_sqs_callback(err, data) {
                if(err) console.log("Error: " + err);
                else callback();
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

module.exports = aws_sqs;