var url = require('url');

module.exports = function formatUrl(path, params) {
  return url.format({
    protocol: "https",
    host: "api.mixcloud.com",
    pathname: path,
    query: params
  });
};
