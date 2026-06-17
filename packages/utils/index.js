const crypto = require('./crypto');
const feeCalculator = require('./fee.calculator');
const reference = require('./reference');
const otp = require('./otp');

module.exports = {
  ...crypto,
  ...feeCalculator,
  ...reference,
  ...otp
};
