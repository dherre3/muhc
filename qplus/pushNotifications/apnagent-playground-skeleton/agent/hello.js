
/*!
 * Dependencies
 */

var agent = require('./_header')
  , device = require('../device');

/*!
 * Send message
 */
//Ackeems-Device <91335407 6d2b4ace 0ecb4659 2613fa27 1a9fc13a 28a62811 d1a4f02d b15ef70f>
//David's-Device <c4b30833 9d8088c9 c3f8f006 c56566c5 9d23da97 b6ed3964 daf99ca2 66a1f34c>
//John's <5560be74 0386d013 13202abe 435dc700 64660923 cf6ff2b5 6a770d4c 705c916a>
agent.createMessage()
  .device('<91335407 6d2b4ace 0ecb4659 2613fa27 1a9fc13a 28a62811 d1a4f02d b15ef70f>')
  .alert('Hello my name is David Herrera, push notifications for the win. I hope you like it!!!')
  .send();
