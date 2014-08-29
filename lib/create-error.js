module.exports = function createError(name, message, payload){
  var error = new Error(message);

  error.name = name;
  error.payload = payload;

  return error;
};
