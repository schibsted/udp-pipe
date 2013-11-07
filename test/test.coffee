assert = require('assert');

describe "util.iso_date", ->
  it "should just work.", ->
    util = require "../lib/util.js"
    assert.equal "2001-11-02 05:07:08", util.iso_date(new Date("2001-11-02T05:07:08.543"));