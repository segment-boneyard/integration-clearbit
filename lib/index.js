'use strict';

/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var mapper = require('./mapper');

/**
 * Expose `Clearbit`
 */

var Clearbit = module.exports = integration('Clearbit')
  .endpoint('https://segment.clearbit.com/v2/events')
  .channels(['client', 'mobile', 'server'])
  .ensure('settings.apiKey')
  .mapper(mapper)
  .timeout('3s');

/**
 * Identify.
 *
 * @param {Facade} message
 * @param {Function} fn
 * @api private
 */

Clearbit.prototype.identify = function(payload, done){
  return this.post()
    .auth(this.settings.apiKey, '')
    .send(payload)
    .end(this.handle(done));
};;

