'use strict';

/**
 * Module dependencies.
 */

var url = require('url');

/**
 * Check if the given `value` is a valid url.
 *
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

var isUrl = function(value){
  var parsed = url.parse(String(value));
  return parsed.protocol && parsed.host;
};

/**
 * Exports.
 */

module.exports = isUrl;
