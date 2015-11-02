module.exports = {
    log : {
        name    : 'logserver',
        path    : '/tmp/',
        file    : 'logserver.log',
        level   : 'info', // debug|info|notice|warning|error|crit|alert|emerg
        console : true
    },
    admin : {
        udp_server_port    : 9990,
        http_server_port   : 9998,
        http_server_port_2 : 9997,
        web_socket_port    : 9999
    },
    plugins : {
        'boilerplate.js' : {
            disabled : true,
            execute_if_regexp : '.',
            name  : 'logserver_boilerplate',
            path  : '/tmp/',
            file  : 'logserver_boilerplate.log',
            level : 'trace'
        },

        'file_logger.js' : {
            disabled : true,
            execute_if_regexp : '"api_method":',
            name  : 'logserver',
            path  : '/tmp/',
            file  : 'logserver.log',
            level : 'trace'
        },

        'dumper.js': {
            disabled: false,
            execute_if_regexp : '.',
            name: 'Dumper',
            //path: '/tmp/',
            //file: 'logserver_dumper.log',
            level: 'trace'
        },

        'aws-sqs.js': {
            disabled: true,
            execute_if_regexp : '"mixpanel":.+\\\\"(properties)\\\\"',
            proxy: '',
            name: 'AWS_SQS',
            region: 'eu-west-1',
            credentials_file: '/tmp/aws_credentials.json',
            queue_url: 'https://i-am-not-the-queue-you-are-looking-for.com',
            batch_size: 10
        },

        'aws-kinesis.js': {
            disabled: true,
            execute_if_regexp : '"mixpanel":.+\\\\"(properties)\\\\"',
            name: 'AWS_Kinesis',
            region: 'eu-west-1',
            credentials_file: '/tmp/aws_credentials.json',
            stream_name: 'i-am-not-the-stream-you-are-looking-for',
            batch_size: 10
        },

        'mixpanel.js' : {
            disabled : true,
            execute_if_regexp : '"mixpanel":.+\\\\"(.append|.set|properties)\\\\"',
            name  : 'mixpanel',
            debug_token : 'Your Mixpanel token for a debug project'
        },

        'mixpanel_file_logger.js' : {
            disabled : false,
            execute_if_regexp : '"mixpanel":.+\\\\"(.append|.set|properties)\\\\"',
            name  : 'logserver',
            path  : '/tmp/',
            file  : 'mixpanel_logserver.log',
            level : 'trace'
        }

    }
};

