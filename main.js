var SyRPCServer = require('./lib/server.js')
var SyRPCClient = require('./lib/client.js')
var runner      = require('./lib/runner.js')

module.exports = {
  SyRPCServer:      SyRPCServer,
  SyRPCClient:      SyRPCClient,
  runServer:        runner.runServer,
  runServerForever: runner.runServerForever,
  runClient:        runner.runClient
}
