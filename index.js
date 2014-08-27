var formatUrl = require('./lib/format-url');
var paginatedRequest = require('./lib/paginated-request');

exports.cloudcasts = function(user, options){
  return paginatedRequest(user + '/cloudcasts/', options);
};

