var AWS = require('aws-sdk');

var aws_sqs = function (options) {
    var version = '1.0.0';
    var sqs;
    var options;

    function init(){
        AWS.config.loadFromPath(options.credentials_file);
        sqs = new AWS.SQS({apiVersion: '2012-11-05'});
    }

    function execute(message) {
        var start = process.hrtime();
        console.log("Start time: " + start);
        sqs.sendMessage({
            QueueUrl: options.queue_url,
            MessageBody: JSON.stringify(message)
        }, function aws_sqs_callback(err, data) {
            console.log("err: ", err, "data: ", data);
            var end = process.hrtime(start);
            console.log("End time: " + end);
            var total_time = end[0] + (end[1] / 1000000000);

            console.log("total time=" + total_time);
        });
    }

    init();

    return {
        version: version,
        init: init,
        execute: execute
    };
};

module.exports = aws_sqs;



