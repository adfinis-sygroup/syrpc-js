"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var base = require("./base.js");
var amqp = require('amqplib');

var SyRPCServer = (function (_base$SyRPCBase) {
  _inherits(SyRPCServer, _base$SyRPCBase);

  function SyRPCServer() {
    _classCallCheck(this, SyRPCServer);

    _get(Object.getPrototypeOf(SyRPCServer.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(SyRPCServer, [{
    key: "get_request",
    value: function get_request() {
      var _this = this;

      var timeout = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      return new Promise(function (resolve, reject) {
        if (timeout !== null) {
          setTimeout(function () {
            reject("Timeout expired");
          }, timeout);
        }
        _this.channel.consume(_this.request).then(function (result) {
          resolve(result);
        }).then(resolve, reject);
      });
    }
  }]);

  return SyRPCServer;
})(base.SyRPCBase);

exports.SyRPCServer = SyRPCServer;

