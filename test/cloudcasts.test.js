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

describe('cloudcasts', function () {

  // Make sure to clean out any registered Nock handles after each go:
  beforeEach(function(next) {
    nock.cleanAll();
    next();
  });

  it('should receive a username', function (done) {
    http.get('/ntsradio/cloudcasts/').reply(200, {});

    expect(function(){
      mixcloud.cloudcasts('ntsradio');
    }).to.not.throw();

    done();
  });

  it("should throw on invalid arguments", function(done){
    http.get('/ntsradio/cloudcasts/').reply(200, {});

    expect(function(){
      mixcloud.cloudcasts();
      mixcloud.cloudcasts(1);
      mixcloud.cloudcasts([]);
      mixcloud.cloudcasts({});
      mixcloud.cloudcasts('');
    }).to.throw();

    done();
  });

  it("should return a promise", function(done){
    http.get('/ntsradio/cloudcasts/').reply(200, {});

    var req = mixcloud.cloudcasts('ntsradio');

    expect(req).to.be.an.instanceOf(Promise);
    done();
  });

  it("should resolve to a paginated response value", function(done){
    http.get('/ntsradio/cloudcasts/').reply(200, { data: [], paging: {} });

    mixcloud.cloudcasts('ntsradio').then(function(response){
      expect(response).to.have.keys('results', 'pagination');
      // expect(response.results).to.have.lengthOf(0);

      done();
    })
  })
});
