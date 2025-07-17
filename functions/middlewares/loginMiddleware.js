/**
 * Middleware to validate the login request payload.
 * Ensures the email field is present and correctly formatted.
 *
 * @returns {Function} Express middleware function that validates login input.
 */
const {validate} = require('../utils');

const constraints = {
  email: {
    presence: {allowEmpty: false},
    email: true,
  },
};

module.exports.validateLogin = () => (req, res, next) => {
  try {
    // Validate the request body against defined constraints
    const error = validate(req.body, constraints);
    // If validation errors exist, respond with 400 Bad Request
    if (error) {
      return res.status(400).json({error});
    }
    // If validation passes, proceed to the next middleware
    next();
  } catch (e) {
    // Catch and return server errors if validation throws
    return res.status(500).json({error: e.message});
  }
};
