var siphash = require("siphash")
var amqp    = require('amqplib');
var consts  = require("./consts")

export class SyRPCBase {
  /**
   * Creates the SyRPC class
   *
   * app_name        (mandatory) Every server this the same app name
   *                             must support the same request-types
   * amq_host        (mandatory)
   * amq_virtualhost (optional)
   * amq_user        (optional)
   * amq_password    (optional)
   * amq_transport   (optional) Not supported with js
   * amq_ttl         (optional) Time to live for queues
   * amq_msg_ttl     (optional) Time to live for messages
   * amq_num_queues  (optional) Number of queue (default 64)
   * msg_encoding    (optional) Default utf-8
   *
   * @constructor
   * @param {settings} Settings object with fields  as above
   */
  constructor(settings) {
    this.app_name = settings.app_name
    this.host = settings.amq_host
    if ('amq_virtualhost' in settings) {
      this.virtualhost = settings.amq_virtualhost
    } else {
      this.virtualhost = consts.VIRTUALHOST
    }
    if ('amq_user' in settings) {
      this.user = settings.amq_user
    } else {
      this.user = "guest"
    }
    if ('amq_password' in settings) {
      this.password = settings.amq_password
    } else {
      this.password = "guest"
    }
    if ('amq_transport' in settings) {
      this.transport = settings.amq_transport
    } else {
      this.transport = null
    }
    if ('amq_ttl' in settings) {
      this.ttl = settings.amq_ttl
    } else {
      this.ttl = consts.TTL
    }
    if ('amq_msg_ttl' in settings) {
      this.msg_ttl = settings.amq_msg_ttl
    } else {
      this.msg_ttl = consts.MSG_TTL
    }
    if ('amq_num_queues' in settings) {
      this.num_queues = settings.amq_num_queues
    } else {
      this.num_queues = consts.NUM_QUEUES
    }
    if ('msg_encoding' in settings) {
      this.msg_encoding = settings.msg_encoding
    } else {
      this.msg_encoding = consts.ENCODING
    }
    this.key = siphash.string16_to_key(consts.HASH)
    this.result_queues = {}
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
        var req = this.request
        this.result_exchange = `${this.app_name}_result_exchange`
        return Promise.all([
          ch.assertExchange(req),
          ch.assertQueue(req, {autoDelete: true}),
          ch.bindQueue(req, req, req),
          ch.assertExchange(this.result_exchange)
        ]) 
      })
  }

  assert_result_queue(index) {
    if (index in this.result_queues) {
      return new Promise(function(resolve, reject) {
        resolve(this.result_queues[index])
      })
    } else {
      var queue = `${this.app_name}_result_queue_${index}`
      console.log("1")
      return Promise.all([
        this.channel.assertQueue(queue, {
          messageTtl: this.msg_ttl * 1000,
          expires: this.ttl * 1000
        }),
        this.channel.bindQueue(queue, this.result_exchange, String(index))
      ]).then(none => {
        console.log("2")
        this.result_queues[index] = queue
        return queue
      })
    }
  }

  get_hash(string) {
    var hash = siphash.hash(this.key, string)
    var res = hash.l & 0x7FFFFFFF
    return res % this.num_queues
  }
}
