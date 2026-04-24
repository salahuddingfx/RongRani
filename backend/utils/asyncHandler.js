/**
 * Async Handler Wrapper
 * Eliminates the need for try-catch blocks in controllers.
 * @param {Function} requestHandler 
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

module.exports = asyncHandler;
