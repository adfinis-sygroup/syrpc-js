'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var siphash = require('siphash');
var amqp = require('amqplib');
var consts = require('./consts');

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
    if ('amq_virtualhost' in settings) {
      this.virtualhost = settings.amq_virtualhost;
    } else {
      this.virtualhost = consts.VIRTUALHOST;
    }
    if ('amq_user' in settings) {
      this.user = settings.amq_user;
    } else {
      this.user = 'guest';
    }
    if ('amq_password' in settings) {
      this.password = settings.amq_password;
    } else {
      this.password = 'guest';
    }
    if ('amq_transport' in settings) {
      this.transport = settings.amq_transport;
    } else {
      this.transport = null;
    }
    if ('amq_ttl' in settings) {
      this.ttl = settings.amq_ttl;
    } else {
      this.ttl = consts.TTL;
    }
    if ('amq_msg_ttl' in settings) {
      this.msg_ttl = settings.amq_msg_ttl;
    } else {
      this.msg_ttl = consts.MSG_TTL;
    }
    if ('amq_num_queues' in settings) {
      this.num_queues = settings.amq_num_queues;
    } else {
      this.num_queues = consts.NUM_QUEUES;
    }
    this.key = siphash.string16_to_key(consts.HASH);
    this.result_queues = {};
    this.encoding = consts.ENCODING;
  }

  _createClass(SyRPCBase, [{
    key: 'init',
    value: function init() {
      var _this = this;

      this.url = 'amqp://' + this.user + ':' + this.password + '@' + this.host + ':5672/' + this.virtualhost;
      return amqp.connect(this.url).then(function (conn) {
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

        if (typeof _ret === 'object') return _ret.v;
      }
    }
  }, {
    key: 'getHash',
    value: function getHash(string) {
      var hash = siphash.hash(this.key, string);
      var res = hash.l & 0x7FFFFFFF;
      return res % this.num_queues;
    }
  }]);

  return SyRPCBase;
})();

exports.SyRPCBase = SyRPCBase;

