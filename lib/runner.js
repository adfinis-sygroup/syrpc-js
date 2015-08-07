'use strict';

var syrpc = require("../main");
var debug = require('debug')('syrpc');

function setupLogger() {
  debug.enable('syrpc');
}

function getSettings() {
  return {
    'app_name': 'syrpc',
    'amq_virtualhost': '/',
    'amq_host': 'localhost',
    'amq_user': 'guest',
    'amq_password': 'guest'
  };
}

function serveOne(rpcServer) {
  rpcServer.getRequest().then(function (msg) {
    debug('Server: Got request ' + msg.result_id);
    rpcServer.putResult(msg.result_id, msg.data);
    debug('Server: Put result ' + msg.result_id);
  });
}

function runServer() {
  var forever = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

  var settings = getSettings();
  setupLogger();
  var rpcServer = syrpc.SyRPCServer(settings);
  if (forever) {
    while (true) {
      serveOne(rpcServer);
    }
  } else {
    serveOne(rpcServer);
  }
}

