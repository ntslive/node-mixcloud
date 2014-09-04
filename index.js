var Joi = require('joi');
var Promise = require('promise');
var path = require('path');

var createError = require('./lib/create-error');
var schema = require('./lib/schema');
var request = require('./lib/request');
var paginatedRequest = require('./lib/paginated-request');


exports.cloudcasts = function(username, pagination){
  var validation = Joi.validate(username, schema.username.required());
  if(validation.error){
    throw createError("ValidationError", 'Username argument is required and must be a String containing at least one character', username);
  }

  return paginatedRequest(username + '/cloudcasts/', pagination);
};


// Syntax:
//    cloudcast('ntsradio', 'knee-deep-26th-august-2014')
// OR
//    cloudcast('/NTSRadio/knee-deep-26th-august-2014/')
exports.cloudcast = function(){
  var args = Array.prototype.slice.call(arguments);
  var argc = args.length;

  var validation = Joi.validate(args, Joi.alternatives().try([
    Joi.array().length(1).includes(schema.key),
    Joi.array().length(2).includes(schema.username, schema.slug)
  ]));

  if(validation.error){
    throw createError("ValidationError", "Signature: cloudcast('/ntsradio/knee-deep-26th-august-2014/') or cloudcast('ntsradio', 'knee-deep-26th-august-2014')", arguments);
  }

  var pathname = args[0];
  if(argc === 2){
    pathname = path.join('/', args[0], args[1]);
  }

  return request('GET', pathname).then(function(response){
    return response.body;
  });
};
