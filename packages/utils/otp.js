const crypto = require('crypto');
const bcrypt = require('bcrypt');

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
};

const hashOtp = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

const verifyOtp = async (otp, hashedOtp) => {
  return await bcrypt.compare(otp, hashedOtp);
};

module.exports = {
  generateOtp,
  hashOtp,
  verifyOtp
};
