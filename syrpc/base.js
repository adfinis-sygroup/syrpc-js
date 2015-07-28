var siphash = require("siphash")
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
      this.user = null
    }
    if ('amq_password' in settings) {
      this.password = settings.amq_password
    } else {
      this.password = null
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
  }

  get_hash(string) {
    var hash = siphash.hash(this.key, string)
    var res = hash.l & 0x7FFFFFFF
    return res % this.num_queues
  }
}
