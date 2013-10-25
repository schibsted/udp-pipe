var AWS = require('aws-sdk');

var aws_sqs = function (options) {
    var version = '1.0.0';
    var sqs;
    var name = "aws-sqs";

    function init(){
        AWS.config.loadFromPath(options.credentials_file);
        sqs = new AWS.SQS({apiVersion: '2012-11-05'});
    }

    function execute(message, callback) {
        sqs.sendMessage({
            QueueUrl: options.queue_url,
            MessageBody: JSON.stringify(message)
        }, function aws_sqs_callback(err, data) {
            callback();
        });
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



