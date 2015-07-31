var consts = require("./consts.js")
var base = require("./base.js")
var uuid = require('node-uuid');

export class SyRPCClient extends base.SyRPCBase {
  get_result(result_id, timeout=null) {
    return new Promise((resolve, reject) => {
      var tag = null
      var hash_id = this.get_hash(result_id)
      var result_queue = this.assert_result_queue(hash_id)
      if (timeout !==null) {
        setTimeout(function() {
          reject(new Error("Timeout expired"))
        }, timeout)
        if (tag !== null) {
          this.channel.cancel(tag).catch(reject)
        }
      }
      tag = this.channel.consume(result_queue, msg => {
        res = JSON.parse(msg.content)
        if (res.result_id == result_id) {
          resolve(res)
          this.channel.cancel(msg.fields.consumerTag).catch(reject)
        } else {
          this.channel.reject(msg)
        }
      }).then(ret => { tag = ret.consumerTag }).catch(reject)
    })
  }

  put_request(type, data) {
    var result_id = uuid.v4()
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
