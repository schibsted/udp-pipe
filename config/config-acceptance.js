module.exports = {
    log : {
        name  : 'logserver',
        path  : '/tmp/',
        file  : 'logserver.log',
        level : 'debug'
    },
    admin : {
        udp_server_port    : 8080,
        http_server_port   : 9998,
        http_server_port_2 : 9997,
        web_socket_port    : 9999
    },
    plugins : {
        'dumper.js': {
            name: 'Dumper',
            path: '/tmp/',
            file: 'logserver_dumper.log',
            level: 'trace',
            disabled: false
        }
    }
};

