'use strict';

var compose = require('lodash.compose');
var omit = require('lodash.omit');
var toSnakeCase = require('to-snake-case');
var is = require('is');
var foldl = require('@ndhoule/foldl');
var extend = require('extend');

/**
 * Snakeize all but the integration name
 * For e.g. integrations: { Mailjet: { list_id: '1' }}
 *
 * @param {Object} obj
 * @return {Object}
 */

var snakeizeMessage = function(message) {
  return extend(snakeize(message), {
    integrations: foldl(function(integrations, integration, name) {
      integrations[name] = snakeize(integration);
      return integrations;
    }, {}, message.integrations)
  });
};

/**
 * Converts all keys on an object to `snake_case`
 *
 * @param {Object} obj
 * @return {Object}
 */

var snakeize = function(obj) {
  // return early if obj is not an object, for e.g. Salesforce: true
  if (!is.object(obj)) return obj;
  var result = {};
  var keys = Object.keys(obj);

  keys.forEach(function(key){
    if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
      result[toSnakeCase(key)] = snakeize(obj[key]);
    } else {
      result[toSnakeCase(key)] = obj[key];
    }
  });

  return result;
};

/**
 * Removes any extraneous settings from settings object
 * For e.g.
 * "settings" : {
 *  "listId": "1",
 *  "apiKey" : "WWGPDYGKaZrnEjXE6zs",
 *  "direct" : true,
    "endpoint" : "https://{{ subdomain }}.freshdesk.com/integrations/segment.json"
 * }
 *
 * becomes
 *
 * "settings" : {
 *  "listId": "1"
 * }
 *
 * `apiKey` and `apiSecret` are already sent in header
 * and fields like `direct` and `endpoint` are internal
 *
 * @param {Object} obj
 * @return {Object}
 */

var removeSettings = function(obj) {

  var integrations = obj.integrations;
  var removeableSettings = [
    'apiKey',
    'apiSecret',
    'direct',
    'endpoint',
    'subdomain'
  ];

  for (var integration in integrations) {
    if (integrations.hasOwnProperty(integration)) {
      var settings = obj.integrations[integration];

      removeableSettings.forEach(function(key){
        if (is.object(settings) && settings[key]) settings = omit(settings, key);
      });

      obj.integrations[integration] = settings;
    }
  }

  return obj;
};

/**
 * Returns a function that deletes a key at a specified `property`.
 *
 * @param {string} key
 * @return {function(obj)} Returns the object, less the property at `key`.
 */

var del = function(key){
  return function(obj){
    return omit(obj, key);
  };
};

/**
 * Run an object through a series of transforms, preparing it to be sent to a
 * partner.
 *
 * @param {Object}
 * @return {Object}
 */

var transform = compose(
    del('original_timestamp'),
    del('project_id'),
    del('write_key'),
    snakeizeMessage,
    removeSettings
);


/**
 * Exports.
 */

module.exports = transform;
