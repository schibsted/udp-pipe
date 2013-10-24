assert = require 'assert'
dgram = require 'dgram'
spawn = require('child_process').spawn
tail_process = "";

Helper =
  dump_file_verifier: (callback) ->
    tail_process.stdout.on('data', (data) ->
      json_obj = JSON.parse data
      callback json_obj
    )
  send: (message) ->
    buffer = new Buffer(message)
    client = dgram.createSocket "udp4"
    client.send(buffer, 0, buffer.length, 8080, "localhost", (err, bytes) -> client.close())



beforeEach () ->
  tail_process = spawn 'tail', ['-n', '0', '-f', "/tmp/logserver_dumper.log"]

afterEach () ->
  if tail_process then tail_process.kill()

describe "Regular end to end tests", ->
  it "should write sent message to dumper log", (done) ->
    Helper.dump_file_verifier((obj) -> (if obj.msg == "test message!" then done() else throw new Error "wrong message"))
    Helper.send "test message!"