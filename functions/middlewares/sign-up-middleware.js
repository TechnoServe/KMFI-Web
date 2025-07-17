const {validate, sanitizeEmailAddress} = require('../utils');

/**
 * Middleware to validate sign-up request payload for creating a new company account.
 * Checks presence and format of required fields and ensures the company email does not already exist.
 *
 * @param {Object} store - Data store object used to access company sizes and auth user methods.
 * @returns {Function} Express middleware function that validates the sign-up input.
 */
module.exports = (store) => async (req, res, next) => {
  try {
    // Retrieve list of valid company size IDs from the store
    const companySizes = (await store.getCompanySizes()).map(({id}) => id);

    // Add custom validator to check if the company email already exists in the system
    validate.validators.companyEmailExists = (value) => new Promise((resolve, reject) => {
      store
        .getAuthUserByEmail(sanitizeEmailAddress(value))
        .then(() => resolve())
        .catch(() => resolve('User not found.'));
    });

    // Define validation constraints for the request body
    const constraints = {
      'full-name': {
        type: 'string',
        presence: {allowEmpty: false},
      },
      'company-email': {
        type: 'string',
        presence: {allowEmpty: false},
        email: {
          message: 'Provide a valid email address.',
        },
      },
      'company-name': {
        type: 'string',
        presence: {allowEmpty: false},
      },
      'company-size': {
        type: 'string',
        presence: {allowEmpty: false},
        inclusion: companySizes,
      },
      'brands': {
        type: 'array',
        presence: {allowEmpty: false},
        // TODO: add validator for it
      },
    };

    // Perform asynchronous validation against the defined constraints
    validate.async(req.body, constraints).then(
      // If validation passes, continue to the next middleware
      () => next(),
      // If validation fails, respond with 400 Bad Request and error details
      (errors) => res.status(400).json({errors})
    );
  } catch (err) {
    // Handle unexpected server errors gracefully
    console.error(err);
    return res.status(500).json({message: 'Some error occured.'});
  }
};
