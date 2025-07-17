const {docToObject} = require('../utils');
const {firestore} = require('firebase-admin');
const {COLLECTIONS, OWNER_TYPES} = require('../constants');

module.exports.DocumentStore = class DocumentStore {
  /**
   * Documents Constructor
   * @param {FirebaseFirestore.Firestore} db - The Firestore database instance.
   * @param {Object} auth - The authentication object (not used directly in this class).
   */
  constructor(db, auth) {
    // Reference to the Firestore documents collection
    this.collection = db.collection(COLLECTIONS.DOCUMENTS);
    this.auth = auth;
  }

  /**
   * Create a new document record in Firestore
   * @param {Object} user - The user object creating the document
   * @param {Object} fileAttributes - Metadata about the file
   * @param {string} fileAttributes.originalFileName - Original name of the uploaded file
   * @param {string} fileAttributes.fileName - Renamed or system filename
   * @param {Object} fileAttributes.owner - The owner of the document (typically a category)
   * @param {string} fileAttributes.storageId - Storage ID for locating the file
   * @param {number} fileAttributes.size - File size in bytes
   * @param {string} fileAttributes.contentType - MIME type of the file
   * @param {string} [fileAttributes.companyId=''] - Optional override for company ID
   * @param {string} [fileAttributes.tier='TIER_1'] - Tier classification of the document
   * @returns {Promise<FirebaseFirestore.WriteResult>} Result of Firestore write operation
   */
  create(
    user,
    {originalFileName, fileName, owner, storageId, size, contentType, companyId='', tier='TIER_1'}
  ) {
    // Build the document data object for Firestore
    const docData = {
      storage_id: storageId,
      // Prefer user's company ID if available, else use provided companyId
      company_id: user.company_user ? user.company_user.company_id : companyId,
      user_id: user.id,
      owner_type: OWNER_TYPES.CATEGORY,
      owner_id: owner.id,
      size,
      file_name: fileName,
      original_file_name: originalFileName,
      content_type: contentType,
      created_at: firestore.Timestamp.now(), // Set creation timestamp
      updated_at: firestore.Timestamp.now(), // Set update timestamp
      tier
    };
    // Save document to Firestore
    return this.collection.doc().create(docData);
  }

  /**
   * Retrieve all documents associated with a specific category
   * @param {string} companyId - ID of the company
   * @param {string} categoryId - ID of the category
   * @param {string} tier - Tier classification of the document
   * @returns {Promise<Array<Object>>} List of document objects
   */
  getDocumentsForCategory(companyId, categoryId, tier) {
    // Call the list method for category owner type
    return this.list(OWNER_TYPES.CATEGORY, categoryId, companyId, tier);
  }

  /**
   * List all documents by owner type and ID
   * @param {string} ownerType - The type of entity owning the document (e.g., CATEGORY)
   * @param {string} ownerId - The ID of the owning entity
   * @param {string} companyId - ID of the company
   * @param {string} tier - Tier classification of the document
   * @returns {Promise<Array<Object>>} Array of document objects
   * @throws {Error} If owner type is not CATEGORY
   */
  list(ownerType, ownerId, companyId, tier) {
    // Only CATEGORY owner type is supported
    if (ownerType !== OWNER_TYPES.CATEGORY) {
      throw Error(`No implementation for ${ownerType} owner type`);
    }
    // Query Firestore for documents matching the filters
    return this.collection
      .where('owner_type', '==', ownerType)
      .where('owner_id', '==', ownerId)
      .where('company_id', '==', companyId)
      .where('tier', '==', tier)
      .get()
      .then((result) => {
        // Convert Firestore docs to plain JS objects
        return Promise.resolve(result.docs.map(docToObject));
      });
  }

  /**
   * Get a single document by its ID
   * @param {Object} user - The user requesting the document
   * @param {string} id - Document ID
   * @returns {Promise<Object|null>} The document object or null if not found
   */
  async getById(user, id) {
    // Fetch document by ID from Firestore
    const docRef = await this.collection.doc(id).get();
    // If document exists, convert to JS object, else return null
    return docRef.exists ? docToObject(docRef) : null;
  }

  /**
   * Delete a document by ID
   * @param {Object} user - The user requesting deletion
   * @param {string} id - Document ID to delete
   * @returns {Promise<FirebaseFirestore.WriteResult>} Result of Firestore delete operation
   */
  removeDocument(user, id) {
    // Delete document from Firestore
    return this.collection.doc(id).delete();
  }
};
