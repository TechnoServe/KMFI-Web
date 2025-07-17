const {isCompanyAdmin} = require('../guards');
const {USER_TYPES} = require('../constants');
const {verifyJwt, validate} = require('../utils');

module.exports.validateSignUp = require('./sign-up-middleware.js');

/**
 * Middleware to authorize a user based on JWT token in the Authorization header.
 * @param {object} store - An object providing access to data layer (e.g., store.getUserWithAssociatedData).
 * @returns {Function} Express middleware function.
 */
module.exports.authorization = (store) => async (req, res, next) => {
  // Define validation rules for headers
  const rules = {
    authorization: {
      presence: {
        allowEmpty: false,
        message: 'The authorization header is required.',
      },
    },
  };

  // Validate request headers
  const errors = validate(req.headers, rules);

  // Handle validation errors
  if (errors) return res.status(400).json({message: 'Some inputs are invalid.', errors: errors});

  // Extract the Bearer token from the Authorization header
  let token = req.headers['authorization'].split(' ')[1];
  if (token) token = token.trim();
  if (!token) return res.status(401).json({message: 'The bearer token can not be empty.'});

  try {
    let verifiedUserUid;

    try {
      // Verify the JWT and extract user UID
      const {uid} = await verifyJwt(token);
      verifiedUserUid = uid;
    } catch (err) {
      const message = 'Failed to verify JWT.';
      console.error(message, err);
      res.status(401).json({message});
      return;
    }

    // Attach verified user object to request
    req.user = await store.getUserWithAssociatedData(verifiedUserUid);

    next();
  } catch (err) {
    const message = 'Failed to authorize user.';
    console.error(err);
    res.status(401).json({message});
  }
};

/**
 * Middleware to verify if the user is a company admin for a given company ID.
 * @param {object} store - Object that provides access to user roles and permissions.
 * @returns {Function} Express middleware function.
 */
module.exports.isCompanyAdmin = (store) => async (req, res, next) => {
  // Define validation rules for the request parameters
  const constraints = {
    id: {
      type: 'string',
      presence: {allowEmpty: false},
    },
  };

  const {params} = req;

  // Validate the route parameters
  const errors = validate(params, constraints);

  if (errors) return res.status(400).json({errors});

  const {id} = params;

  try {
    // Check if the current user is a company admin for the requested company ID
    if (!isCompanyAdmin(store, req.user, id)) {
      return res.status(401).json({message: 'Unauthorised.'});
    }
    next();
  } catch (error) {
    return res.status(401).json({message: 'Unauthorised.'});
  }
};

/**
 * Middleware to check if the user is authorized based on a custom policy.
 * @param {Function} policy - Function that receives user role and returns boolean.
 * @returns {Function} Express middleware function.
 */
module.exports.isAuthorized = (policy) => (req, res, next) => {
  // Check if user's role satisfies the policy
  if (policy(req.user.role)) {
    next();
  } else {
    return res.status(401).json({message: 'Unauthorised.'});
  }
};

/**
 * Middleware to verify if the current user is an MFI Admin.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 */
module.exports.isMFIAdmin = (req, res, next) => {
  // Check if the user is an MFI admin based on user type and admin_user object
  if (
    req.user.user_type.value.toLowerCase() === USER_TYPES.ADMIN
    && req.user.admin_user
    && req.user.admin_user.id
    && req.user.admin_user
  ) {
    next();
  } else {
    return res.status(401).json({message: 'Unauthorised.'});
  }
};
