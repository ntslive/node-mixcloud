var Lab = require('lab');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;
var expect = Lab.expect;

var formatUrl = require('../lib/format-url');

describe('formatUrl', function() {

  it('should accept just a path', function(done){
    expect(function(){
      formatUrl('/foo');
    }).to.not.throw();

    expect(formatUrl('/foo/bar')).to.equal('https://api.mixcloud.com/foo/bar');

    done();
  });

  it('should accept a path string and params object', function(done){
    expect(function(){
      formatUrl('/foo/bar', { limit: 50 });
    }).to.not.throw();

    expect(formatUrl('/foo/bar', { limit: 50 })).to.equal('https://api.mixcloud.com/foo/bar?limit=50');
    expect(formatUrl('/foo/bar', { limit: 50, offset: 10 })).to.equal('https://api.mixcloud.com/foo/bar?limit=50&offset=10');

    done();
  });
})
