'use strict';

var Direct = require('..');
var Test = require('segmentio-integration-tester');
var assert = require('assert');
var express = require('express');
var snakeize = require('snakeize');

describe('Direct', function(){
  var app;
  var server;
  var settings;
  var test;
  var direct;
  var types = ['track', 'identify', 'alias', 'group', 'page', 'screen'];

  beforeEach(function(done){
    app = express();
    app.use(express.bodyParser());
    server = app.listen(4000, done);
  });

  afterEach(function(done){
    server.close(done);
  });

  beforeEach(function(){
    settings = {
      apiKey: 'xyz',
      apiSecret: 'zyx',
      endpoint: 'http://localhost:4000',
      directChannels: ['server', 'mobile']
    };
    direct = new Direct(settings);
    test = new Test(direct, __dirname);
  });

  it('should have configurable settings', function(){
    test
      .name('Direct')
      .ensure('settings.apiKey')
      .channels(['server', 'mobile'])
      .timeout('3s');
  });

  describe('.validate()', function(){
    it('should be invalid if .endpoint isn\'t a url', function(){
      settings.endpoint = true;
      test.invalid({}, settings);
      settings.endpoint = '';
      test.invalid({}, settings);
      settings.endpoint = 'abc';
      test.invalid({}, settings);
    });

    it('should be invalid if .apiKey is not provided', function(){
      delete settings.apiKey;
      test.invalid({}, settings);
    });

    it('should be valid if all settings are provided', function(){
      test.valid({}, settings);
    });
  });

  types.forEach(function(type){
    describe('#' + type, function(){
      var json;

      beforeEach(function(){
        json = test.fixture(type + '-basic');
      });

      it('should succeed on valid call', function(done){
        var route = '/' + type + '/success';
        settings.endpoint += route;

        app.post(route, function(req, res){
          assert.deepEqual(req.body, snakeize(json.output));
          res.send(200);
        });

        test
          .set(settings)
          [type](json.input)
          .expects(200)
          .end(done);
      });

      it('should error on invalid calls', function(done){
        var route = '/' + type + '/error';
        settings.endpoint += route;

        app.post(route, function(req, res){
          assert.deepEqual(req.body, snakeize(json.output));
          res.send(503);
        });

        test
          .set(settings)
          [type](json.input)
          .expects(503)
          .error(done);
      });

      it('should send basic auth in the Authorization header', function(done){
        var route = '/' + type + '/success';
        settings.endpoint += route;

        app.post(route, function(req, res){
          assert.equal(typeof req.headers.authorization, 'string');

          // Decode auth header
          var creds = new Buffer(req.headers.authorization.replace('Basic ', ''), 'base64')
            .toString('utf-8')
            .split(':');
          var username = creds[0];
          var password = creds[1];

          assert.equal(username, settings.apiKey);
          assert.equal(password, settings.apiSecret);

          res.send(200);
        });

        test
          .set(settings)
          [type](json.input)
          .expects(200)
          .end(done);
      });

      it('should ignore bad reply', function(done){
        var route = '/bad';
        settings.endpoint += route;

        app.post(route, function(req, res){
          res.set('Content-Type', 'application/json');
          res.send(200, 'I lied, this is not JSON');
        });

        test
          .set(settings)
          [type](json.input)
          .expects(200)
          .end(done);
      });
    });
  });
});
