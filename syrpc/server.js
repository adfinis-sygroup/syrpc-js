var base = require("./base.js")
var amqp = require('amqplib');

export class SyRPCServer extends base.SyRPCBase {
  get_request(timeout=null) {
    return new Promise((resolve, reject) => {
      if (timeout !==null) {
        setTimeout(timeout, function() {
          reject("Timeout expired")
        })
      }
      this.channel.consume(this.request).then(function(result) {
        resolve(result)
      }).catch(function(e) {
        reject(e)
      })
    })
  }
}
