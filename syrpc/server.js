var base = require("./base.js")
var amqp = require('amqplib');

export class SyRPCServer extends base.SyRPCBase {
  get_request(timeout=null) {
    return new Promise((resolve, reject) => {
      if (timeout !==null) {
        setTimeout(function() {
          reject("Timeout expired")
        }, timeout)
      }
      this.channel.consume(this.request).then(resolve, reject)
    })
  }
}
