var server = require("./lib/server.js")
var client = require("./lib/client.js")
module.exports = {
  SyRPCServer: server.SyRPCServer,
  SyRPCClient: client.SyRPCClient
}
