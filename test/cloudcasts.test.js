var Promise = require('promise');

var Lab = require('lab');
var lab = exports.lab = Lab.script();

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

  it('should receive a username', function (done) {
    http.get('/ntsradio/cloudcasts/').reply(200, {});

    expect(function(){
      mixcloud.cloudcasts();
      mixcloud.cloudcasts(1);
      mixcloud.cloudcasts([]);
      mixcloud.cloudcasts({});
      mixcloud.cloudcasts('');
    }).to.throw();

    expect(function(){
      mixcloud.cloudcasts('ntsradio');
    }).to.not.throw();

    done();
  });

  it("should return a promise", function(done){
    http.get('/ntsradio/cloudcasts/').reply(200, {});

    var req = mixcloud.cloudcasts('ntsradio');

    expect(req).to.be.an.instanceOf(Promise);
    done();
  });
});
