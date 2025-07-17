
const {USER_TYPES} = require('../constants');

/**
 * Checks if the given user is a PC_ADMIN for the specified company.
 *
 * @param {*} store - The data access layer providing the getCompanyById method.
 * @param {*} user - The user object from request context.
 * @param {string} companyId - The ID of the company to check against.
 * @returns {Promise<boolean>} - True if the user is a PC_ADMIN for the company, false otherwise.
 */
module.exports.isCompanyAdmin = async (store, user, companyId) => {
  try {
    // Fetch the company by ID and validate if the user is an admin (PC_ADMIN) for that company.
    const company = await store.getCompanyById(companyId);
    if (!company || !user) return false;

    return user.company_user
      && user.company_user.role
      && user.company_user.company_id == company.id
      && (user.company_user.role.name.toUpperCase() == 'PC_ADMIN');
  } catch (err) {
    console.error('guard.isCompanyAdmin failed.', err);
    return false;
  }
};

/**
 * Determines if the given user is a member of the specified company.
 *
 * @param {*} store - The data access layer providing the getCompanyById method.
 * @param {*} user - The user object from request context.
 * @param {string|object} companyId - The company ID or company object.
 * @returns {Promise<boolean>} - True if the user is an active company member, false otherwise.
 */
module.exports.isCompanyMember = async (store, user, companyId) => {
  try {
    // Resolve the company object and check if the user belongs to the company and is not soft-deleted.
    const company = isObject(companyId) ? companyId : await store.getCompanyById(companyId);

    if (!company || !user) return false;
    return (user.company_user && !user.company_user.deleted_at && user.company_user.company_id == company.id);
  } catch (err) {
    console.error('guard.isCompanyMember failed.', err);
    return false;
  }
};


/**
 * Determines if a value is a non-null object.
 *
 * @param {*} val - The value to check.
 * @returns {boolean} - True if val is an object and not null, false otherwise.
 */
// Utility to confirm if a value is a non-null object.
const isObject = (val) => typeof val === 'object' && val !== null;

/**
 * Checks if the given user is an MFI admin based on user type and presence of admin_user details.
 *
 * @param {*} user - The user object from request context.
 * @returns {boolean} - True if the user is an MFI admin, false otherwise.
 */
module.exports.isMFIAdmin = (user) => {
  // Validate the user type and presence of admin_user data to confirm admin status.
  return (
    user.user_type.value.toLowerCase() === USER_TYPES.ADMIN
    && user.admin_user
    && user.admin_user.id
    && user.admin_user
  );
};
