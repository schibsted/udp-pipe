module.exports = {
    log : {
        name  : 'logserver',
        path  : '/tmp/',
        file  : 'logserver.log',
        level : 'trace'
    },
    admin : {
        udp_server_port    : 8080,
        http_server_port   : 9998,
        http_server_port_2 : 9997,
        web_socket_port    : 9999
    },
    plugins : {
        'boilerplate.js' : {
            disabled : true,
            name  : 'logserver_boilerplate',
            path  : '/tmp/',
            file  : 'logserver_boilerplate.log',
            level : 'trace'
        },

        'file_logger.js' : {
            disabled : true,
            name  : 'logserver',
            path  : '/tmp/',
            file  : 'logserver.log',
            level : 'trace'
        },

        'dumper.js': {
            name: 'Dumper',
            path: '/tmp/',
            file: 'logserver_dumper.log',
            level: 'trace',
            disabled: true
        },

        'aws-sqs.js': {
            disabled: true,
            name: 'AWS SQS',
            credentials_file: '/tmp/aws_credentials.json',
            queue_url: 'https://i-am-not-the-queue-you-are-looking-for.com',
            batch_size: 10
        }
    }
};

