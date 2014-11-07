module.exports = {
    log : {
        name  : 'logserver',
        path  : '/tmp/',
        file  : 'logserver.log',
        level : 'trace'
    },
    admin : {
        udp_server_port    : 19990,
        http_server_port   : 19998,
        http_server_port_2 : 19997,
        web_socket_port    : 19999
    },
    plugin_path: '/../plugins/',
    plugins : {

        'dumper.js': {
            disabled: false,
            execute_if_regexp : '.',
            name: 'Dumper',
            //path: '/tmp/',
            //file: 'logserver_dumper.log',
            //level: 'trace'
        }

    }
};

