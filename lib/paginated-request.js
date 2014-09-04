var Promise = require('promise');
var Joi = require('joi');
var moment = require('moment')

var schema = require('./schema');
var request = require('./request');
var formatUrl = require('./format-url');
var createError = require('./create-error');

// TODO: transform to constructor and have a send() method for better testing.
module.exports = function paginatedRequest(path, options){
  var error, validated;

  error = Joi.validate(path, schema.path).error;
  if(error){
    throw error;
  }

  validated = Joi.validate(options, schema.pagination);
  if (validated.error) {
    throw validated.error;
  }

  var params = validated.value;
  if (params.since) params.since = moment(params.since).format(schema.dateFormatString)
  if (params.until) params.until = moment(params.until).format(schema.dateFormatString)

  return request('GET', path, params).then(handleResponse);
}


function handleResponse(response){
  if(response.statusCode !== 200){
    throw createError('BadResponse', 'Received non-200 status code from server.', response);
  }

  var data = response.body.data;
  var paging = {};

  if (Object.hasOwnProperty.call(response.body, 'paging')) {
    paging = response.body.paging;
  }

  if(!Array.isArray(data)) {
    throw createError('BadResponse', 'Received JSON where `data` was not an Array', response);
  }

  if(!(paging instanceof Object)) {
    throw createError('BadResponse', 'Received JSON where `paging` was not an Object', response);
  }

  var next = null;
  if(paging.next){
    next = function(){
      return request('GET', paging.next).then(handleResponse);
    };
  }

  var previous = null;
  if(paging.previous){
    previous = function(){
      return request('GET', paging.previous).then(handleResponse);
    };
  }

  return {
    results: data,
    pagination: {
      next: next,
      previous: previous,
      nextUrl: paging.next,
      previousUrl: paging.previous,
    }
  };
};
