const apiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json(apiResponse.error(err.message || 'Server error'));
};

module.exports = errorHandler;
