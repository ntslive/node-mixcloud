var expect = require('expect');
var nock = require('nock');

var mixcloud = require('../');

var fakeItem = require('./fixtures/cloudcast-item');
var fakeDate = new Date(1409140301000);
var fakePaging = {
  "previous": "https://api.mixcloud.com/ntsradio/cloudcasts/?since=2014-08-27+12%3A51%3A41&limit=20",
  "next": "https://api.mixcloud.com/ntsradio/cloudcasts/?limit=20&until=2014-08-22+14%3A28%3A03"
};

// Override http requests.
var http = nock('https://api.mixcloud.com');

suite('GET user/cloudcasts', function () {

  test('no parameters', function (done) {

    http.get('/ntsradio/cloudcasts/').reply(200, {
      "paging": fakePaging,
      "data": (new Array(20)).map(function(){ return fakeItem; }),
      "name": "NTS Radio's Cloudcasts"
    });

    mixcloud.cloudcasts('ntsradio').then(function (res) {
      expect(res.results.length).toBe(20);
      expect(res.pagination.next).toBeA(Function);
      expect(res.pagination.previous).toBeA(Function);
      done();
    });
  });

  test('with limit parameter', function (done) {

    http.get('/ntsradio/cloudcasts/?limit=3').reply(200, {
      "paging": fakePaging,
      "data": (new Array(3)).map(function(){ return fakeItem; }),
      "name": "NTS Radio's Cloudcasts"
    });

    mixcloud.cloudcasts('ntsradio', { limit: 3 }).then(function (res) {
      expect(res.results.length).toBe(3);
      done();
    });
  });

  test('with since parameter', function (done) {

    http.get('/ntsradio/cloudcasts/?since=2014-08-27%2012%3A08%3A00').reply(200, {
      "paging": fakePaging,
      "data": new Array(20),
      "name": "NTS Radio's Cloudcasts"
    });

    mixcloud.cloudcasts('ntsradio', { since: fakeDate }).then(function (res) {
      done();
    });
  });

  test('with until parameter', function (done) {

    http.get('/ntsradio/cloudcasts/?until=2014-08-27%2012%3A08%3A00').reply(200, {
      "paging": fakePaging,
      "data": new Array(20),
      "name": "NTS Radio's Cloudcasts"
    });

    mixcloud.cloudcasts('ntsradio', { until: fakeDate }).then(function (res) {
      done();
    });
  });

  test('response without paging.next', function (done) {

    http.get('/ntsradio/cloudcasts/').reply(200, {
      "paging": {
        "previous": "https://api.mixcloud.com/ntsradio/cloudcasts/?since=2014-08-27+12%3A51%3A41&limit=20",
        "next": null
      },
      "data": new Array(20),
      "name": "NTS Radio's Cloudcasts"
    });

    mixcloud.cloudcasts('ntsradio').then(function (res) {
      expect(res.pagination.next).toBe(null);
      expect(res.pagination.previous).toBeA(Function);
      done();
    });
  });

  test('response without paging.previous', function (done) {

    http.get('/ntsradio/cloudcasts/').reply(200, {
      "paging": {
        "previous": null,
        "next": "https://api.mixcloud.com/ntsradio/cloudcasts/?until=2014-08-27+12%3A51%3A41&limit=20"
      },
      "data": new Array(20),
      "name": "NTS Radio's Cloudcasts"
    });

    mixcloud.cloudcasts('ntsradio').then(function (res) {
      expect(res.pagination.next).toBeA(Function);
      expect(res.pagination.previous).toBe(null);
      done();
    });
  });

  test('pagination', function (done) {

    http
      .get('/ntsradio/cloudcasts/').reply(200, {
        "paging": {
          "previous": null,
          "next": "https://api.mixcloud.com/ntsradio/cloudcasts/?limit=20&until=2014-08-22+14%3A28%3A03"
        },
        "data": new Array(20),
        "name": "NTS Radio's Cloudcasts"
      })
      .get('/ntsradio/cloudcasts/?limit=20&until=2014-08-22+14%3A28%3A03').reply(200, {
        "paging": fakePaging,
        "data": new Array(15),
        "name": "NTS Radio's Cloudcasts"
      })

    mixcloud.cloudcasts('ntsradio').then(function (res) {
      return res.pagination.next();
    }).then(function (res) {
      expect(res.results.length).toBe(15)
      done();
    });
  });
});
