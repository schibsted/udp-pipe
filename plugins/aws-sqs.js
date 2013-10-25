var AWS = require('aws-sdk');
var uuid = require('node-uuid');

var aws_sqs = function (options) {
    var version = '1.0.0';
    var sqs;
    var name = "aws-sqs";
    var internal_queue = [];

    function init(){
        AWS.config.loadFromPath(options.credentials_file);
        sqs = new AWS.SQS({apiVersion: '2012-11-05'});
    }

    function execute(message, callback) {
        if(options.batch_size > 1) {
            // too naïve.
            internal_queue.push({
                Id: uuid.v4(),
                MessageBody: message
            });

            if(internal_queue.length > 9) {
                sqs.sendMessageBatch({
                    QueueUrl: options.queue_url,
                    Entries: internal_queue
                }, function(err, data) {
                    callback();
                });
                internal_queue = [];
            }
        } else {
            sqs.sendMessage({
                QueueUrl: options.queue_url,
                MessageBody: JSON.stringify(message)
            }, function aws_sqs_callback(err, data) {
                callback();
            });
        }
    }

    init();

    return {
        version: version,
        init: init,
        execute: execute,
        name: name
    };
};

module.exports = aws_sqs;



