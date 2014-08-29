var Promise = require('promise');
var request = require('request');
var hoek = require('hoek');

var schema = require('./schema');
var createError = require('./create-error');
var formatUrl = require('./format-url');

function makePromisedRequest(options){
  return new Promise(function(resolve, reject){
    request(options, function(error, response){
      if(error){
        reject(error);
      }else{
        resolve(response);
      }
    });
  });
}


module.exports = function makeRequest(method, path, params) {
  if(arguments.length < 2) {
    throw createError('ArgumentError', '#request requires at least `method` and `path` / `url` arguments.');
  }

  var url;
  if(/^http(s)?/.test(path)){
    url = path;
  }else{
    url = formatUrl(path, params);
  }

  return makePromisedRequest({
    method: method,
    url: url
  })
    .then(function(response){
      try {
        response.body = JSON.parse(response.body);
      } catch(e){
        throw createError('BadResponse', 'Received invalid JSON from Server', response);
      }

      return response;
    })
    .then(function(response){
      var status = response.statusCode;
      var json = response.body;

      if(status === 403 && hoek.reach(json, 'error.type') === 'RateLimitException') {
        throw createError('RateLimited', json.error.message, {
          retry_after: json.error.retry_after,
          retry: function(){
            return makeRequest(method, path, params);
          }
        });
      }

      if(status === 400) {
        throw createError('Unauthorized', 'Some sort of authentication error', response);
      }

      return response;
    });
}
