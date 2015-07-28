
module.exports = {
    ENCODING             : 'utf-8',
    APP_NAME             : 'syrpc',
    NUM_WORKERS          : 2,
    VIRTUALHOST          : '/',
    TTL                  : 3 * 60 * 60,  /* 3 hours */
    MSG_TTL              : 10,
    NUM_QUEUES           : 64,
    MSG_TYPE             : 'application/json',
    REQUEST_NAME         : '{0}_request',
    RESULT_EXCHANGE_NAME : '{0}_result_exchange',
    RESULT_EXCHANGE_TYPE : 'direct',
    RESULT_QUEUE_NAME    : '{0}_result_queue_{1}',
    HASH                 : "EdaeYa6eesh3ahSh",
    NUM_QUEUES           : 64
}
