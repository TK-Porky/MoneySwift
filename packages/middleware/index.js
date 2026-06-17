const authenticate = require('./authenticate');
const requirePin = require('./requirePin');
const validate = require('./validate');
const errorHandler = require('./errorHandler');

module.exports = {
  authenticate,
  requirePin,
  validate,
  errorHandler
};
