var assert = require("assert")
var server = require('./server')
var client = require('./client')
var debug  = require('debug')('syrpc')

function getSettings() {
  return {
    'app_name':        'syrpc',
    'amq_virtualhost': '/',
    'amq_host':        'localhost',
    'amq_user':        'guest',
    'amq_password':    'guest',
  }
}

function serveOne(rpcServer) {
  return rpcServer.getRequest().then(msg => {
    debug(`Server: Got request ${msg.result_id}`)
    rpcServer.putResult(msg.result_id, msg.data)
    debug(`Server: Put result ${msg.result_id}`)
  }).catch(err => {
    debug(err)
  })
}

function runForForever(rpcServer) {
  return serveOne(rpcServer).then(() => {
    runForForever(rpcServer)
  })
}

export function runServer(forever=false) {
  var settings = getSettings()
  var rpcServer = new server.SyRPCServer(settings)
  rpcServer.init().then(() => {
    if (forever) {
      runForForever(rpcServer)
    }
    else {
      serveOne(rpcServer)
    }
  })
}

export function runServerForever() {
  return runServer(true)
}

export function runClient() {
  var settings = getSettings()
  var rpcClient = new client.SyRPCClient(settings)
  var type = 'echo'
  var data = [{'foo': 'bar'}, {'baz': 9001}]
  rpcClient.init().then(() => {
    var resultId = rpcClient.putRequest(type, data)
    return rpcClient.getResult(resultId)
  }).then(msg => {
    assert.equal(msg.data[0].foo, data[0].foo)
    assert.equal(msg.data[1].baz, data[1].baz)
    process.exit(0)
  }).catch(err => {
    debug('Wrong answer from echo server ', err)
    process.exit(1)
  })
}
