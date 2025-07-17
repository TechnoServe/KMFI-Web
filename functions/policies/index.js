const SUPER = 'F4UNfg4iRCZRKJGZpbvv';
const NUCLEAR = 'sHM61QwGajJMNUPYxTVI';
const BASIC = 'zgDkefjf2EOLxVhH2Hc8';
const IVC = 'l9SHXn44ldl0reoeRqlQ';

const HIGHER_ADMINS = [SUPER, NUCLEAR];

/**
 * Checks if a user has permission to approve SAT.
 * Only users with SUPER or NUCLEAR roles are allowed.
 *
 * @param {string} id - Role ID of the user.
 * @returns {boolean} True if user can approve SAT, false otherwise.
 */
const canApproveSAT = (id) => HIGHER_ADMINS.includes(id);
/**
 * Checks if a user has permission to disapprove SAT.
 * Only users with the NUCLEAR role are allowed.
 *
 * @param {string} id - Role ID of the user.
 * @returns {boolean} True if user can disapprove SAT, false otherwise.
 */
const canDisapproveSAT = (id) => id === NUCLEAR;
// Same as canApproveSAT
const canReplaceSAT = canApproveSAT;
// Same as canApproveSAT
const canInvite = canApproveSAT;
// Same as canApproveSAT
const canSetRole = canApproveSAT;
// Same as canApproveSAT
const canAssignCompany = canApproveSAT;
// Same as canDisapproveSAT
const canRemoveCompanyFromIndex = canDisapproveSAT;
// Same as canDisapproveSAT
const canGiveCompanyPermissionToChangeSAT = canDisapproveSAT;
// Same as canDisapproveSAT
const canApproveIndex = canDisapproveSAT;

// SAT
// Approve SAT - Nuclear, Super
// Disapprove SAT - Nuclear
// Replace/Update SAT - Nuclear, Super

// Team management
// Invite - Super
// SetRole (limted to Basic, super, and ivc admin roles) - Super
// AssigneCompanyToBasicAdmin - Super

// PUblic Index
// Remove companies from index - Nuclear
// Give permission to make changes to SAT - Nuclear

/**
 * Role identifiers for different types of admin users.
 */
const ADMIN_ROLES = {
  BASIC, NUCLEAR, SUPER, IVC
};

module.exports = {
  canApproveSAT,
  canAssignCompany,
  canDisapproveSAT,
  canInvite,
  canReplaceSAT,
  canSetRole,
  canRemoveCompanyFromIndex,
  canGiveCompanyPermissionToChangeSAT,
  canApproveIndex,
  ADMIN_ROLES
};
