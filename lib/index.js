'use strict';

/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var transform = require('./transform');
var helpers = require('./helpers');

/**
 * Expose `Direct`
 */

var Direct = module.exports = integration('Direct')
  .timeout('3s')
  .channels(['client', 'mobile', 'server'])
  .ensure('settings.apiKey')
  // TODO: verify all template placeholders are present on the `settings` object
  .ensure(function(_, settings){
    if (!helpers.isUrl(settings.endpoint)) {
      return this.invalid('"endpoint" must be a valid url, got "%s"', settings.endpoint);
    }
  });

/**
 * Initialize with configurable options
 */

Direct.prototype.initialize = function(){
  // configure channels
  if (Array.isArray(this.settings.directChannels)) {
    this.channels = this.settings.directChannels;
  }

  // configure endpoint
  // TODO: set endpoint on prototype and not settings
  var endpoint = this.settings.endpoint;
  if (helpers.isTemplateString(endpoint)) {
    this.settings.endpoint = helpers.renderTemplate(endpoint, this.settings);
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

Direct.prototype.alias = request;
Direct.prototype.group = request;
Direct.prototype.identify = request;
Direct.prototype.page = request;
Direct.prototype.screen = request;
Direct.prototype.track = request;
