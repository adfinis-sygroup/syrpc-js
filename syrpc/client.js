var consts = require("./consts.js")
var base = require("./base.js")
var uuid = require('node-uuid');

var debug = require('debug')('syrpc');

export class SyRPCClient extends base.SyRPCBase {
  get_result(result_id, timeout=null) {
    return new Promise((resolve, reject) => {
      var tag = null
      var hash_id = this.get_hash(result_id)
      this.assert_result_queue(hash_id).then(result_queue => {
        if (timeout !==null) {
          setTimeout(() => {
            debug(`Client: Timeout on ${result_queue}`)
            reject(new Error("Timeout expired"))
          }, timeout)
        }
        debug(`Client: Listening for result ${result_id} on ${result_queue}`)
        this.channel.consume(result_queue, msg => {
          var res = JSON.parse(msg.content)
          debug(`Client: Got result ${res.result_id} on ${result_queue} `)
          if (res.result_id == result_id) {
            debug(`Client: Verified result on ${result_queue}`)
            resolve(res)
            this.channel.ack(msg)
            debug(`Client: Canceling consumer ${msg.fields.consumerTag}`)
            this.channel.cancel(msg.fields.consumerTag).catch(reject)
          } else {
            this.channel.reject(msg)
          }
        }).then(ret => {
          debug(`Client: Created consumer ${ret.consumerTag}`)
          if (timeout !== null) {
            setTimeout(() => {
                debug(`Client: Canceling consumer ${ret.consumerTag}`)
                this.channel.cancel(ret.consumerTag).catch(reject)
            }, timeout)
          }
        }).catch(reject)
      })
    })
  }

  put_request(type, data) {
    var result_id = uuid.v4()
    debug(`Client: Publishing request on ${this.request}`)
    this.channel.publish(
      this.request,
      this.request,
      new Buffer(JSON.stringify({
        'result_id': result_id,
        'type': type,
        'data': data
      })),
      { headers: {
        contentType: consts.MSG_TYPE,
        contentEncoding: this.encoding
      }}
    )
    return result_id
  }
}
