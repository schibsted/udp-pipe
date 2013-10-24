assert = require('assert');
http = require('http');


console.log "acceptance test"

describe "test case 1", ->
  it "should run test", ->
    assert.equal "a", "a"
