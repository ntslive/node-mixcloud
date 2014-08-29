var Promise = require('promise');

var Lab = require('lab');
var lab = exports.lab = Lab.script();

var beforeEach = lab.beforeEach;
var describe = lab.describe;
var it = lab.it;
var expect = Lab.expect;

// Overriding web requests:
var nock = require('nock');
var http = nock('https://api.mixcloud.com');
// Prevent external connections via Nock
nock.disableNetConnect();

var request = require('../lib/request');

var successFn = function(){
  return "success";
};

describe('request', function() {

  it('should throw an error if less than two arguments are passed in', function(done) {
    expect(function(){
      request();
      request('GET');  
    }).to.throw();

    done();
  });

  it('should return a Promise', function(done) {
    var value = request('GET', '/');

    expect(value).to.be.an.instanceOf(Promise);
    done();
  });

  it('should reject the promise if the response is not valid json', function(done) {
    // This is the actual mixcloud response:
    http.get('/').reply(200, "{'test': ", {
      'Content-Type': 'text/plain'
    });

    request('GET', '/')
      .then(successFn, function(error){
        expect(error.name).to.equal('BadResponse');
        expect(error.message).to.contain('JSON');
        expect(error.payload.body).to.equal("{'test': ");

        return "error";
      })
      .then(function(state){
        expect(state).to.equal("error");
        done();
      });
  });

  it('should reject the promise if the response is a Rate Limit Exceeded Error', function(done) {
    // This is the actual mixcloud response:
    http.get('/').reply(403, {
      "error": {
        "message": "You have hit your rate limit. Retry after 452 seconds.", 
        "type": "RateLimitException", 
        "retry_after": 452
      }
    }, {
      'Retry-After': 452
    });

    request('GET', '/')
      .then(successFn, function(error){
        expect(error.name).to.equal('RateLimited');
        expect(error.message).to.equal('You have hit your rate limit. Retry after 452 seconds.');

        expect(error.payload).to.have.keys('retry_after', 'retry');
        expect(error.payload.retry_after).to.equal(452);
        expect(error.payload.retry).to.be.a('function');

        var res = error.payload.retry();
        expect(res).to.be.an.instanceOf(Promise);

        return "error";
      })
      .then(function(state){
        expect(state).to.equal("error");
        done();
      });
  });

  it('should reject the promise if the response status code is 400', function(done) {
    // This is the actual mixcloud response:
    http.get('/').reply(400, {});

    request('GET', '/')
      .then(successFn, function(error){
        expect(error.name).to.equal('Unauthorized');

        return "error";
      })
      .then(function(state){
        expect(state).to.equal("error");
        done();
      });
  });

});
