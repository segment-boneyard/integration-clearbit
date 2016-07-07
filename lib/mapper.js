'use strict';

var compose = require('lodash.compose');
var omit = require('lodash.omit');
var toSnakeCase = require('to-snake-case');
var is = require('is');
var foldl = require('@ndhoule/foldl');
var extend = require('extend');

/**
 * Converts all keys on an object to `snake_case`
 *
 * @param {Object} obj
 * @return {Object}
 */

var snakeize = function(obj) {

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
 * *Note* this is an identical transform to direct integrations
 * less the removal of the write key
 *
 * @param {Object} obj
 * @return {Object}
 */

var removeSettings = function(obj) {
  var settings = obj.settings;
  if (!settings || !is.object(settings)) return obj;
  obj.settings = omit(obj.settings, [
    'apiKey',
    'apiSecret',
    'direct',
    'directChannels',
    'endpoint',
    'subdomain'
  ]);
  if (is.empty(obj.settings)) obj = omit(obj, 'settings');
  return obj;
};

/**
 * Merges call-time options in integrations.Partner
 * with message.settings, where call-time options
 * override defaults
 *
 * @param {Object} obj
 * @return {Object}
 */

var mergeSettings = function(message) {
  var integrations = message.integrations;
  if (!is.object(integrations)) return message;
  var name = Object.keys(integrations)[0];
  if (name) extend(message.settings, integrations[name]);
  return message;
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
 * Returns the JSON of the message
 */

var messageToJSON = function(msg) {
  return msg.json();
}

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
    del('integrations'),
    snakeize,
    removeSettings,
    mergeSettings,
    messageToJSON
);


/**
 * Exports.
 */

exports.identify = transform;
