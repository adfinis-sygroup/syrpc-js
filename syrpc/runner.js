var server    = require('./server')
var client    = require('./client')
var debug     = require('debug')('syrpc')

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
  rpcServer.getRequest().then(msg => {
    debug(`Server: Got request ${msg.result_id}`)
    rpcServer.putResult(msg.result_id, msg.data)
    debug(`Server: Put result ${msg.result_id}`)
  })
}

export function runServer(forever=false) {
  var settings = getSettings()
  var rpcServer = new server.SyRPCServer(settings)
  if (forever) {
    while (true) {
      serveOne(rpcServer)
    }
  }
  else {
    serveOne(rpcServer)
  }
}

export function runServerForever() {
  return runServer(true)
}
