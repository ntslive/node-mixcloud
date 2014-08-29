var Joi = require('joi');
var Promise = require('promise');

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

