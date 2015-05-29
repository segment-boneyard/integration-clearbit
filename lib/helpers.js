'use strict';

/**
 * Module dependencies.
 */

var url = require('url');
var reduce = require('lodash.reduce');

/**
 * Ignore is a Superagent (which segmentio-integration uses under the hood)
 * parser to just completely ignore the response from the webhook request. This
 * is ideal because we can't rely on content-type header for parsing and more
 * importantly we don't really want to parse an unbound amount of data that the
 * request could respond with.
 *
 * TODO: we should probably read the responses for partners after v1.
 *
 * @param {Response} res
 * @param {Function} fn
 */

exports.ignore = function(res, done){
  res.text = '';
  res.setEncoding('utf8')
  res.on('data', function(chunk){
    res.text += chunk
  });
  res.on('end', done);
};

/**
 * Check if the given `value` is a valid url.
 *
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

exports.isUrl = function(value){
  var parsed = url.parse(String(value));
  return Boolean(parsed.protocol && parsed.host);
};

/**
 * Test whether endpoint is configurable
 */

var regex = /\{\{ *(\w+) *\}\}/;

exports.isTemplateString = function(str) {
  return regex.test(str);
};

/**
 * Render configurable endpoint
 */

exports.renderTemplate = function(template, locals) {
  return reduce(locals, function(template, local, key) {
    var rLocal = new RegExp('\\{\\{ *(' + key + ') *\\}\\}', 'g');
    return template.replace(rLocal, local);
  }, template);
};
