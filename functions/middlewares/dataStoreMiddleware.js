
/**
 * Middleware to attach a given data store to the request object.
 *
 * @param {*} store - The data store instance to attach to the request.
 * @returns {function} Express middleware function that assigns store to req.store and calls next().
 */
module.exports.dataStoreMiddleware = (store) => (req, res, next) => {
  // Attach the provided data store to the request object
  req.store = store;

  // Proceed to the next middleware in the stack
  next();
};
