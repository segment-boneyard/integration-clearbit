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
    messageToJSON
);


/**
 * Exports.
 */

exports.identify = transform;
