'use strict';

/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var transform = require('./transform');
var helpers = require('./helpers');

/**
 * Expose `Clearbit`
 */

var Clearbit = module.exports = integration('Clearbit')
  .timeout('3s')
  .channels(['client', 'mobile', 'server'])
  .ensure('settings.apiKey');

/**
 * Request.
 *
 * @param {Facade} message
 * @param {Function} fn
 * @api private
 */

var request = function(message, done){
  // allows for custom settings beyond apiKey that partners handle
  var data = message.json();
  data.settings = this.settings;

  var endpoint = this.settings.endpoint;
  var apiKey = this.settings.apiKey;
  var apiSecret = this.settings.apiSecret || '';
  var req = this.post(endpoint);

  req._callback = this.handle(done);

  if (apiKey) {
    req.auth(apiKey, apiSecret);
  }

  req.type('json');
  req.send(transform(data));
  req.parse(helpers.ignore);

  return req.end(this.handle(done));

};

/**
 * Map methods.
 */

Clearbit.prototype.alias = request;
Clearbit.prototype.group = request;
Clearbit.prototype.identify = request;
Clearbit.prototype.page = request;
Clearbit.prototype.screen = request;
Clearbit.prototype.track = request;
