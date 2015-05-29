'use strict';

/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var ignore = require('./superagent-ignore');
var isUrl = require('./isUrl');
var transform = require('./transform');
var reduce = require('lodash.reduce');

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
 * Initialize with configurable options
 */

Direct.prototype.initialize = function(){
  // configure channels
  if (Array.isArray(this.settings.directChannels)) {
    this.channels = this.settings.directChannels;
  }

  // configure endpoint
  var endpoint = this.settings.endpoint;
  if (isTemplateString(endpoint)) {
    this.endpoint = render(endpoint, this.settings);
  }
};

/**
 * Test whether endpoint is configurable
 */

var isTemplateString = function(str) {
    return (/\{\{\ *(\w+) *\}\}/).test(str);
};

/**
 * Render configurable endpoint
 */

var render = function(template, locals) {
  return reduce(locals, function(template, local, key) {
    var rLocal = new RegExp('\\{\\{ *(' + key + ') *\\}\\}', 'g');
    return template.replace(rLocal, local);
  }, template);
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

