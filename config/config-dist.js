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
            enabled : false,
            name  : 'logserver_boilerplate',
            path  : '/tmp/',
            file  : 'logserver_boilerplate.log',
            level : 'trace'
        },

        'file_logger.js' : {
            enabled : true,
            name  : 'logserver',
            path  : '/tmp/',
            file  : 'logserver.log',
            level : 'trace'
        }

    }
};

