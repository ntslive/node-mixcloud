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


var mixcloud = require('../');

var cloudcastFixture = require('./fixtures/cloudcast.json');
var cloudcastKey = "/NTSRadio/knee-deep-26th-august-2014/";
var cloudcastUsername = 'NTSRadio';
var cloudcastSlug = 'knee-deep-26th-august-2014';

describe('cloudcast', function () {

  // Make sure to clean out any registered Nock handles after each go:
  beforeEach(function(next) {
    nock.cleanAll();
    next();
  });

  it('should receive a key', function (done) {
    http.get(cloudcastKey).reply(200, {});

    expect(function(){
      mixcloud.cloudcast(cloudcastKey);
    }).to.not.throw();

    done();
  });

  it('should receive a username and slug', function (done) {
    http.get(cloudcastKey).reply(200, {});

    expect(function(){
      mixcloud.cloudcast(cloudcastUsername, cloudcastSlug);
    }).to.not.throw();

    done();
  });

  it("should throw on invalid arguments", function(done){
    http.get(cloudcastKey).reply(200, {});

    expect(function(){
      mixcloud.cloudcast();
      mixcloud.cloudcast(1);
      mixcloud.cloudcast([]);
      mixcloud.cloudcast({});
      mixcloud.cloudcast('', '');
      mixcloud.cloudcast('a', 'b', 'c'); // Too many args
    }).to.throw();

    done();
  });

  it("should return a promise", function(done){
    http.get(cloudcastKey).reply(200, {});

    var req = mixcloud.cloudcast(cloudcastKey);

    expect(req).to.be.an.instanceOf(Promise);
    done();
  });

  it("should resolve to the response body", function(done){
    http.get(cloudcastKey).reply(200, cloudcastFixture);

    mixcloud.cloudcast(cloudcastKey)
      .then(function(cloudcast){
        expect(cloudcast).to.deep.equal(cloudcastFixture);
        done();
      });
  });

  it("should reject on errors", function(done){
    mixcloud.cloudcast(cloudcastKey)
      .then(null, function(error){
        // This is as we've not setup the http mock
        expect(error.name).to.equal("NetConnectNotAllowedError");
        done();
      });
  })
});
