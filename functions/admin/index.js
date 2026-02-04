const {USER_TYPES} = require('../constants');
const {companyAndCycle, adminCanInvite, sendEmail, signJwtToken} = require('../utils');
const {validate} = require('../utils');

/**
 * Approves the SAT score for a specific company and cycle.
 *
 * @param {Object} store - The data store interface.
 * @returns {Function} Express handler function.
 */
module.exports.approveSAT = (store) => async (req, res) => {
  // Validate query parameters
  const errors = validate(req.query, companyAndCycle);

  const {'company-id': companyId, 'cycle-id': cycleId} = req.query;

  if (errors) return res.status(400).json({errors});

  try {
    // Approve SAT score in the data store
    await store.approveSAT(companyId, cycleId, req.user.id);
    return res.json({success: 'SAT score approval successful.'});
  } catch (e) {
    console.error(e);
    res.status(500).json({error: e.message});
  }
};

/**
 * Publishes the IVC score for a specific company and cycle.
 *
 * @param {Object} store - The data store interface.
 * @returns {Function} Express handler function.
 */
module.exports.publishIVC = (store) => async (req, res) => {
  // Validate query parameters
  const errors = validate(req.query, companyAndCycle);

  const {'company-id': companyId, 'cycle-id': cycleId} = req.query;

  if (errors) return res.status(400).json({errors});

  try {
    // Publish IVC score in the data store
    await store.publishIVC(companyId, cycleId, req.user.id);
    return res.json({success: 'IVC score published successful.'});
  } catch (e) {
    console.error(e);
    res.status(500).json({error: e.message});
  }
};

/**
 * Unpublishes the IVC score for a specific company and cycle.
 *
 * @param {Object} store - The data store interface.
 * @returns {Function} Express handler function.
 */
module.exports.unpublishIVC = (store) => async (req, res) => {
  // Validate query parameters
  const errors = validate(req.query, companyAndCycle);

  const {'company-id': companyId, 'cycle-id': cycleId} = req.query;

  if (errors) return res.status(400).json({errors});

  try {
    // Unpublish IVC score in the data store
    await store.unpublishIVC(companyId, cycleId, req.user.id);
    return res.json({success: 'IVC score unpublished successful.'});
  } catch (e) {
    console.error(e);
    res.status(500).json({error: 'Unable to unpublish score.'});
  }
};

/**
 * Assigns a company to a user, either the requesting user or a target user.
 *
 * @param {boolean} user - Flag to determine if the company should be assigned to the requesting user.
 * @returns {Function} A function that takes store and returns an Express handler function.
 */
const assignCompanyToUser = (user = undefined) => (store) => async (req, res) => {
  // Determine the user to assign the company to
  const userToAssign = user ? req.user.id : req.body['user-id'];
  // Define validation constraints including user-id
  const constraints = {...companyAndCycle, 'user-id': {type: 'string', presence: {allowEmpty: false}}};
  // Validate request body with user-id
  const errors = validate({...req.body, 'user-id': userToAssign}, constraints);

  const {'company-id': companyId, 'cycle-id': cycleId} = req.body;

  if (errors) return res.status(400).json({errors});

  try {
    // Assign company to the specified user in the data store
    await store.assignCompanyToUser(companyId, userToAssign, cycleId);
    return res.json({success: 'Company successfully assigned.'});
  } catch (e) {
    console.error(e);
    res.status(500).json({error: 'Unable to assign company.'});
  }
};

/**
 * Removes a company assignment from an admin.
 *
 * @param {Object} store - The data store interface.
 * @returns {Function} Express handler function.
 */
module.exports.removeCompanyFromAdmin = (store) => async (req, res) => {
  const {
    params: {id},
  } = req;

  // Validate presence of company id parameter
  if (!id) {
    return res.status(400).json({error: 'No company id provided.'});
  }

  // Attempt to delete the assigned company
  if (await store.deleteAssignedCompany(id)) {
    return res.json({success: 'Company successfully removed.'});
  } else {
    return res.status(500).json({error: 'Unable to remove company.'});
  }
};

/**
 * Deletes a user by id and authId.
 *
 * @param {Object} store - The data store interface.
 * @returns {Function} Express handler function.
 */
module.exports.deleteUser = (store) => async (req, res) => {
  const {
    params: {id, authId},
  } = req;

  // Validate presence of company id parameter
  if (!id) {
    return res.status(400).json({error: 'No company id provided.'});
  }

  // Attempt to delete the user
  if (await store.deleteUser(id, authId)) {
    return res.json({success: 'User successfully removed.'});
  } else {
    return res.status(500).json({error: 'Unable to remove user.'});
  }
};

/**
 * Deletes all data associated with a company.
 *
 * @param {Object} store - The data store interface.
 * @returns {Function} Express handler function.
 */
module.exports.deleteCompanyData = (store) => async (req, res) => {
  const {
    params: {id},
  } = req;

  // Validate presence of company id parameter
  if (!id) {
    return res.status(400).json({error: 'No company id provided.'});
  }

  // Delete company data without awaiting (fire and forget)
  store.deleteCompanyData(id);
  res.json({success: 'Company successfully removed.'});
};

/**
 * Deletes a micronutrient score by id.
 *
 * @param {Object} store - The data store interface.
 * @returns {Function} Express handler function.
 */
module.exports.deleteMicroNutrientScore = (store) => async (req, res) => {
  const {
    params: {ptid},
  } = req;

  // Validate presence of micronutrient id parameter
  if (!ptid) {
    return res.status(400).json({error: 'No micronutrient id provided.'});
  }

  // Delete micronutrient score without awaiting (fire and forget)
  store.deleteMicroNutrientScore(ptid);
  res.json({success: 'Micronutrient score successfully removed.'});
};

module.exports.assignCompanyToSelf = assignCompanyToUser(true);
module.exports.assignCompanyToAdmin = assignCompanyToUser();

/**
 * Lists all admin members.
 *
 * @param {Object} store - The data store interface.
 * @returns {Function} Express handler function.
 */
module.exports.listMembers = (store) => async (req, res) => {
  try {
    // Retrieve admin members from store
    const members = await store.getAdminMembers();
    return res.json(members);
  } catch (e) {
    console.error('admin members error: ', e);
  }
  res.status(500).json({message: 'Request not completed'});
};

/**
 * Lists all company members accessible by admin.
 *
 * @param {Object} store - The data store interface.
 * @returns {Function} Express handler function.
 */
module.exports.listCompanyMembers = (store) => async (req, res) => {
  try {
    // Retrieve company members for admin
    const members = await store.getCompanyMembersAdmin();
    return res.json(members);
  } catch (e) {
    console.error('company members error: ', e);
  }
  res.status(500).json({message: 'Request not completed'});
};

/**
 * Invites a list of team members by sending email invitations.
 *
 * @param {Object} store - The data store interface.
 * @param {Object} transport - The email transport configuration.
 * @returns {Function} Express handler function.
 */
module.exports.inviteTeamMember = (store, transport) => async (req, res) => {
  try {
    const {
      body,
      user: {role}
    } = req;

    // Define constraints for invitation payload validation
    const invitationConstraint = {
      'role_id': {
        type: 'string',
        presence: {allowEmpty: false},
      },
      'email': {
        email: true,
        presence: {allowEmpty: false},
      },
      'from': {
        type: 'object',
        presence: {allowEmpty: false},
      }
    };

    // Joi validator would have being more useful in this context
    const itemValidator = (constraints) => (val) => validate(val, constraints);

    const errors = [];
    // Validate that body is an array and not empty
    if (!Array.isArray(body)) {
      errors.push('Invitation payload must be an array.');
    } else if (!(body.length > 0)) {
      errors.push('Invitation payload cannot be empty.');
    } else {
      errors.concat(
        body.map(itemValidator(invitationConstraint)).filter((err) => err)
      );
    }

    if (errors.filter((err) => err).length > 0) return res.status(400).json({errors});

    // Iterate over each invitation item
    for (let index = 0; index < body.length; index++) {
      const {email, role_id: invitedUserRole, from} = body[index];

      // Check if user exists or if the inviter is authorized to invite the role
      if ((await store.getUserByEmail(email)) || !adminCanInvite(role, invitedUserRole)) {
        continue;
      }

      // Check if an invite already exists for the email
      let invite = await store.getAdminTeamMemberInviteByEmail(email);
      if (invite) {
        const url = `${process.env.FRONTEND_URL || 'localhost:5000'}?admin-invitationId=${invite.id}&&fullName=${from.full_name}`;
        await sendEmail(transport, {
          from: process.env.TRANSACTIONAL_EMAIL_ADDRESS,
          to: email,
          subject: 'Invitation',
          html: `<p>Click to Accept Invitation: </p><br/>${url}`,
        });
      }

      // Create new invite if none exists
      invite = await store.createAdminTeamMemberInvite(email, {role_id: invitedUserRole});

      const url = `${process.env.FRONTEND_URL || 'localhost:5000'}/admin-invite/${invite.id}/${from.full_name}`;
      await sendEmail(transport, {
        from: process.env.TRANSACTIONAL_EMAIL_ADDRESS,
        to: email,
        subject: 'Invitation',
        html: `<p>Click to Accept Invitation: </p><br/>${url}`,
      });
    }

    return res.json({message: 'Invitation sent'});
  } catch (e) {
    console.error('invite team member', e);
    res.status(500).json({error: e.message});
  }
};

/**
 * Makes all company brands active.
 *
 * @param {Object} store - The data store interface.
 * @returns {Function} Express handler function.
 */
module.exports.makeAllCompanyBrandsActive = (store) => async (req, res) => {
  try {
    // Activate all company brands in the data store
    await store.makeAllCompanyBrandsActive();
    return res.json({message: 'All company brands made active.'});
  } catch (error) {
    const message = 'Failed to make all company brands active.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

/**
 * Makes all comanies large.
 *
 * @param {Object} store - The data store interface.
 * @returns {Function} Express handler function.
 */
module.exports.makeAllCompaniesLarge = (store) => async (req, res) => {
  try {
    // Make all companies sizes large in the data store
    await store.makeAllCompaniesLarge();
    return res.json({ message: 'All companies made large.' });
  } catch (error) {
    const message = 'Failed to make all companies large.';
    console.error(message, error);
    return res.status(500).json({ message });
  }
};
/**
 * Changes all comments to tier 1.
 *
 * @param {Object} store - The data store interface.
 * @returns {Function} Express handler function.
 */
module.exports.makeAllCommentsTier1 = (store) => async (req, res) => {
  try {
    // Change all comments to tier 1 in the data store
    await store.makeAllCommentsTier1();
    return res.json({message: 'All comments changed to tier 1.'});
  } catch (error) {
    const message = 'Failed to make all comments tier 1';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

/**
 * Changes all documents to tier 1.
 *
 * @param {Object} store - The data store interface.
 * @returns {Function} Express handler function.
 */
module.exports.makeAllDocumentsTier1 = (store) => async (req, res) => {
  try {
    // Change all documents to tier 1 in the data store
    await store.makeAllDocumentsTier1();
    return res.json({message: 'All documents changed to tier 1.'});
  } catch (error) {
    const message = 'Failed to make all documents tier 1';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

/**
 * Sends an email to all members of a company or all companies.
 *
 * @param {Object} store - The data store interface.
 * @param {Object} transport - The email transport configuration.
 * @returns {Function} Express handler function.
 */
module.exports.emailCompany = (store, transport) => async (req, res) => {
  try {
    const {
      body
    } = req;

    // Define constraints for email payload validation
    const emailConstraints = {
      'company-id': {
        type: 'string',
        presence: {allowEmpty: false},
      },
      'subject': {
        type: 'string',
        presence: {allowEmpty: false},
      },
      'message': {
        type: 'string',
        presence: {allowEmpty: false},
      },
    };

    // Validate request body
    const errors = validate(body, emailConstraints);

    if (errors) return res.status(400).json({errors});
    const {'company-id': companyId, subject, message} = body;

    // Retrieve members based on company id or all companies
    const companyMembers = companyId == 'ALL' ? (await store.getCompanyMembersAdmin()) : (await store.getCompanyMembers(companyId));

    // Send email to each member
    for (let i = 0; i < companyMembers.length; i++) {
      const companyMember = companyMembers[i];

      await sendEmail(transport, {
        from: process.env.TRANSACTIONAL_EMAIL_ADDRESS,
        to: companyMember.email,
        subject: subject,
        html: message,
      });
    }

    return res.json({message: 'Email sent'});
  } catch (e) {
    console.error('emailCompany error', e);
    res.status(500).json({error: e.message});
  }
};

/**
 * Accepts an invitation to join as an admin team member.
 *
 * @param {Object} store - The data store interface.
 * @param {Object} transport - The email transport configuration.
 * @returns {Function} Express handler function.
 */
module.exports.acceptInvite = (store, transport) => async (req, res) => {
  try {
    const {fullName, invitationId} = req.body;
    // Retrieve the invite by id
    const invite = await store.getAdminTeamMemberInviteById(invitationId);

    if (!invite) {
      return res.status(400).json({
        errors: {
          invitationId: ['Invite does not exist.'],
        },
      });
    }

    // Check if an auth user already exists for the invite email
    if (await store.getAuthUserByEmail(invite.email)) {
      return res.status(400).json({
        errors: {
          invitationId: ['User already exists.'],
        },
      });
    }

    // Create new auth user
    const authUser = await store.createAuthUser(invite.email);
    // Get admin user type id
    const {id: userTypeId} = await store.getUserTypeByName(USER_TYPES.ADMIN);
    // Create user record
    const {id: userId} = await store.createUser({
      full_name: fullName,
      email: invite.email,
      user_type_id: userTypeId,
      auth_provider_id: authUser.uid,
    });

    // Create admin user record linking user and role
    await store.createAdminUser({
      admin_role_id: invite.role_id,
      user_id: userId,
    });

    // Generate JWT token for authentication
    const token = await signJwtToken(authUser.uid);
    const url = `${process.env.FRONTEND_URL}/verify-token?token=${token}`;

    // Send login email with link
    sendEmail(transport, {
      from: process.env.TRANSACTIONAL_EMAIL_ADDRESS,
      to: invite.email,
      subject: 'Email Login',
      html: `<a href="${url}">Click to Login: ${url}</a>`,
    });

    return res.json({message: 'Sign up successfull.'});
  } catch (e) {
    console.error('handle accept company invite', e);
    return res.status(500).json({error: e.message});
  }
};

/**
 * Cancels an admin team member invitation.
 *
 * @param {Object} store - The data store interface.
 * @param {Object} transport - The email transport configuration.
 * @returns {Function} Express handler function.
 */
module.exports.cancelInvite = (store, transport) => async (req, res) => {
  try {
    // TODO: Write a guard.
    const {invitationId} = req.body;
    // Retrieve invite by id (missing await fixed)
    const invite = await store.getAdminTeamMemberInviteById(invitationId);

    if (!invite) {
      return res.status(400).json({
        errors: {
          invitationId: ['Invite does not exist.'],
        },
      });
    }

    // Check if user already exists for invite email
    const user = await store.getUserByEmail(invite.email);

    if (user) {
      return res.status(400).json({
        errors: {
          invitationId: ['User already exists.'],
        },
      });
    }

    // Attempt to delete the invite
    if (await store.deleteAdminTeamMemberInvite(invite.id)) {
      return res.json({message: 'Invite deleted.'});
    }

    return res.status(400).json({message: 'Failed to delete invite.'});
  } catch (error) {
    console.error('admin delete team member invite', error);
    return res.status(500).json({message: 'Some error occured while deleting invite.'});
  }
};

/**
 * Retrieves all admin roles.
 *
 * @param {Object} store - The data store interface.
 * @returns {Function} Express handler function.
 */
module.exports.getAdminRoles = (store) => async (req, res) => {
  try {
    // Get admin roles from data store
    const members = await store.getAdminRoles();
    return res.json(members);
  } catch (e) {
    console.error('admin members error: ', e);
  }
  res.status(500).json({message: 'Request not completed'});
};

/**
 * Assigns a role to a user.
 *
 * @param {Object} store - The data store interface.
 * @returns {Function} Express handler function.
 */
module.exports.assignRole = (store) => async (req, res) => {
  const {
    body,
    user: {role}
  } = req;

  // Define constraints for assigning role
  const assingContraint = {
    'role_id': {
      type: 'string',
      presence: {allowEmpty: false},
    },
    'user_id': {
      type: 'string',
      presence: {allowEmpty: false},
    }
  };

  // Validate request body
  const errors = validate(body, assingContraint);

  if (errors) return res.status(400).json({errors});
  const {role_id: roleId, user_id: userId} = body;

  // Check if user has permission to assign the role
  if (!adminCanInvite(role, roleId)) return res.status(401).json({error: 'Unauthorised'});

  try {
    // Check if user exists
    if (!(await store.getAdminUserByUserId(userId))) return res.status(400).json({error: 'User does not exist.'});

    // Assign role in data store
    const response = await store.assignRole(userId, roleId);
    if (response) {
      return res.json({success: 'Role assigned successfully.'});
    } else {
      return res.json({success: 'Role assignment failed.'}).status(400);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({error: 'Unable to assign role.'});
  }
};

/**
 * Locks the SAT for a given cycle and date.
 *
 * @param {Object} store - The data store interface.
 * @returns {Function} Express handler function.
 */
module.exports.lockSat = (store) => async (req, res) => {
  const {
    body,
  } = req;

  // Define constraints for lock parameters
  const lockConstraint = {
    'cycle-id': {
      type: 'string',
      presence: {allowEmpty: false},
    },
    'date': {
      type: 'string',
      presence: {allowEmpty: false},
    }
  };

  // Validate request body
  const errors = validate(body, lockConstraint);

  if (errors) return res.status(400).json({errors});
  const {'cycle-id': cycleId, date} = body;

  try {
    // Lock SAT in data store
    await store.lockSat(cycleId, date);
    return res.json({success: 'SAT locked successfully.'});
  } catch (e) {
    console.error(e);
    res.status(500).json({error: 'Unable to lock SAT.'});
  }
};

/**
 * Retrieves the active SAT cycle.
 *
 * @param {Object} store - The data store interface.
 * @returns {Function} Express handler function.
 */
module.exports.getActiveCycle = (store) => async (req, res) => {
  try {
    // Get active SAT cycle from data store
    const cycle = await store.getActiveSATCycle();
    return res.json(cycle);
  } catch (e) {
    console.error(e);
    res.status(500).json({error: 'Unable to get active cycle.'});
  }
};

/**
 * Retrieves all SAT cycles.
 *
 * @param {Object} store - The data store interface.
 * @returns {Function} Express handler function.
 */
module.exports.getCycles = (store) => async (req, res) => {
  try {
    // Get all SAT cycles from data store
    const cycle = await store.getCycles();
    return res.json(cycle);
  } catch (e) {
    console.error(e);
    res.status(500).json({error: 'Unable to get active cycle.'});
  }
};

/**
 * Exports SAT data for a given cycle and company.
 *
 * @param {Object} store - The data store interface.
 * @returns {Function} Express handler function.
 */
module.exports.satExport = (store) => async (req, res) => {
  try {
    const {
      params: {cycle, company},
    } = req;

    // Validate presence of cycle and company parameters
    if (!cycle) {
      return res.status(400).json({error: 'No cycle id provided.'});
    }
    if (!company) {
      return res.status(400).json({error: 'No company id provided.'});
    }
    // Export SAT data (fire and forget)
    store.satExport(cycle, company);
    return res.json({success: 'SAT export successful.'});
  } catch (e) {
    console.error(e);
    res.status(500).json({error: 'Unable to export SAT.'});
  }
};
