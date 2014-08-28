var Promise = require('promise');
var moment = require('moment')
var request = require('request');

var formatUrl = require('./format-url');

module.exports = function paginatedRequest(path, options){
  var params = {};

  if(!options){
    options = {};
  }

  if(options.limit){
    if(typeof options.limit !== 'number' || (options.limit < 0 && options.limit > 100)) {
      throw new Error('The `limit` parameter must be a number between 0 and 100 (inclusive).')
    }

    params.limit = options.limit;
  }

  if(options.since && options.until){
    throw new Error('Only one of `since` or `until` parameters must be specified');
  }

  if(options.since){
    if(typeof options.since !== 'number' && !(options.since instanceof Date)){
      throw new Error('The `since` parameter must be an instance of Date or Number');
    }

    params.since = moment(options.since).format("YYYY-MM-DD HH:MM:SS");
  }

  if(options.until){
    if(typeof options.until !== 'number' && !(options.until instanceof Date)){
      throw new Error('The `until` parameter must be an instance of Date or Number');
    }

    params.until = moment(options.until).format("YYYY-MM-DD HH:MM:SS");
  }

  return requestWithPagination(formatUrl(path, params));
}


function requestWithPagination(url){
  return new Promise(function(resolve, reject){
    request({
      method: 'GET',
      url: url,
      json: true
    }, function(error, response, body){
      if(error){
        return reject(error);
      }

      if(response.statusCode !== 200 || typeof body !== 'object'){
        return reject(response);
      }

      var next = null, previous = null;

      if(body.paging){
        if(body.paging.next){
          next = function(){
            return requestWithPagination(body.paging.next);
          };
        }

        if(body.paging.previous){
          previous = function(){
            return requestWithPagination(body.paging.previous);
          };
        }
      }

      resolve({
        results: body.data,
        pagination: {
          next: next,
          previous: previous
        }
      });
    });
  });
};
