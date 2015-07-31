
SyRPC supports stateless backends using result_id.

<pre>
   ____   __ 
  |    | |==|
  |____| |  | Web Client
  /::::/ |__|
   |
   |   http get /        .-----------------------.
   |-------------------->|      Backend(0)       |
   |                     | put_request(          |         .-------------------.
   | rendered page       |    'echo',            |         |      Server       |
   | including result_id |    {'value': 'hello'} |-------->| (                 |
   |<--------------------| )                     |         |     type_,        |
   |                     '-----------------------'         |     result_id,    |
   |                                                       |     data          |
   |                                                       | ) = get_request() |
   |    ajax get /echo   .-----------------------.         |                   |
   |-------------------->|      Backend(1)       |-------->| put_request(      |
   |                     | get_result(result_id) |         |     result_id,    |
   |    echo data        |                       |         |     data          |
   |<--------------------|                       |<--------| )                 |
   |                     '-----------------------'         |                   |
   |                                                       '-------------------'
   v
</pre>

Collisions on the queues (too many rejects) are reduced by using a hash-table
of queues, by default 64 queues. The hash module 64 of the result_id is used to
identify the result_queue. This makes SyRPC compatible with 12 Factor
Applications but has still quite good performance.
