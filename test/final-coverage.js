// Final coverage test to hit remaining lines

var should = require('should');
var libxslt = require('../index');
var fs = require('fs');

var stylesheetSource = fs.readFileSync('./test/resources/cd.xsl', 'utf8');
var docSource = fs.readFileSync('./test/resources/cd.xml', 'utf8');

describe('final coverage edge case', function() {
  
  it('should handle options as second parameter with callback as third', function(done) {
    var stylesheet = libxslt.parse(stylesheetSource);
    
    // Test line 108-109: options passed as second parameter, callback as third
    stylesheet.apply(docSource, {outputFormat: 'string'}, function(err, result) {
      should.not.exist(err);
      result.should.be.type('string');
      done();
    });
  });
  
});