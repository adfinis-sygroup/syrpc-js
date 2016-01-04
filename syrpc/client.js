import SyRPCBase from './base.js'
import uuid from 'node-uuid'
import { MSG_TYPE } from './consts.js'

const debug = require('debug')('syrpc')

export default class SyRPCClient extends SyRPCBase {

  /**
   * Creates the SyRPC client using the following settings:
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
   * - timeout         (optional) Timeout in seconds
   *
   * @constructor
   * @param {Object} settings object with fields as above
   */
  constructor(settings) {
    super(settings)
  }

  /**
   * Wait for a result. Blocks unit a result arrives or the
   * timeout has expired.
   *
   * @param {result_id} Get the result for this result_id
   * @param {timeout} Timeout after which getResult will reject the promise
   * @return {Promise}
   */
  getResult(result_id, timeout = this.timeout) {
    return new Promise((resolve, reject) => {
      let hash_id = this.getHash(result_id)

      this.assertResultQueue(hash_id).then(result_queue => {
        if (timeout !== null) {
          setTimeout(() => {
            debug(`Client: Timeout on ${result_queue}`)
            reject(new Error('Timeout expired'))
          }, timeout)
        }

        debug(`Client: Listening for result ${result_id} on ${result_queue}`)

        this.channel.consume(result_queue, msg => {
          let res = JSON.parse(msg.content)
          debug(`Client: Got result ${res.result_id} on ${result_queue} `)
          if (res.data.exception) {
            reject(new Error(res.data.exception))

            return
          }
          if (res.result_id == result_id) {
            debug(`Client: Verified result on ${result_queue}`)
            resolve(res)
            this.channel.ack(msg)
            debug(`Client: Canceling consumer ${msg.fields.consumerTag}`)
            this.channel.cancel(msg.fields.consumerTag).catch(reject)
          }
          else {
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

  /**
   * Puts request with given type and data to AMQ request queue.
   *
   * @param {type} Type of the request represents the service/method/function
   *               that should be called.
   * @param {data} Data sent to the server.
   * @return {string}
   */
  putRequest(type, data) {
    let result_id = uuid.v4()
    debug(`Client: Publishing request on ${this.request}`)
    this.channel.publish(
      this.request,
      this.request,
      new Buffer(JSON.stringify({ result_id, type, data })),
      {
        contentType: MSG_TYPE,
        contentEncoding: this.encoding
      }
    )
    return result_id
  }
}
