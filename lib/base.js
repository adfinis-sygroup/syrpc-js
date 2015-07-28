"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var siphash = require("siphash");
var consts = require("./consts");

var SyRPCBase = (function () {
  /**
   * Creates the SyRPC class
   *
   * app_name        (mandatory) Every server this the same app name
   *                             must support the same request-types
   * amq_host        (mandatory)
   * amq_virtualhost (optional)
   * amq_user        (optional)
   * amq_password    (optional)
   * amq_transport   (optional) Not supported with js
   * amq_ttl         (optional) Time to live for queues
   * amq_msg_ttl     (optional) Time to live for messages
   * amq_num_queues  (optional) Number of queue (default 64)
   * msg_encoding    (optional) Default utf-8
   *
   * @constructor
   * @param {settings} Settings object with fields  as above
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
      this.user = null;
    }
    if ('amq_password' in settings) {
      this.password = settings.amq_password;
    } else {
      this.password = null;
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
    if ('msg_encoding' in settings) {
      this.msg_encoding = settings.msg_encoding;
    } else {
      this.msg_encoding = consts.ENCODING;
    }
    this.key = siphash.string16_to_key(consts.HASH);
  }

  _createClass(SyRPCBase, [{
    key: "get_hash",
    value: function get_hash(string) {
      var hash = siphash.hash(this.key, string);
      var res = hash.l & 0x7FFFFFFF;
      return res % this.num_queues;
    }
  }]);

  return SyRPCBase;
})();

exports.SyRPCBase = SyRPCBase;

