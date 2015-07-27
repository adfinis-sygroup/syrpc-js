"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var siphash = require("siphash");
var consts = require("./consts");

var SyRPCBase = (function () {
  function SyRPCBase(settings) {
    _classCallCheck(this, SyRPCBase);

    this.key = siphash.string16_to_key(consts.AMQ_HASH);
    this.num_queues = consts.AMQ_NUM_QUEUES;
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

