var assert = require('assert')
var server = require('./server')
var client = require('./client')
var debug  = require('debug')('syrpc')

function getSettings() {
  return {
    'app_name':        'syrpc',
    'amq_virtualhost': '/',
    'amq_host':        'localhost',
    'amq_user':        'guest',
    'amq_password':    'guest'
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

export function runServer(forever = false) {
  let settings = getSettings()
  let rpcServer = new server.SyRPCServer(settings)
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
  let settings = getSettings()
  let rpcClient = new client.SyRPCClient(settings)
  let type = 'echo'
  let data = [{'foo': 'bar'}, {'baz': 9001}]
  rpcClient.init().then(() => {
    let resultId = rpcClient.putRequest(type, data)
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
