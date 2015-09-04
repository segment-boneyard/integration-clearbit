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
  // allows for custom settings beyond apiKey that partners handles
  message.settings = this.settings;

  return this
    .post(this.settings.endpoint)
    .auth(this.settings.apiKey, this.settings.apiSecret || '')
    .type('json')
    .send(transform(message.json()))
    .parse(helpers.ignore)
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
