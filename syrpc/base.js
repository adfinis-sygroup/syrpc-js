var siphash = require("siphash")
var consts  = require("./consts")

export class SyRPCBase {

  constructor(settings) {
    this.key = siphash.string16_to_key(consts.AMQ_HASH)
    this.num_queues = consts.AMQ_NUM_QUEUES
  }

  get_hash(string) {
    hash = siphash.hash(this.key, string)
    res = hash.l & 0x7FFFFFFF
    return res % this.num_queues
  }
}
