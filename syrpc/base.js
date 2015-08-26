import siphash from 'siphash'
import amqp    from 'amqplib'
import merge   from 'lodash.merge'

import {
  VIRTUALHOST,
  TTL,
  MSG_TTL,
  NUM_QUEUES,
  HASH,
  ENCODING
} from './consts'

const defaults = {
  virtualhost: VIRTUALHOST,
  user:        'guest',
  password:    'guest',
  transport:   null,
  ttl:         TTL,
  msg_ttl:     MSG_TTL,
  num_queues:  NUM_QUEUES
}

export default class SyRPCBase {

  /**
   * Creates the SyRPC object using the following settings:
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
    this.app_name = settings.app_name
    this.host = settings.amq_host

    merge(this, defaults, {
      virtualhost: settings.amq_virtualhost,
      user:        settings.amq_user,
      password:    settings.amq_password,
      transport:   settings.amq_transport,
      ttl:         settings.amq_ttl,
      msg_ttl:     settings.amq_msg_ttl,
      num_queues:  settings.amq_num_queues
    })

    this.key = siphash.string16_to_key(HASH)
    this.result_queues = {}
    this.encoding = ENCODING
    this.connection = null
    this.channel = null
    this.request = null
    this.result_exchange = null
  }

  init() {
    this.url = `amqp://${this.user}:${this.password}@${this.host}:5672/${this.virtualhost}`
    return amqp.connect(this.url)
      .then(conn => {
        this.connection = conn
        return conn.createChannel()
      })
      .then(ch => {
        this.channel = ch

        this.request = `${this.app_name}_request`
        let req = this.request
        this.result_exchange = `${this.app_name}_result_exchange`
        return Promise.all([
          ch.assertExchange(req),
          ch.assertQueue(req),
          ch.bindQueue(req, req, req),
          ch.assertExchange(this.result_exchange)
        ])
      })
  }

  assertResultQueue(index) {
    if (index in this.result_queues) {
      return new Promise((resolve, reject) => {
        resolve(this.result_queues[index])
      })
    }
    else {
      let queue = `${this.app_name}_result_queue_${index}`
      return Promise.all([
        this.channel.assertQueue(queue, {
          messageTtl: this.msg_ttl * 1000,
          expires: this.ttl * 1000
        }),
        this.channel.bindQueue(queue, this.result_exchange, String(index))
      ]).then(() => {
        this.result_queues[index] = queue
        return queue
      })
    }
  }

  getHash(string) {
    let hash = siphash.hash(this.key, string)
    let res = hash.l & 0x7FFFFFFF
    return res % this.num_queues
  }
}
