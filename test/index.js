'use strict';

var Clearbit = require('..');
var Test = require('segmentio-integration-tester');
var assert = require('assert');
var express = require('express');
var snakeize = require('snakeize');

describe('Clearbit', function(){
  var app;
  var server;
  var settings;
  var test;
  var clearbit;
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
      endpoint: 'http://localhost:4000'
    };
    clearbit = new Clearbit(settings);
    test = new Test(clearbit, __dirname);
  });

  describe('configuration', function(){
    it('should have configurable channels', function(){
      test
        .name('Clearbit')
        .ensure('settings.apiKey')
        .channels(['server', 'mobile', 'client'])
        .timeout('3s');
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
          assert.deepEqual(req.body, json.output);
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
          assert.deepEqual(req.body, json.output);
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

      it('should not send auth header if apiKey not provided', function(done){
        var route = '/' + type + '/success';
        settings.endpoint += route;
        delete settings.apiKey;

        app.post(route, function(req, res){
          assert(!req.headers.authorization);
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
