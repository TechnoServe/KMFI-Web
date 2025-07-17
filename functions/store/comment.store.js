const {docToObject} = require('../utils');
const {firestore} = require('firebase-admin');
const {COLLECTIONS, OWNER_TYPES} = require('../constants');

/**
 * CommentStore provides methods to manage comment data in Firestore.
 */
module.exports.CommentStore = class CommentStore {
  /**
   * Initializes the CommentStore with Firestore collection and auth context.
   * @param {FirebaseFirestore.Firestore} db - The Firestore database instance.
   * @param {Object} auth - The authentication context.
   */
  constructor(db, auth) {
    // Reference to the Firestore comments collection
    this.collection = db.collection(COLLECTIONS.COMMENTS);
    // Authentication context (if needed for future permission checks)
    this.auth = auth;
  }

  /**
   * Adds a new comment to the Firestore collection.
   * @param {Object} user - The user adding the comment.
   * @param {Object} param1 - The comment details.
   * @param {string} param1.content - The text content of the comment.
   * @param {Object} param1.owner - The object the comment is associated with.
   * @param {string} [param1.parent=''] - Optional parent comment ID for nested comments.
   * @param {string} [param1.companyId=''] - Optional company ID.
   * @param {string} [param1.tier='TIER_1'] - Tier level of the comment.
   * @returns {Promise<FirebaseFirestore.WriteResult>} - The result of the write operation.
   */
  addComment(user, {content, owner, parent = '', companyId='', tier = 'TIER_1'}) {
    // Prepare the data structure for the comment document
    const docData = {
      content,
      company_id: user.company_user ? user.company_user.company_id : companyId,
      user_id: user.id,
      parent_id: parent,
      owner_type: OWNER_TYPES.CATEGORY, // Currently only CATEGORY is supported
      owner_id: owner.id,
      created_at: firestore.Timestamp.now(),
      updated_at: firestore.Timestamp.now(),
      tier
    };
    // Create the comment document in Firestore
    return this.collection.doc().create(docData);
  }

  /**
   * Retrieves a comment by its ID.
   * @param {string} id - The ID of the comment to retrieve.
   * @returns {Promise<Object|null>} - The comment object or null if not found.
   */
  getById(id) {
    // Fetch the document by ID and convert to object if it exists
    return this.collection
      .doc(id)
      .get()
      .then((result) => {
        return Promise.resolve(result.exists ? docToObject(result) : null);
      });
  }

  /**
   * Lists comments authored by a specific user.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Array<Object>>} - A list of comment objects.
   */
  getCommentsForUser(userId) {
    // Query comments where user_id matches the provided userId
    return this.collection
      .where('user_id', '==', userId)
      .get()
      .then((result) => {
        return Promise.resolve(result.docs.map(docToObject));
      });
  }

  /**
   * Lists comments related to a specific category.
   * @param {string} companyId - The ID of the company.
   * @param {string} categoryId - The ID of the category.
   * @param {string} tier - The tier level of the comments.
   * @returns {Promise<Array<Object>>} - A list of comment objects.
   */
  getCommentsForCategory(companyId, categoryId, tier) {
    // Delegates to the generic list function for category-type comments
    // Todo: read optimizations based on UI
    // This may not be convenient for listing multi-level comments
    // as it requires front-end sorting when payload is large
    return this.list(OWNER_TYPES.CATEGORY, categoryId, companyId, tier);
  }

  /**
   * Lists comments by owner type and ID.
   * Only supports 'CATEGORY' as owner type currently.
   * @param {string} ownerType - The type of owner (e.g., 'CATEGORY').
   * @param {string} ownerId - The ID of the owner entity.
   * @param {string} companyId - The ID of the company.
   * @param {string} tier - The tier of the comments.
   * @returns {Promise<Array<Object>>} - A list of comment objects.
   * @throws {Error} - If the owner type is not supported.
   */
  list(ownerType, ownerId, companyId, tier) {
    // Only CATEGORY owner type is supported at this time
    if (ownerType !== OWNER_TYPES.CATEGORY) {
      throw Error(`No implementation for ${ownerType} owner type`);
    }
    // Query comments matching owner type, owner id, company, and tier, ordered by creation date
    return this.collection
      .where('owner_type', '==', ownerType)
      .where('owner_id', '==', ownerId)
      .where('company_id', '==', companyId)
      .where('tier', '==', tier)
      .orderBy('created_at', 'desc')
      .get()
      .then((result) => {
        return Promise.resolve(result.docs.map(docToObject));
      });
  }

  /**
   * Removes a comment by its ID.
   * @param {Object} user - The user requesting deletion (unused currently).
   * @param {string} id - The ID of the comment to delete.
   * @returns {Promise<FirebaseFirestore.WriteResult>} - The result of the delete operation.
   */
  removeComment(user, id) {
    // Delete the comment document from Firestore
    return this.collection.doc(id).delete();
  }
};
