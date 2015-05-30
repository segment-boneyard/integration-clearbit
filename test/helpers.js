'use strict';

var assert = require('assert');
var helpers = require('../lib/helpers');

describe('Helpers', function(){

  describe('renderTemplate', function(){
    it('should render endpoint', function(){
      assert(helpers.renderTemplate('http://{{ subdomain }}.localhost:4000', { subdomain: 'segment' }) === 'http://segment.localhost:4000');
    });
  });

  describe('isTemplateString', function(){
    it('should validate correct template format', function(){
      assert(helpers.isTemplateString('http://{{ subdomain }}.localhost:4000') === true);
    });

    it('should validate template format with no whitespaces', function(){
      assert(helpers.isTemplateString('http://{{subdomain}}.localhost:4000') === true);
    });

    it('should validate template format with many whitespaces', function(){
      assert(helpers.isTemplateString('http://{{  subdomain  }}.localhost:4000') === true);
    });

    it('should invalidate incorrect template format', function(){
      assert(helpers.isTemplateString('http://{{ sub domain }}.localhost:4000') === false);
    });
  });

  describe('isUrl', function(){
    it('should validate correct url', function(){
      assert(helpers.isUrl('http://localhost:4000'));
    });

    it('should invalidate incorrect url', function(){
      assert(helpers.isUrl('http://{{ subdomain }}.localhost:4000') === false);
    });
  });
});
