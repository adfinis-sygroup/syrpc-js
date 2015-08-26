var consts = require('./consts.js')
var base   = require('./base.js')
var debug  = require('debug')('syrpc')

export class SyRPCServer extends base.SyRPCBase {
  /**
   * Creates the SyRPC server using the following settings:
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
   * @param {Object} settings object with fields as above
   */
  constructor(settings) {
    super(settings)
  }

  /**
   * Wait for a request. Blocks until a request arrives or
   * timeout has expired. If no request has arrived when timeout
   * is expired getRequest will reject.
   *
   * @param {timeout} Timeout after which get_request will reject the promise
   * @return {Promise}
   */
  getRequest(timeout = null) {
    return new Promise((resolve, reject) => {
      if (timeout !== null) {
        setTimeout(() => {
          debug(`Server: Timeout on ${this.request}`)
          reject(new Error('Timeout expired'))
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

  /**
   * Puts a result to the AMQ result queue.
   *
   * @param {result_id} The result id received with getRequest
   * @param {data} Result to send to the client
   * @return {Promise}
   */
  putResult(result_id, data) {
    var hash_id = this.getHash(result_id)
    this.assertResultQueue(hash_id).then(result_queue => {
      debug(`Server: Publishing request on ${result_queue}`)
      this.channel.publish(
        this.result_exchange,
        String(hash_id),
        new Buffer(JSON.stringify({ result_id, data })),
        {
          contentType: consts.MSG_TYPE,
          contentEncoding: this.encoding
        }
      )
    })
  }
}
