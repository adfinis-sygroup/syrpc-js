'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.runServer = runServer;
exports.runServerForever = runServerForever;
exports.runClient = runClient;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _server = require('./server');

var _server2 = _interopRequireDefault(_server);

var _client = require('./client');

var _client2 = _interopRequireDefault(_client);

var debug = require('debug')('syrpc');

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
  return rpcServer.getRequest().then(function (msg) {
    debug('Server: Got request ' + msg.result_id);
    rpcServer.putResult(msg.result_id, msg.data);
    debug('Server: Put result ' + msg.result_id);
  }).catch(function (err) {
    debug(err);
  });
}

function runForForever(rpcServer) {
  return serveOne(rpcServer).then(function () {
    runForForever(rpcServer);
  });
}

function runServer() {
  var forever = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

  var settings = getSettings();
  var rpcServer = new _server2.default(settings);
  rpcServer.init().then(function () {
    if (forever) {
      runForForever(rpcServer);
    } else {
      serveOne(rpcServer);
    }
  });
}

function runServerForever() {
  return runServer(true);
}

function runClient() {
  var settings = getSettings();
  var rpcClient = new _client2.default(settings);
  var type = 'echo';
  var data = [{ 'foo': 'bar' }, { 'baz': 9001 }];
  rpcClient.init().then(function () {
    var resultId = rpcClient.putRequest(type, data);
    return rpcClient.getResult(resultId);
  }).then(function (msg) {
    _assert2.default.equal(msg.data[0].foo, data[0].foo);
    _assert2.default.equal(msg.data[1].baz, data[1].baz);
    process.exit(0);
  }).catch(function (err) {
    debug('Wrong answer from echo server ', err);
    process.exit(1);
  });
}

