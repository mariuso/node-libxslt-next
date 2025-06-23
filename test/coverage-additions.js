// Additional tests to improve code coverage

var should = require('should');
var libxslt = require('../index');
var fs = require('fs');

var stylesheetSource = fs.readFileSync('./test/resources/cd.xsl', 'utf8');
var docSource = fs.readFileSync('./test/resources/cd.xml', 'utf8');

describe('coverage improvements', function() {
  
  describe('parameter handling edge cases', function() {
    it('should handle only callback parameter (no params, no options)', function(done) {
      var stylesheet = libxslt.parse(stylesheetSource);
      // Test line 111-114: callback as second parameter 
      stylesheet.apply(docSource, function(err, result) {
        should.not.exist(err);
        result.should.be.type('string');
        done();
      });
    });
    
    it('should handle non-string parameters without wrapping', function() {
      var stylesheet = libxslt.parse(stylesheetSource);
      var doc = libxslt.libxmljs.parseXml(docSource);
      
      // Test line 124: non-string parameter handling
      var result = stylesheet.apply(doc, {
        stringParam: 'test',
        numberParam: 42,          // This should hit line 124
        booleanParam: true        // This should hit line 124  
      });
      result.should.be.type('object');
    });
  });
  
  describe('error handling edge cases', function() {
    it('should throw error synchronously for invalid XML without callback', function() {
      var stylesheet = libxslt.parse(stylesheetSource);
      
      // Test line 143-144: synchronous error throwing
      (function() {
        stylesheet.apply('invalid xml content');
      }).should.throw();
    });
    
    it('should return error via callback for invalid XML with callback', function(done) {
      var stylesheet = libxslt.parse(stylesheetSource);
      
      // Test line 143: callback error handling
      stylesheet.apply('invalid xml content', function(err, result) {
        should.exist(err);
        should.not.exist(result);
        done();
      });
    });
  });
  
  describe('options parameter variations', function() {
    it('should handle options as third parameter with callback', function(done) {
      var stylesheet = libxslt.parse(stylesheetSource);
      
      // Test line 107-109: options as third parameter
      stylesheet.apply(docSource, {}, {outputFormat: 'string'}, function(err, result) {
        should.not.exist(err);
        result.should.be.type('string');
        done();
      });
    });
  });
});