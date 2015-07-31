var assert = require("assert")
var syrpc  = require("../main")
var amqp   = require('amqplib');

describe('Array', function() {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1,2,3].indexOf(5))
      assert.equal(-1, [1,2,3].indexOf(0))
    })
  })
})

describe('Basics', function() {
  describe('Create Server', function () {
    it('should have a get_request and a put_result method', function () {
      // TODO
      var server = new syrpc.SyRPCServer({})
      assert.equal(typeof server.get_hash, "function")
    })
    it('should pass the settings to instance', function () {
      var server = new syrpc.SyRPCServer({
        app_name        : "1",
        amq_host        : "2",
        amq_virtualhost : "3",
        amq_user        : "4",
        amq_password    : "5",
        amq_transport   : "6",
        amq_ttl         : 7,
        amq_msg_ttl     : 8,
        amq_num_queues  : 9,
        msg_encoding    : "10"
      })
      assert.equal(server.app_name, "1")
      assert.equal(server.host, "2")
      assert.equal(server.virtualhost, "3")
      assert.equal(server.user, "4")
      assert.equal(server.password, "5")
      assert.equal(server.transport, "6")
      assert.equal(server.ttl, 7)
      assert.equal(server.msg_ttl, 8)
      assert.equal(server.num_queues, 9)
      assert.equal(server.msg_encoding, "10")
    })
    it('should create the url and the exchanges', function (done) {
      var server = new syrpc.SyRPCServer({
        app_name        : "syrpc",
        amq_host        : "localhost",
      })
      server.init().then(function() {
        assert.equal(server.url, "amqp://guest:guest@localhost:5672//")
        assert.equal(server.request, "syrpc_request")
        assert.equal(server.result_exchange, "syrpc_result_exchange")
        return Promise.all([
          server.channel.checkExchange(server.request),
          server.channel.checkQueue(server.request),
          server.channel.checkExchange(server.result_exchange),
        ])
      }).then(function() {
        done()
      }).catch(function(e) {
        done(e)
      })
    })
  })
  describe('Queues', function () {
    it('should create and bind an result queue', function (done) {
      var server = new syrpc.SyRPCServer({
        app_name        : "syrpc",
        amq_host        : "localhost",
      })
      server.init().then(function() {
        return server.assert_result_queue(3)
      }).then(function(queue) {
        assert.equal(queue, "syrpc_result_queue_3")
        return server.channel.checkQueue(queue)
      }).then(function() {
        return server.assert_result_queue(3)
      }).then(function(queue) {
        assert.equal(queue, "syrpc_result_queue_3")
        done()
      }).catch(function(e) {
        done(e)
      })
    })
    it('should throw a timeout error', function (done) {
      var server = new syrpc.SyRPCServer({
        app_name        : "syrpc",
        amq_host        : "localhost",
      })
      server.init().then(function() {
        return server.get_request(1)
      }).then(function(res) {
        done(new Error("We didn't get a timeout, but a result -> fail"))
      }).catch(function(e) {
        done()
      })
    })
    it('should do a whole roundtrip', function (done) {
      var result_id = null
      var server = new syrpc.SyRPCServer({
        app_name        : "syrpc",
        amq_host        : "localhost",
      })
      var client = new syrpc.SyRPCClient({
        app_name        : "syrpc",
        amq_host        : "localhost",
      })
      client.init().then(function() {
        result_id = client.put_request("test", { val: 3 })
      })
      server.init().then(function() {
        return server.get_request()
      }).then(function(msg) {
        assert.equal(msg.type, "test")
        assert.equal(msg.data.val, 3)
        assert.equal(msg.result_id, result_id)
        server.put_result(msg.result_id, { val: 4 })
        return client.get_result(result_id)
      }).then(function(msg) {
        assert.equal(msg.result_id, result_id)
        assert.equal(msg.data.val, 4)
        done()
      }).catch(function(e) {
        done(e)
      })
    })
  })
  describe('Check hash function', function () {
    it('should match those of the python and php implementation', function () {
      var server = new syrpc.SyRPCServer({})
      assert.equal(server.get_hash("huhu"), 34)
      assert.equal(server.get_hash("fasel"), 25)
      assert.equal(server.get_hash("huh\xc3\xbc"), 53)
      assert.equal(server.get_hash("THX\xe2\x84\xa2"), 54)
    })
  })
})
