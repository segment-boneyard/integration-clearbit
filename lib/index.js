'use strict';

/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var ignore = require('./superagent-ignore');
var isUrl = require('./isUrl');
var transform = require('./transform');

/**
 * Expose `Direct`
 */

var Direct = module.exports = integration('Direct')
  .timeout('3s')
  .channels(['client', 'mobile', 'server'])
  .ensure('settings.apiKey')
  .ensure(function(_, settings){
    if (!isUrl(settings.endpoint)) {
      return this.invalid('"endpoint" must be a valid url, got "%s"', settings.endpoint);
    }
  });

/**
 * Initialize with configurable channels
 */

Direct.prototype.initialize = function(){
  if (Array.isArray(this.settings.directChannels)) {
    this.channels = this.settings.directChannels;
  }
};

/**
 * Request.
 *
 * @param {Facade} message
 * @param {Function} fn
 * @api private
 */

var request = function(message, done){
  return this
    .post(this.settings.endpoint)
    .auth(this.settings.apiKey, this.settings.apiSecret || '')
    .type('json')
    .send(transform(message.json()))
    .parse(ignore)
    .end(this.handle(done));
};

/**
 * Map methods.
 */

Direct.prototype.alias = request;
Direct.prototype.group = request;
Direct.prototype.identify = request;
Direct.prototype.page = request;
Direct.prototype.screen = request;
Direct.prototype.track = request;
