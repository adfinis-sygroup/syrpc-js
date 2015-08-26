'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _baseJs = require('./base.js');

var _baseJs2 = _interopRequireDefault(_baseJs);

var _constsJs = require('./consts.js');

var debug = require('debug')('syrpc');

var SyRPCServer = (function (_SyRPCBase) {
  _inherits(SyRPCServer, _SyRPCBase);

  /**
   * Creates the SyRPC server using the following settings:
   *
   * - app_name        (mandatory) Every server this the same app name
   *   must support the same request-types
   *
   * - amq_host        (mandatory)
   *
   * - amq_virtualhost (optional)
   *
   * - amq_user        (optional)
   *
   * - amq_password    (optional)
   *
   * - amq_transport   (optional) Not supported with js
   *
   * - amq_ttl         (optional) Time to live for queues
   *
   * - amq_msg_ttl     (optional) Time to live for messages
   *
   * - amq_num_queues  (optional) Number of queue (default 64)
   *
   * @constructor
   * @param {Object} settings object with fields as above
   */

  function SyRPCServer(settings) {
    _classCallCheck(this, SyRPCServer);

    _get(Object.getPrototypeOf(SyRPCServer.prototype), 'constructor', this).call(this, settings);
  }

  /**
   * Wait for a request. Blocks until a request arrives or
   * timeout has expired. If no request has arrived when timeout
   * is expired getRequest will reject.
   *
   * @param {timeout} Timeout after which get_request will reject the promise
   * @return {Promise}
   */

  _createClass(SyRPCServer, [{
    key: 'getRequest',
    value: function getRequest() {
      var _this = this;

      var timeout = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      return new Promise(function (resolve, reject) {
        if (timeout !== null) {
          setTimeout(function () {
            debug('Server: Timeout on ' + _this.request);
            reject(new Error('Timeout expired'));
          }, timeout);
        }
        debug('Server: Listen for request on ' + _this.request);
        _this.channel.consume(_this.request, function (msg) {
          debug('Server: Got request on ' + _this.request);
          resolve(JSON.parse(msg.content));
          _this.channel.ack(msg);
          debug('Server: Canceling consumer ' + msg.fields.consumerTag);
          _this.channel.cancel(msg.fields.consumerTag)['catch'](reject);
        }).then(function (ret) {
          debug('Server: Created consumer ' + ret.consumerTag);
          if (timeout !== null) {
            setTimeout(function () {
              debug('Server: Canceling consumer ' + ret.consumerTag);
              _this.channel.cancel(ret.consumerTag)['catch'](reject);
            }, timeout);
          }
        })['catch'](reject);
      });
    }

    /**
     * Puts a result to the AMQ result queue.
     *
     * @param {result_id} The result id received with getRequest
     * @param {data} Result to send to the client
     * @return {Promise}
     */
  }, {
    key: 'putResult',
    value: function putResult(result_id, data) {
      var _this2 = this;

      var hash_id = this.getHash(result_id);
      this.assertResultQueue(hash_id).then(function (result_queue) {
        debug('Server: Publishing request on ' + result_queue);
        _this2.channel.publish(_this2.result_exchange, String(hash_id), new Buffer(JSON.stringify({ result_id: result_id, data: data })), {
          contentType: _constsJs.MSG_TYPE,
          contentEncoding: _this2.encoding
        });
      });
    }
  }]);

  return SyRPCServer;
})(_baseJs2['default']);

exports['default'] = SyRPCServer;
module.exports = exports['default'];

