var Promise = require('promise');
var Joi = require('joi');
var moment = require('moment')
var request = require('request');

var schema = require('./schema');
var formatUrl = require('./format-url');


module.exports = function paginatedRequest(path, options){
  var validation = Joi.validate(options, schema.pagination);

  if (validation.error) {
    throw validation.error;
  }

  var params = validation.value;

  if (params.since) params.since = moment(params.since).format("YYYY-MM-DD HH:MM:SS")
  if (params.until) params.until = moment(params.until).format("YYYY-MM-DD HH:MM:SS")

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
