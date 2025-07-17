const {sendEmail, signJwtToken, paginationConstraint, validate} = require('../utils');
const {ActivityLog} = require('../utils/activity-log');
const {COLLECTIONS, ACTIVITY_LOG_ACTIONS, USER_TYPES} = require('../constants');

/**
 * Fetches a list of product types from the store.
 * @param {object} store - The data store interface.
 * @returns {Function} Express route handler
 */
module.exports.productTypeList = (store) => (req, res) => {
  // Fetch product types from the store
  store
    .getProductTypes()
    .then((list) => res.json(list))
    .catch((err) => {
      // Handle errors and send 500 response
      const message = 'Failed to fetch product type list.';
      console.error(err, message);
      res.status(500).json({message});
    });
};

/**
 * Fetches a list of product micro nutrients based on query id.
 * @param {object} store - The data store interface.
 * @returns {Function} Express route handler
 */
module.exports.productMicroNutrients = (store) => (req, res) => {
  // Extract id from query parameters
  const id = req.query['id'];
  store
    .getProductMicroNutrients(id)
    .then((list) => res.json(list))
    .catch((err) => {
      // Handle errors and send 500 response
      const message = 'Failed to fetch product micro nutrients.';
      console.error(err, message);
      res.status(500).json({message});
    });
};

/**
 * Fetches a single product micro nutrient based on query id.
 * @param {object} store - The data store interface.
 * @returns {Function} Express route handler
 */
module.exports.productMicroNutrient = (store) => (req, res) => {
  // Extract id from query parameters
  const id = req.query['id'];
  store
    .getProductMicroNutrient(id)
    .then((list) => res.json(list))
    .catch((err) => {
      // Handle errors and send 500 response
      const message = 'Failed to fetch product micro nutrient.';
      console.error(err, message);
      res.status(500).json({message});
    });
};

/**
 * Fetches a paginated list of company rankings.
 * @param {object} store - The data store interface.
 * @returns {Function} Express route handler
 */
module.exports.rankingList = (store) => async (req, res) => {
  try {
    // Extract query parameters for pagination
    const {
      query,
    } = req;

    // Validate pagination params
    const errors = validate(query, paginationConstraint);

    if (errors) return res.status(400).json({errors});

    const {before, after, 'page-size': size} = query;

    // Fetch ranking list from store
    const data = await store.rankingList(before, after, +size);

    // Return data in response
    return res.json({
      data,
    });
  } catch (error) {
    // Handle errors and send 500 response
    const message = 'Failed to fetch company ranking list.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

/**
 * Fetches a list of company sizes.
 * @param {object} store - The data store interface.
 * @returns {Function} Express route handler
 */
module.exports.companySizeList = (store) => (req, res) => {
  // Fetch company sizes from store
  store
    .getCompanySizes()
    .then((list) => res.json(list))
    .catch((err) => {
      // Handle errors and send 500 response
      const message = 'Failed to fetch company size list.';
      console.error(err, message);
      res.status(500).json({message});
    });
};

/**
 * Sends a login email with a verification token link.
 * @param {object} store - The data store interface.
 * @param {object} transport - Email transport mechanism.
 * @returns {Function} Express route handler
 */
module.exports.login = (store, transport) => async (req, res) => {
  try {
    // Extract email from request body
    const {email} = req.body || {};
    let authUser;

    // Validate email presence
    if (!email) return res.status(400).json({error: 'email required'});

    try {
      // Attempt to retrieve authenticated user by email
      authUser = await store.getAuthUserByEmail(email);
      if (!authUser) {
        throw new Error('User not found.');
      }
    } catch (error) {
      // Invalid credentials if user not found
      return res.status(401).json({error: 'Invalid credentials'});
    }

    // Generate JWT token for user
    const token = await signJwtToken(authUser.auth_provider_id);

    // Construct login URL with token
    // TODO: Put URLs in a constant
    const url = `${process.env.FRONTEND_URL}/verify-token?token=${token}`;
    console.log('Login URL:', url);

    // Send login email asynchronously
    sendEmail(transport, {
      from: process.env.TRANSACTIONAL_EMAIL_ADDRESS,
      to: email,
      subject: 'Technoserve KMFI Login Details',
      html: `<div><a href="${url}">Click here to Login to KMFI Portal by TechnoServe:</a> You can also copy and paste the link below:<p>${url}</p</div>`,
    }).catch((err) => console.error(err));

    // Respond with success message
    return res.json({message: 'Login email sent'});
  } catch (err) {
    // Handle unexpected errors
    const msg = 'Some error occured.';

    console.error(msg, err);
    return res.status(500).json({msg});
  }
};

/**
 * (Deprecated) Returns all team members for the authenticated user's company.
 * @param {Function} firestore - Firestore instance getter.
 * @param {object} auth - Firebase admin auth instance.
 * @returns {Function} Express route handler
 */
module.exports.viewTeamMembers = (firestore, auth) => async (req, res) => {
  try {
    // Get Firestore DB instance
    const db = firestore();
    // Extract companyId from authenticated user's document
    const {companyId} = req.userDoc;
    const result = [];

    // Query users collection for members of the company
    const teamMembersList = await db
      .collection(COLLECTIONS.USERS)
      .where('companyId', '==', companyId)
      .get();

    // For each team member document, fetch additional user info from Firebase auth
    teamMembersList.forEach(async (doc) => {
      const d = doc.data();
      const userRecord = await auth.getUser(d.id);
      const {fullName, phoneNumber} = userRecord.toJson();
      d.id = doc.id;
      d.fullName = fullName;
      d.phoneNumber = phoneNumber;
      result.push(d);
    });
    // Return list of team members
    return res.json(result);
  } catch (e) {
    // Handle errors and send 500 response
    res.status(500).json({error: e.message});
  }
};

/**
 * Get's the current authenticated user data, signs a new JWT token,
 * and logs the login activity asynchronously after response.
 *
 * @param {object} store - The data store interface.
 * @returns {Function} Express route handler
 */
module.exports.getAuthUserInfo = (store) => async (req, res) => {
  // Sign new JWT token with 24h expiry
  signJwtToken(req.user.auth_provider_id, Date.now() / 1000 + 60 * 60 * 24)
    .then(async (token) => {
      const user = req.user;
      // Fetch active SAT cycle from store
      const activeCycle = await store.getActiveSATCycle();
      // Respond with user info, token, and active cycle
      res.json({user, token, cycle: activeCycle});

      // After response finishes, log user login activity
      res.on('finish', async () => {
        const companyUser = await store.getCompanyUserByUserId(user.id);

        // Only log activity if user is a company user
        if (!companyUser) return;

        try {
          await new ActivityLog({
            user_id: user.id,
            company_id: companyUser.company_id,
            action: ACTIVITY_LOG_ACTIONS.LOGGED_IN,
          }).save(store);
        } catch (e) {
          console.error('getAuthUserInfo:error', e.message);
        }
      });
    })
    .catch((err) => {
      // Handle JWT signing errors
      const message = 'Failed to sign JWT';
      console.error(message, err);
      res.status(500).json({message});
    });
};

/**
 * Fetch the current authenticated user data.
 *
 * @returns {Function} Express route handler
 */
module.exports.getAuthenticatedUser = () => async (req, res) => {
  // Return the authenticated user from request
  const user = req.user;
  res.json(user);
};

/**
 * Update the current authenticated user data.
 *
 * @param {object} store - The data store interface.
 * @returns {Function} Express route handler
 */
module.exports.updateAuthenticatedUserData = (store) => async (req, res) => {
  // Update user data in store with provided fields
  const user = await store.updateUserById(req.body.user, {
    full_name: req.body.full_name,
    email: req.body.email,
  });
  // Return updated user
  res.json(user);
};

/**
 * Register a public user by creating an auth user and storing user info.
 *
 * @param {object} auth - Firebase admin auth instance.
 * @param {object} store - The data store interface.
 * @returns {Function} Express route handler
 */
module.exports.registerPublicUser = (auth, store) => async (req, res) => {
  // Prepare user properties from request body
  const properties = {
    email: req.body.email,
    displayName: req.body.full_name,
  };

  try {
    // Fetch user type id for public users
    const {id: userTypeId} = await store.getUserTypeByName(USER_TYPES.PUBLIC);

    // Create user in Firebase Auth
    // https://firebase.google.com/docs/auth/admin/manage-users#create_a_user
    const userRecord = await store.createAuthUser(properties.email, properties);

    // Store user info in internal DB
    res.json({
      result: await store.createUser({
        full_name: properties.displayName,
        email: properties.email,
        user_type_id: userTypeId,
        auth_provider_id: userRecord.uid,
      }),
    });
  } catch (error) {
    // Handle errors, including duplicate email case
    console.error('Error creating new user:', error);
    let message = 'An error occurred while creating account.';
    if (error && error.errorInfo && error.errorInfo.code === 'auth/email-already-exists') {
      message = 'The email address is already in use by another account.';
    }
    res.status(400).json({message});
  }
};

/**
 * List users belonging to a company.
 *
 * @param {object} store - The data store interface.
 * @returns {Function} Express route handler
 */
module.exports.listCompanyMembers = (store) => async (req, res) => {
  // Extract companyId from route parameters
  const companyId = req.params.id;

  try {
    // Fetch company members from store
    const members = await store.getCompanyMembers(companyId);
    return res.json(members);
  } catch (e) {
    // Handle errors and log them
    console.error('company members error: ', e);
  }

  // Send 500 error if request not completed successfully
  res.status(500).json({message: 'Request not completed'});
};
