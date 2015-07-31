var consts = require("./consts.js")
var base = require("./base.js")

export class SyRPCServer extends base.SyRPCBase {
  get_request(timeout=null) {
    return new Promise((resolve, reject) => {
      var tag = null
      if (timeout !==null) {
        setTimeout(function() {
          reject(new Error("Timeout expired"))
        }, timeout)
        if (tag !== null) {
          this.channel.cancel(tag).catch(reject)
        }
      }
      tag = this.channel.consume(this.request, msg => {
        resolve(JSON.parse(msg.content))
        this.channel.cancel(msg.fields.consumerTag).catch(reject)
      }).then(ret => { tag = ret.consumerTag }).catch(reject)
    })
  }

  put_result(result_id, data) {
    var hash_id = this.get_hash(result_id)
    this.assert_result_queue(hash_id).then(result_queue => {
      this.channel.publish(
        this.request,
        result_queue,
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
