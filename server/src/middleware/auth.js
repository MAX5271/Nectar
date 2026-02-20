// Placeholder auth middleware. Replace with JWT/session logic.
const auth = (req, res, next) => {
  // In real app, validate token and set req.user
  next();
};

module.exports = auth;
