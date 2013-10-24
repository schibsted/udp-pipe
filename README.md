UDPlogger
=========

__What is this?__

UDP logserver. Purpose is to collect excessive logging and have plugins take action on the
incoming messages.

Standard plugins are:

- file_logger.js : Save messages to file in JSON format. This is used for logging and importing into Splunk.
-

__Why this?__

An UDP logger removes the latency from connecting to a server or writing to a filehandle.
We then stream the file into a tool like Splunk. That way we can store both formats for
future tools.

__How does this work?__

You create an UDP package inside you code and send it to the server without waiting for a reply.


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
- Go to code base dir.

Run cmd:

    cd ~/<your project folder>/
    git clone git@github.com:schibsted/UDPlogger.git
    cd UDPlogger
    npm install
    cp ./config/config-dist.js ./config/config.js
    node server.js

Now watch your UDPlogger in action:

- Point your browser to http://127.0.0.1:9998/client/
- Run one of the clients below to generate traffic.


### Server instance

Install Node.js.

    sudo apt-get install node

Install code base where you want it.

    git clone git@github.com:schibsted/UDPlogger.git

Install dependencies from package.json

    npm install

Go to code base dir.

Edit and install upstart file.

    sudo cp ./upstart-logserver.conf /etc/init/udp_logserver.conf
    sudo emacs /etc/init/udp_logserver.conf
    sudo mkdir /var/log/udp_logserver/
    sudo mkdir /var/run/udp_logserver/
    sudo mkdir /data/udp_logserver/
    sudo chown -R www-data.www-data /var/log/udp_logserver/ /var/run/udp_logserver/ /data/udp_logserver/

Start server

    sudo initctl start udp_logserver
    sudo tail -f /data/udp_logserver/udp_logserver.log


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

    svn copy https://subversion.assembla.com/svn/spid-operations.UDPlogger/trunk \
        https://subversion.assembla.com/svn/spid-operations.UDPlogger/tags/0.2.5 -m "Release 0.2.5"


### Making new stable tag

    svn rm https://subversion.assembla.com/svn/spid-operations.UDPlogger/tags/stable -m "Replacing stable with trunc."

    svn copy https://subversion.assembla.com/svn/spid-operations.UDPlogger/trunk \
        https://subversion.assembla.com/svn/spid-operations.UDPlogger/tags/stable -m "Release 0.2.5 is now stable."


### Export a new release on the server

    cd /srv/
    svn export https://subversion.assembla.com/svn/spid-operations.UDPlogger/tags/stable udp_logserver_0.2.5
    rm udp_logserver
    ln -s udp_logserver_0.2.5 udp_logserver
    ln -s /etc/udp_logserver.conf ./udp_logserver/config/config.js
    sudo chgrp -R www-data ./udp_logserver_0.2.5/
    sudo initctl stop logserver
    sudo initctl start logserver
    ps aux | grep logserver
    sudo tail /var/log/upstart/logserver.log
    sudo tail /var/log/udp_logserver/udp_logserver.log
    sudo cat /var/run/udp_logserver/udp_logserver.pid
    sudo tail -f /data/udp_logserver/udp_logserver.log | ./udp_logserver/node_modules/bunyan/bin/bunyan


## TODO

- Add unit testing. Should have been done first, but you know how it is...
- Add plugin examples. Event trigger example. Output filter example.
- Add pretty view inside admin client. DONE.


## Authors

**Øistein Sørensen**

+ [Øistein on Twitter](http://litt.no/twitter)
+ [Øistein on LinkedIn](http://litt.no/linkedin)
+ [Øistein on Instagram](http://instagram.com/sorenso)


Copyright and license
---------------------

Copyright 2012 sorenso@gmail.com

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this work except in compliance with the License.
You may obtain a copy of the License in the LICENSE file, or at:

   [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
