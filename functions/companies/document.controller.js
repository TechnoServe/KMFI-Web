const path = require('path');
const fs = require('fs');
const os = require('os');
const express = require('express');
const Busboy = require('busboy');
const {v4: uuidv4} = require('uuid');
const {getFirebaseAdmin} = require('../index.admin');

const admin = getFirebaseAdmin();

const bucket = admin.storage().bucket();

/**
 * Document Controller
 */
class DocumentController {
  /**
   * Uploads a document for a specific category and company.
   * Handles multi-part form data using Busboy, uploads file to Firebase Storage,
   * then stores file metadata in Firestore via `store.documents.create`.
   *
   * @param {Request} req - Express request object with `rawBody`, headers, and user/store context.
   * @param {Response} res - Express response object used to send the result or error.
   * @returns {Promise<void>} Responds with cloud file metadata on success or 500 on error.
   */
  static async create(req, res) {
    const FIELD_NAMES = {
      DOCUMENT: 'document',
      CATEGORY_ID: 'category_id',
      COMPANY_ID: 'company_id',
      TIER: 'tier'
    };

    try {
      // eslint-disable-next-line
      const {store, body, user, file} = req;

      const busboy = new Busboy({headers: req.headers});
      // This object will accumulate all the uploaded files, keyed by their name
      const uploads = {};
      const others = {};

      // This callback will be invoked for each file uploaded
      busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        const friendlyFileName = uuidv4() + path.extname(filename);

        // Note that os.tmpdir() is an in-memory file system, so should only
        // be used for files small enough to fit in memory.
        const filepath = path.join(os.tmpdir(), friendlyFileName);

        uploads[fieldname] = {
          file: filepath,
          originalFileName: filename
        };
        file.pipe(fs.createWriteStream(filepath));
      });

      // Collect non-file fields from the form
      busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
        others[fieldname] = val;
      });

      // This callback will be invoked after all uploaded files are saved.
      busboy.on('finish', async () => {
        // uploads[fieldName].file === path to uploaded file
        const {file: localFilePath, originalFileName} = uploads[FIELD_NAMES.DOCUMENT];
        const categoryId = others[FIELD_NAMES.CATEGORY_ID];
        try {
          const [file, metadata] = await bucket.upload(localFilePath);
          store.documents.create(user, {
            originalFileName,
            fileName: file.name,
            storageId: metadata.id,
            contentType: metadata.contentType,
            size: metadata.size,
            category_id: others[FIELD_NAMES.CATEGORY_ID],
            owner: {id: categoryId},
            companyId: others[FIELD_NAMES.COMPANY_ID],
            tier: others[FIELD_NAMES.TIER]
          });
          res.write(`Cloud file data: ${JSON.stringify(metadata)}\n`);
          res.end();
        } catch (e) {
          console.error('Upload failed: ', e);
          res.status(500).json({
            message: e.toString()
          });
        }
      });

      // The raw bytes of the upload will be in req.rawBody.  Send it to busboy, and get
      // a callback when it's finished.
      busboy.end(req.rawBody);
    } catch (e) {
      console.error(e);
      res.sendStatus(500).end();
    }
  }

  /**
   * Retrieves documents associated with a specific category and company.
   * Used to list documents based on category and optional tier.
   *
   * @param {Request} req - Express request object with route params, query params, and user/store context.
   * @param {Response} res - Express response object used to return document list.
   * @returns {Promise<void>} JSON response with document data and base storage URL.
   */
  static async forCategory(req, res) {
    const {
      user,
      store,
      params: {id: categoryId},
      query: {company_id: companyId, tier}
    } = req;
    // Use store.documents.getDocumentsForCategory to fetch documents by category and company
    const result = await store.documents.getDocumentsForCategory(companyId || user.company_user.company_id, categoryId, tier);
    res.json({
      baseUrl: `https://www.googleapis.com/storage/v1/b/${process.env.PROJECT_ID}.appspot.com/o/`,
      result,
    });
  }

  /**
   * Deletes a document from Firebase Storage and Firestore.
   * Only allows deletion by the user who owns the document.
   *
   * @param {Request} req - Express request object with route params and user/store context.
   * @param {Response} res - Express response object used to confirm deletion or report error.
   * @returns {Promise<void>} JSON success response or appropriate error status.
   */
  static async delete(req, res) {
    const {store, params, user} = req;
    const doc = await store.documents.getById(user, params.id);

    // Access control: check if document exists and if current user is the owner
    if (!doc) return res.status(404).json({message: 'Resource not found.'});
    if (doc.user_id !== user.id) return res.status(403).json({message: 'Unauthorized'});

    await bucket.file(doc.file_name).delete();
    await store.documents.removeDocument(user, params.id);
    res.json({result: 'ok'});
  }
}

const documentRouter = new express.Router();
documentRouter.post('/', DocumentController.create);
documentRouter.get('/list/category/:id', DocumentController.forCategory);
documentRouter.delete('/:id', DocumentController.delete);

module.exports.documentRouter = documentRouter;
