"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var consts = require("./consts.js");
var base = require("./base.js");
var uuid = require('node-uuid');

var debug = require('debug')('syrpc');

var SyRPCClient = (function (_base$SyRPCBase) {
  _inherits(SyRPCClient, _base$SyRPCBase);

  /**
   * Creates the SyRPC client using the following settings:
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
   * @param {settings} Settings object with fields as above
   */

  function SyRPCClient(settings) {
    _classCallCheck(this, SyRPCClient);

    _get(Object.getPrototypeOf(SyRPCClient.prototype), "constructor", this).call(this, settings);
  }

  /**
   * Wait for a result. Blocks unit a result arrives or the
   * timeout has expired.
   *
   * @param {result_d} Get the result for this result_id
   * @param {timeout} Timeout after which get_result will reject the promise
   */

  _createClass(SyRPCClient, [{
    key: "get_result",
    value: function get_result(result_id) {
      var _this = this;

      var timeout = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return new Promise(function (resolve, reject) {
        var tag = null;
        var hash_id = _this.get_hash(result_id);
        _this.assert_result_queue(hash_id).then(function (result_queue) {
          if (timeout !== null) {
            setTimeout(function () {
              debug("Client: Timeout on " + result_queue);
              reject(new Error("Timeout expired"));
            }, timeout);
          }
          debug("Client: Listening for result " + result_id + " on " + result_queue);
          _this.channel.consume(result_queue, function (msg) {
            var res = JSON.parse(msg.content);
            debug("Client: Got result " + res.result_id + " on " + result_queue + " ");
            if (res.result_id == result_id) {
              debug("Client: Verified result on " + result_queue);
              resolve(res);
              _this.channel.ack(msg);
              debug("Client: Canceling consumer " + msg.fields.consumerTag);
              _this.channel.cancel(msg.fields.consumerTag)["catch"](reject);
            } else {
              _this.channel.reject(msg);
            }
          }).then(function (ret) {
            debug("Client: Created consumer " + ret.consumerTag);
            if (timeout !== null) {
              setTimeout(function () {
                debug("Client: Canceling consumer " + ret.consumerTag);
                _this.channel.cancel(ret.consumerTag)["catch"](reject);
              }, timeout);
            }
          })["catch"](reject);
        });
      });
    }

    /**
     * Puts request with given type and data to AMQ request queue.
     *
     * @param {type} Type of the request represents the service/method/function
     *               that should be called.
     * @param {data} Data sent to the server.
     */
  }, {
    key: "put_request",
    value: function put_request(type, data) {
      var result_id = uuid.v4();
      debug("Client: Publishing request on " + this.request);
      this.channel.publish(this.request, this.request, new Buffer(JSON.stringify({
        'result_id': result_id,
        'type': type,
        'data': data
      })), { headers: {
          contentType: consts.MSG_TYPE,
          contentEncoding: this.encoding
        } });
      return result_id;
    }
  }]);

  return SyRPCClient;
})(base.SyRPCBase);

exports.SyRPCClient = SyRPCClient;

