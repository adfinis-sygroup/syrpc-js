var consts = require("./consts.js")
var base = require("./base.js")
var debug = require('debug')('syrpc');

export class SyRPCServer extends base.SyRPCBase {
  get_request(timeout=null) {
    return new Promise((resolve, reject) => {
      if (timeout !== null) {
        setTimeout(() => {
          debug(`Server: Timeout on ${this.request}`)
          reject(new Error("Timeout expired"))
        }, timeout)
      }
      debug(`Server: Listen for request on ${this.request}`)
      this.channel.consume(this.request, msg => {
        debug(`Server: Got request on ${this.request}`)
        resolve(JSON.parse(msg.content))
        this.channel.ack(msg)
        debug(`Server: Canceling consumer ${msg.fields.consumerTag}`)
        this.channel.cancel(msg.fields.consumerTag).catch(reject)
      }).then(ret => {
        debug(`Server: Created consumer ${ret.consumerTag}`)
        if (timeout !== null) {
          setTimeout(() => {
            debug(`Server: Canceling consumer ${ret.consumerTag}`)
            this.channel.cancel(ret.consumerTag).catch(reject)
          }, timeout)
        }
      }).catch(reject)
    })
  }

  put_result(result_id, data) {
    var hash_id = this.get_hash(result_id)
    this.assert_result_queue(hash_id).then(result_queue => {
      debug(`Server: Publishing request on ${result_queue}`)
      this.channel.publish(
        this.result_exchange,
        String(hash_id),
        new Buffer(JSON.stringify({
          'result_id': result_id,
          'data': data
        })),
        { headers: {
          contentType: consts.MSG_TYPE,
          contentEncoding: this.encoding
        }}
      )
    })
  }
}
