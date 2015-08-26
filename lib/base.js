'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
// istanbul ignore next

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// istanbul ignore next

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _siphash = require('siphash');

var _siphash2 = _interopRequireDefault(_siphash);

var _amqplib = require('amqplib');

var _amqplib2 = _interopRequireDefault(_amqplib);

var _lodashMerge = require('lodash.merge');

var _lodashMerge2 = _interopRequireDefault(_lodashMerge);

var _consts = require('./consts');

var defaults = {
  virtualhost: _consts.VIRTUALHOST,
  user: 'guest',
  password: 'guest',
  transport: null,
  ttl: _consts.TTL,
  msg_ttl: _consts.MSG_TTL,
  num_queues: _consts.NUM_QUEUES
};

var SyRPCBase = (function () {

  /**
   * Creates the SyRPC object using the following settings:
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

  function SyRPCBase(settings) {
    _classCallCheck(this, SyRPCBase);

    this.app_name = settings.app_name;
    this.host = settings.amq_host;

    (0, _lodashMerge2.default)(this, defaults, {
      virtualhost: settings.amq_virtualhost,
      user: settings.amq_user,
      password: settings.amq_password,
      transport: settings.amq_transport,
      ttl: settings.amq_ttl,
      msg_ttl: settings.amq_msg_ttl,
      num_queues: settings.amq_num_queues
    });

    this.key = _siphash2.default.string16_to_key(_consts.HASH);
    this.result_queues = {};
    this.encoding = _consts.ENCODING;
    this.connection = null;
    this.channel = null;
    this.request = null;
    this.result_exchange = null;
  }

  _createClass(SyRPCBase, [{
    key: 'init',
    value: function init() {
      // istanbul ignore next

      var _this = this;

      this.url = 'amqp://' + this.user + ':' + this.password + '@' + this.host + ':5672/' + this.virtualhost;
      return _amqplib2.default.connect(this.url).then(function (conn) {
        _this.connection = conn;
        return conn.createChannel();
      }).then(function (ch) {
        _this.channel = ch;

        _this.request = _this.app_name + '_request';
        var req = _this.request;
        _this.result_exchange = _this.app_name + '_result_exchange';
        return Promise.all([ch.assertExchange(req), ch.assertQueue(req), ch.bindQueue(req, req, req), ch.assertExchange(_this.result_exchange)]);
      });
    }
  }, {
    key: 'assertResultQueue',
    value: function assertResultQueue(index) {
      // istanbul ignore next

      var _this2 = this;

      if (index in this.result_queues) {
        return new Promise(function (resolve, reject) {
          resolve(_this2.result_queues[index]);
        });
      } else {
        var _ret = (function () {
          var queue = _this2.app_name + '_result_queue_' + index;
          return {
            v: Promise.all([_this2.channel.assertQueue(queue, {
              messageTtl: _this2.msg_ttl * 1000,
              expires: _this2.ttl * 1000
            }), _this2.channel.bindQueue(queue, _this2.result_exchange, String(index))]).then(function () {
              _this2.result_queues[index] = queue;
              return queue;
            })
          };
        })();

        // istanbul ignore next
        if (typeof _ret === 'object') return _ret.v;
      }
    }
  }, {
    key: 'getHash',
    value: function getHash(string) {
      var hash = _siphash2.default.hash(this.key, string);
      var res = hash.l & 0x7FFFFFFF;
      return res % this.num_queues;
    }
  }]);

  return SyRPCBase;
})();

exports.default = SyRPCBase;
module.exports = exports.default;

