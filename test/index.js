'use strict';

var Clearbit = require('..');
var Test = require('segmentio-integration-tester');
var assert = require('assert');
var snakeize = require('snakeize');
var mapper = require('../lib/mapper');

describe('Clearbit', function(){
  var settings;
  var test;
  var clearbit;
  var types = ['identify'];

  beforeEach(function(){
    settings = {
      apiKey: 'xyz',
    };
    clearbit = new Clearbit(settings);
    test = new Test(clearbit, __dirname);
    test.mapper(mapper);
  });


  describe('.validate()', function(){
    it('should be valid if all settings are provided', function(){
      test.valid({}, settings);
    });

    it('should be invalid without API key', function(){
      delete settings.apiKey;
      test.invalid({}, settings);
    });
  });

  types.forEach(function(type){
    describe('#' + type, function(){
      var json;

      beforeEach(function(){
        json = test.fixture(type + '-basic');
      });

      it('should transform the call properly', function() {
        test.maps(type + '-basic');
      });

      it('should succeed', function(done){
        test
          .set(settings)
          [type](json.input)
          .expects(200)
          .end(done);
      });
    });
  });
});
