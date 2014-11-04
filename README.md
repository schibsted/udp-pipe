UDPlogger
=========

__What is this?__

UDP logserver. Purpose is to collect excessive logging and have plugins take action on the
incoming messages.

Standard plugins are:

- boilerplate.js : Boilerplate for all new plugins.
- dumper.js : Save message to file in JSON format.
- file_logger.js : Save messages to file in JSON format. This is used for logging and importing into Splunk.
- aws-sqs.js : Send incoming messages to Amazon SQS.
- mixpanel.js : Send incoming messages to Mixpanel as events.


__Why this?__

An UDP logger removes the latency from connecting to a server or writing to a filehandle.
Perfect for high traffic websites who wants to monitor events, API endpoints or other
actions.

__How does this work?__

You create an UDP package inside you code and send it to the server without waiting for a reply.
This means no latency at all inside your code.  


## Content

* [Local instance](#localinstance)
* [Server instance](#serverinstance)
* [Watch webinterface](#watchwebinterface)
* [Tail logs](#taillogs)
* [Run PHP client for testing](#runphpclientfortesting)
* [Run Node.js client for testing](#runnodejsclientfortesting)
* [Edit config file](#editconfigfile)
* [Make your own plugins](#makeyourownplugins)
* [Deployment howto](#deploymenthowto)
* [Todo](#todo)
* [Authors](#authors)


### Local instance

- Install Node.js: http://nodejs.org/download/
- Get code base via svn.
- Install Node.js
- Install dependencies.
- Run with Grunt.

Run cmd:

    sudo npm install -g grunt-cli
    cd ~/<your project folder>/
    git clone git@github.com:schibsted/UDPlogger.git
    cd UDPlogger
    npm install
    cp ./config/config-dist.js ./config/config.js
    grunt run

Now watch your UDPlogger in action:

- Point your browser to http://127.0.0.1:9998/client/
- Run one of the clients below to generate traffic.


### Server instance

Install Node.js.

    sudo apt-get install node


Install code and dependencies.

- Install code base where you want it.
- Install dependencies from package.json
- Prep config file with the correct settings.
- Run with Grunt to test.
- Stop Grunt test.

Let's go:

    sudo npm install -g grunt-cli
    cd ~/<your project folder>/
    # git clone git@github.com:schibsted/UDPlogger.git
    sudo git clone https://github.com/schibsted/UDPlogger.git
    cd UDPlogger
    sudo npm install
    sudo cp ./config/config-dist.js /etc/udp_logserver.conf
    sudo vim /etc/udp_logserver.conf
    sudo ln -s /etc/udp_logserver.conf ./config/config.js
    grunt run
    <ctrl> + c


Edit and install upstart file.

    sudo cp ./upstart/upstart-UDPlogger.conf /etc/init/UDPlogger.conf
    sudo vim /etc/init/UDPlogger.conf
    sudo mkdir -p /var/log/UDPlogger/ /data/UDPlogger/ /var/run/UDPlogger/
    sudo chown -R www-data.www-data /var/log/UDPlogger/ /data/UDPlogger/ /var/run/UDPlogger/

Start server

    sudo initctl start UDPlogger
    sudo tail -f /var/log/UDPlogger/UDPlogger.log


### Watch webinterface

- Point your browser to http://127.0.0.1:9998/client/
- Run one of the clients below to generate traffic.


### Tail logs

- Go to code base dir.

Tail server log in a human readable format.

    sudo tail -f /data/udp_logserver/udp_logserver.log | ./node_modules/bunyan/bin/bunyan


### Run PHP client for testing

- Go to code base dir.

Run client PHP test and send 1000 packages with 100 micro sec sleep between each.

    time php ./example/client_php.php

Run client PHP test with a single packet without any delay.

    time php ./example/client_php_single.php


### Run Node.js client for testing

    Options for client:
        -i    Server ip address
        -p    Server port
        -t    Run time in milliseconds
        -T    Search string

- Go to code base dir.

Run client.js. It will connect to Twitter stream and send 1 packet for each tweet.

    node ./example/client.js -i 127.0.0.1 -p 8080 -t 10000 -T obama


### Edit config file

Most settings is available from ./config/config.js.


### Make your own plugins

Make your own plugins to be able to:

- Parse the message content and trigger actions.

This is how you do it:

- Go to code base dir.
- Go to plugins dir.
- Copy boilerplate.js to your own file. Must end with .js
- Hack away with your plugin :)



## Deployment howto

TODO: Must be rewritten to git.

### Tag a new release

    git co master
    # Merge all new tested features from dev branch.
    git tag -a RELEASE_2.0 -m 'Version 2.0'
    git push --tags


### Export a new release on the server

Prep code before switch.

    cd /srv/
    sudo git clone https://github.com/schibsted/UDPlogger.git udp_logserver_<version>
    cd udp_logserver_<version>
    sudo git checkout <tag>
    sudo npm install
    sudo ln -s /etc/udp_logserver.conf ./config/config.js

Do the switch.

    cd ..
    sudo initctl stop logserver && sudo rm udp_logserver && sudo ln -s udp_logserver_<version> udp_logserver && sudo initctl start logserver
    # sudo initctl stop udp_logserver && sudo rm udp_logserver && sudo ln -s udp_logserver_2.0.12 udp_logserver && sudo initctl start udp_logserver

    ps aux | grep logserver

Check log files.

    sudo tail /var/log/upstart/udp_logserver.log
    sudo tail /var/log/udp_logserver/udp_logserver.log
    sudo cat /var/run/udp_logserver/udp_logserver.pid
    sudo tail -f /data/udp_logserver/udp_logserver.log | ./udp_logserver/node_modules/bunyan/bin/bunyan


## TODO

- Add Nagios probe.
- Add more monitoring possibilities.



## Authors

**Øistein Sørensen**

+ [Øistein on Twitter](https://twitter.com/sorenso)
+ [Øistein on LinkedIn](http://no.linkedin.com/in/sorenso/)

**Magne Thyrhaug**

+ [Magne on Twitter](https://twitter.com/magnethy)
+ [Magne on LinkedIn](http://no.linkedin.com/in/magnethyrhaug)


Copyright and license
---------------------

Copyright 2013

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this work except in compliance with the License.
You may obtain a copy of the License in the LICENSE file, or at:

   [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
