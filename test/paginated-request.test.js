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

var paginatedRequest = require('../lib/paginated-request');

var date = new Date(1409137680000);
var dateString = '2014-08-27%2012%3A08%3A00';

var successFn = function(){
  return "success";
};

describe('paginatedRequest', function() {

  // Make sure to clean out any registered Nock handles after each go:
  beforeEach(function(next) {
    nock.cleanAll();
    next();
  });

  it('should accept a path argument', function (done) {
    http.get('/list').reply(200, { data: [], paging: {} });

    expect(function(){
      paginatedRequest('/list');
    }).to.not.throw();

    done();
  });

  it('should return a promise', function (done) {
    http.get('/list').reply(200, { data: [], paging: {} });

    var result = paginatedRequest('/list');

    expect(result).to.be.an.instanceOf(Promise);
    done();
  });

  it('should throw on invalid path argument', function(done) {
    http.get('/').reply(200);

    expect(function(){
      paginatedRequest('/');
    }).to.not.throw();

    expect(function(){
      paginatedRequest();
      paginatedRequest('');
      paginatedRequest(1);
      paginatedRequest({ limit: 10 });
    }).to.throw();

    done();
  })

  it('should throw errors on invalid arguments', function (done) {
    http.get('/list').reply(200, { data: [], paging: {} });

    expect(function(){
      // Invalid limit:
      paginatedRequest('/', { limit: '1' });
      paginatedRequest('/', { limit: -1 });
      paginatedRequest('/', { limit: 0 });
      paginatedRequest('/', { limit: 101 });

      // Invalid until:
      paginatedRequest('/', { until: '1' });
      paginatedRequest('/', { until: false });
      paginatedRequest('/', { until: '2014-08-27' });

      // Invalid since:
      paginatedRequest('/', { since: '1' });
      paginatedRequest('/', { since: false });
      paginatedRequest('/', { since: '2014-08-27' });

      // Invalid due to both until and since being present:
      paginatedRequest('/', { since: date, until: date });      
    }).to.throw();

    done();
  });

  it("should reject on request error", function(done){
    paginatedRequest('/')
      .then(null, function(error){
        // This is as we've not setup the http mock
        expect(error.name).to.equal("NetConnectNotAllowedError");
        done();
      });
  })

  it('should reject the promise if the response status code is not 200', function(done) {
    // This is the actual mixcloud response:
    http.get('/list').reply(201, {});

    paginatedRequest('/list')
      .then(successFn, function(error){
        expect(error.name).to.equal('BadResponse');
        expect(error.message).to.contain('status code');
        expect(error.payload).to.be.a('object');
        expect(error.payload.body).to.be.a('object');

        return "error";
      })
      .then(function(state){
        expect(state).to.equal("error");
        done();
      });
  });

  it('should reject the promise if `data` is missing', function(done) {
    // This is the actual mixcloud response:
    http.get('/list').reply(200, {});

    paginatedRequest('/list')
      .then(successFn, function(error){
        expect(error.name).to.equal('BadResponse');
        expect(error.message).to.contain('`data`');
        expect(error.payload).to.be.a('object');
        expect(error.payload.body).to.be.a('object');

        return "error";
      })
      .then(function(state){
        expect(state).to.equal("error");
        done();
      });
  });

  it('should reject the promise if `data` is not an Array', function(done) {
    // This is the actual mixcloud response:
    http.get('/list').reply(200, { data: {} });

    paginatedRequest('/list')
      .then(successFn, function(error){
        expect(error.name).to.equal('BadResponse');
        expect(error.message).to.contain('`data`');
        expect(error.payload).to.be.a('object');
        expect(error.payload.body).to.be.a('object');

        return "error";
      })
      .then(function(state){
        expect(state).to.equal("error");
        done();
      });
  });

  it('should resolve the promise if `paging` does not exist', function(done) {
    // This is the actual mixcloud response:
    http.get('/list').reply(200, { data: [] });

    paginatedRequest('/list').then(function(res) {
      expect(res.results).to.be.a('array');
      expect(res.results).to.be.empty;

      expect(res.pagination.next).to.be.null;
      expect(res.pagination.previous).to.be.null;

      done();
    });
  });

  it('should reject the promise if `paging` is not an Object', function(done) {
    // This is the actual mixcloud response:
    http.get('/list').reply(200, { data: [], paging: null });

    paginatedRequest('/list')
      .then(successFn, function(error){
        expect(error.name).to.equal('BadResponse');
        expect(error.message).to.contain('`paging`');
        expect(error.payload).to.be.a('object');
        expect(error.payload.body).to.be.a('object');

        return "error";
      })
      .then(function(state){
        expect(state).to.equal("error");
        done();
      });
  });

  describe('accepting pagination options', function(){
    it('should handle `limit`', function (done) {
      http.get('/list?limit=10').reply(200, { data: [], paging: {} });

      paginatedRequest('/list', { limit: 10 }).then(function() {
        done();
      });
    });

    it('should handle `since` as a Date instance', function (done) {
      http.get('/list?since=' + dateString).reply(200, { data: [], paging: {} });

      paginatedRequest('/list', { since: date }).then(function(){
        done();
      });
    });

    it('should handle `until` as a Date instance', function (done) {
      http.get('/list?until=' + dateString).reply(200, { data: [], paging: {} });

      paginatedRequest('/list', { until: date }).then(function(){
        done();
      });
    });

    it('should handle `since` as a Number', function (done) {
      http.get('/list?since=' + dateString).reply(200, { data: [], paging: {} });

      paginatedRequest('/list', { since: 1409137680000 }).then(function(){
        done();
      });
    });

    it('should handle `until` as a Number', function (done) {
      http.get('/list?until=' + dateString).reply(200, { data: [], paging: {} });

      paginatedRequest('/list', { until: 1409137680000 }).then(function(){
        done();
      });
    });

    it('should handle `since` as a String', function (done) {
      http.get('/list?since=' + dateString).reply(200, { data: [], paging: {} });

      paginatedRequest('/list', { since: dateString }).then(function(){
        done();
      });
    });

    it('should handle `until` as a String', function (done) {
      http.get('/list?until=' + dateString).reply(200, { data: [], paging: {} });

      paginatedRequest('/list', { until: dateString }).then(function(){
        done();
      });
    });

    it('should handle `since` as an ISO String', function (done) {
      http.get('/list?since=' + dateString).reply(200, { data: [], paging: {} });

      paginatedRequest('/list', { since: "2014-08-27T11:08:00.000Z" }).then(function(){
        done();
      });
    });

    it('should handle `until` as an ISO String', function (done) {
      http.get('/list?until=' + dateString).reply(200, { data: [], paging: {} });

      paginatedRequest('/list', { until: "2014-08-27T11:08:00.000Z" }).then(function(){
        done();
      });
    });
  });


  describe('pagination methods', function(){
    // Make sure to clean out any registered Nock handles after each go:
    beforeEach(function(next) {
      nock.cleanAll();
      next();
    });

    it('should handle a response with pagination', function (done) {
      http.get('/list').reply(200, {
        paging: {
          previous: "https://api.mixcloud.com/list?since=2014-08-27+12%3A51%3A41&limit=20",
          next: "https://api.mixcloud.com/list?until=2014-08-27+12%3A51%3A41&limit=20"
        },
        data: []
      });

      paginatedRequest('/list').then(function (res) {
        expect(res.pagination.next).to.be.a('function');
        expect(res.pagination.previous).to.be.a('function');
        expect(res.pagination.nextUrl).to.be.a('string');
        expect(res.pagination.previousUrl).to.be.a('string');

        done();
      });
    });


    it('should handle a response without pagination', function (done) {
      http.get('/list').reply(200, {
        paging: {
          previous: null,
          next: null
        },
        data: []
      });

      paginatedRequest('/list').then(function (res) {
        expect(res.pagination.next).to.be.null;
        expect(res.pagination.previous).to.be.null;

        done();
      });
    });

    it('should handle a response without pagination#next', function (done) {
      http.get('/list').reply(200, {
        paging: {
          previous: "https://api.mixcloud.com/list?since=2014-08-27+12%3A51%3A41&limit=20",
          next: null
        },
        data: []
      });

      paginatedRequest('/list').then(function (res) {
        expect(res.pagination.next).to.be.null;
        expect(res.pagination.previous).to.be.a('function');

        done();
      });
    });

    it('should handle a response without pagination#previous', function (done) {
      http.get('/list').reply(200, {
        paging: {
          previous: null,
          next: "https://api.mixcloud.com/list?until=2014-08-27+12%3A51%3A41&limit=20"
        },
        data: []
      });

      paginatedRequest('/list').then(function (res) {
        expect(res.pagination.next).to.be.a('function');
        expect(res.pagination.previous).to.be.null;
        done();
      });
    });

    it('should return a promise when calling res.pagination#next', function(done){

      http
        .get('/list').reply(200, {
          paging: {
            previous: null,
            next: "https://api.mixcloud.com/list?limit=20&until=2014-08-22+14%3A28%3A03"
          },
          data: new Array(20)
        })
        .get('/list?limit=20&until=2014-08-22+14%3A28%3A03').reply(200, {
          paging: {
            previous: null,
            next: null
          },
          data: new Array(15)
        });

      paginatedRequest('/list').then(function (res) {
        var next = res.pagination.next();

        expect(res.results).to.have.length(20)
        expect(next).to.be.an.instanceOf(Promise);

        return next;
      }).then(null, console.log.bind(console)).then(function (res) {
        expect(res.results).to.have.length(15);

        done();
      });
    });

    it('should return a promise when calling res.pagination#previous', function(done){

      http
        .get('/list').reply(200, {
          paging: {
            previous: "https://api.mixcloud.com/list?limit=20&until=2014-08-22+14%3A28%3A03",
            next: null
          },
          data: new Array(20)
        })
        .get('/list?limit=20&until=2014-08-22+14%3A28%3A03').reply(200, {
          paging: {
            previous: null,
            next: null
          },
          data: new Array(15)
        });

      paginatedRequest('/list').then(function (res) {
        var next = res.pagination.previous();

        expect(res.results).to.have.length(20)
        expect(next).to.be.an.instanceOf(Promise);

        return next;
      }).then(function (res) {
        expect(res.results).to.have.length(15);

        done();
      });
    });
  });
})
