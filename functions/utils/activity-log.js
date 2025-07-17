const {ACTIVITY_LOG_ACTIONS} = require('../constants');

/**
 * optional fields for raw activity logs
 * @type {Array<String>}
 */
const optional = ['subject_id', 'subject_type', 'entity_id', 'entity_type', 'description'];

/**
 * required fields for raw activity logs
 * @type {Array<String>}
 */
const required = ['company_id', 'user_id', 'action'];

/**
 * Activity log
 */
module.exports.ActivityLog = class {
  /**
   * constructor
   * @param {Object} activity
   * @param {String} activity.id
   * @param {String} activity.user_id
   * @param {String} activity.company_id company where the performer of the action belongs
   * @param {String} activity.action
   * @param {String} activity.subject_id
   * @param {String} activity.subject_type
   * @param {String} activity.entity_id
   * @param {String} activity.entity_type
   * @param {Date} activity.created_at a js date object type is returned to the client
   * instead of an object containing seconds and nanoseconds
   */
  constructor(activity = {}) {
    this.activity = activity;
  }

  /**
   * Validates the activity log fields and returns a cleaned object
   * @returns {Object} validated object containing allowed non-empty fields
   * @throws {Error} when required fields are missing
   */
  validate() {
    const isEmpty = (key) => this.activity[key] == null;

    // Validate that all required fields are present
    const errors = [];
    required.forEach((key) => {
      if (isEmpty(key)) errors.push(`field ${key} is required`);
    });
    if (errors.length) throw new Error(errors.join(', '));

    const validated = {};
    // Keep only allowed fields that are non-empty
    const allowed = [...optional, ...required];
    Object.keys(this.activity).forEach((key) => {
      if (allowed.includes(key)) {
        if (!isEmpty(key)) validated[key] = this.activity[key];
      }
    });
    return validated;
  }

  /**
   * Saves the validated activity log using the provided datastore
   * @param {Object} datastore - Datastore instance with `saveActivityLog(activity)` method
   * @returns {Promise<void>}
   */
  async save(datastore) {
    const activity = this.validate(); // Validate and prepare activity
    await datastore.saveActivityLog(activity); // Save it
  }

  /**
   * Processes raw activity log into a more human-readable format
   * @param {Object} store - Data access layer with user lookup method `getUserByUid`
   * @returns {Promise<Object|null>} formatted activity log object or null
   * @throws {Error} if the action type is unsupported
   */
  async processRawActivityLog(store) {
    const {user_id: userId, ...rest} = this.activity;

    switch (this.activity.action) {
      case ACTIVITY_LOG_ACTIONS.LOGGED_IN: {
        // Fetch user details based on userId
        const user = await store.getUserByUid(userId);
        if (!user) return null;

        // Return formatted log info
        return {
          action: rest.action,
          action_owner_id: userId,
          action_owner_name: user.full_name,
          action_owner_email: user.email,
          created_at: rest.created_at,
        };
      }
      case ACTIVITY_LOG_ACTIONS.INVITED_TEAM_MEMBERS:
      case ACTIVITY_LOG_ACTIONS.SENT_SUBMISSION:
      case ACTIVITY_LOG_ACTIONS.UPLOADED_EVIDENCE: {
        // Currently not supported for transformation
        return null;
      }
      default: {
        // If action is not recognized
        throw new Error('unsupported action type');
      }
    }
  }
};
