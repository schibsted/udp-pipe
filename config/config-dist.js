module.exports = {
    log : {
        name  : 'logserver',
        path  : '/tmp/',
        file  : 'logserver.log',
        level : 'trace'
    },
    mongo : {
        connect    : false,
        server     : 'mongo.example.com',
        port       : 10030,
        db         : 'database',
        uname      : 'my username',
        passwd     : 'my password',
        collection : 'test'
    },
    admin : {
        udp_server_port    : 8080,
        http_server_port   : 9998,
        http_server_port_2 : 9997,
        web_socket_port    : 9999
    },
    foobar : 1
};

