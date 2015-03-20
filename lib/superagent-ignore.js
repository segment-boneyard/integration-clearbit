'use strict';

/**
 * No operation.
 *
 * @return {void}
 */

var noop = function(){};

/**
 * Ignore is a Superagent (which segmentio-integration uses under the hood)
 * parser to just completely ignore the response from the webhook request. This
 * is ideal because we can't rely on content-type header for parsing and more
 * importantly we don't really want to parse an unbound amount of data that the
 * request could respond with.
 *
 * @param {Response} res
 * @param {Function} fn
 */

var ignore = function(res, done){
  res.text = '';
  res.on('data', noop);
  res.on('end', done);
};

/**
 * Exports.
 */

module.exports = ignore;
