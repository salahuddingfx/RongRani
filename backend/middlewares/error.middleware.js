const ApiError = require('../utils/ApiError');
const env = require('../config/env');

/**
 * Centralized Error Middleware
 */
const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // If error is not an instance of ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Something went wrong';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors,
    ...(env.NODE_ENV === 'development' && { stack: error.stack })
  };

  // Log the error
  console.error(`🔥 [${req.method}] ${req.url} - ${error.message}`);
  if (error.statusCode === 500) {
    console.error(error.stack);
  }

  return res.status(error.statusCode).json(response);
};

module.exports = errorMiddleware;
