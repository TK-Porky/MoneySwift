const authMiddleware = (req, res, next) => {
  // TODO: Implement JWT verification
  console.log('Auth middleware triggered');
  next();
};

module.exports = authMiddleware;
