'use strict';

var assert = require('assert');
var helpers = require('../lib/helpers');
var transform = require('../lib/transform');

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

  describe('transform', function(){
    it('should transform message settings', function(){
      var msg = {
        project_id: '1234',
        write_key: '4312',
        original_timestamp: '',
        settings: {
          direct : true,
          endpoint : 'https://integrations.staging-public.mailjet.com/segment/endpoint',
          apiKey : '9133a7de32351051fdb82d7c88d4b7f8',
          apiSecret : '7f9e0d734fe9cb24eab1ba044f7e5665',
          listId : '1',
          events: { hello: 'world' }
        },
        integrations: {
          Mailjet: {
            listId: '3'
          }
        }
      };
      msg = transform(msg);
      assert(msg.settings.list_id === '3');
      assert(!msg.settings.apiKey);
    });
  });
});
