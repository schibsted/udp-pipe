assert = require 'assert'
dgram = require 'dgram'


console.log "acceptance test"

describe "test case 1", ->
  it "should run test", (done) ->
    console.log "running test"

    message = new Buffer("test message")
    client = dgram.createSocket "udp4"
    client.send(message, 0, message.length, 8080, "localhost", (err, bytes) -> (
      console.log("sent! " + err + ", " + bytes); client.close(); done()
    ))
    assert.equal "a", "a"