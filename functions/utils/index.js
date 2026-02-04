const jwt = require('jsonwebtoken');
// Legacy JWT signing secret (ONLY for backward compatibility during migration).
// Do NOT use service-account private keys as HS256 secrets.
const LEGACY_JWT_SECRET = process.env.LEGACY_JWT_SECRET;
const {getFirebaseAdmin} = require('../index.admin');
const validate = require('validate.js');
const {firestore} = require('firebase-admin');
const Busboy = require('busboy');
const {extname, join} = require('path');
const {createWriteStream} = require('fs');
const {tmpdir} = require('os');
const {ADMIN_ROLES} = require('../policies');

/**
 * Exports a customized instance of the validate.js validator
 * with a formatter that groups validation messages by attribute.
 *
 * @returns {Object} - The customized validate.js validator instance
 */
module.exports.validate = (() => {
  const validator = validate;

  validate.formatters.grouped = (errs) => {
    const errors = {};

    errs.every((e) => {
      let msg;
      if (e.options && e.options.message) msg = e.options.message;
      else msg = e.error;
      if (errors[e.attribute]) errors[e.attribute].push(msg);
      else errors[e.attribute] = [msg];
    });

    return errors;
  };

  return validator;
})();

/**
 * Sends an email using the provided transport and parameters.
 *
 * @param {Object} transport - The email transport object (e.g., nodemailer transport)
 * @param {Object} params - Email parameters
 * @param {String} params.from - Sender's email address
 * @param {String} params.to - Recipient's email address
 * @param {String} params.subject - Subject of the email
 * @param {String} params.html - HTML body content of the email
 * @returns {Promise<Object>} - Resolves with mail info or rejects with an error
 */
module.exports.sendEmail = (transport, params = {}) =>
  new Promise((resolve, reject) => {
    // Check if transport object has a sendMail function
    if (!transport.sendMail) {
      return reject(new Error('Mail object does not satisfy a `sendMail` interface'));
    }
    transport.sendMail(
      {
        from: params.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
        replyTo: process.env.REPLY_TO_EMAIL
      },
      (err, info) => {
        if (err) return reject(err);
        return resolve(info);
      }
    );
  });

/**
 * Creates and signs a JWT for a user with optional expiration time and extra claims.
 *
 * @param {String} uid - User ID
 * @param {Number} [exp] - Optional expiration time (defaults to 10 minutes from now)
 * @param {Object} [extraClaims] - Extra claims to include (e.g., { apps: ["KMFI"] })
 * @returns {Promise<String>} - Resolves with signed JWT
 */
module.exports.signJwtToken = (
  uid,
  exp = Math.floor(Date.now() / 1000) + 60 * 10,
  extraClaims = {}
) => {
  console.log(`Signing JWT for uid: ${uid} with exp:`, exp, 'and extraClaims:', extraClaims);
  if (!LEGACY_JWT_SECRET) {
    throw new Error('LEGACY_JWT_SECRET is not set. Set it in Functions config / env for legacy JWT signing.');
  }

  // Minimal legacy payload. Add optional claims like `apps` for backward compatibility.
  const payload = {
    uid,
    ...extraClaims,
  };

  // Standard JWT fields are set via options.
  const options = {
    algorithm: 'HS256',
    // jsonwebtoken requires expiresIn to be an integer seconds value or a timespan string.
    // Accept exp as seconds (preferred). If a millisecond timestamp is passed, convert it.
    expiresIn: (() => {
      const nowSec = Math.floor(Date.now() / 1000);
      let expSec = typeof exp === 'number' ? exp : Number(exp);
      if (!Number.isFinite(expSec)) return 60;
      // If exp looks like a millisecond epoch (e.g., 1700000000000), convert to seconds.
      if (expSec > 1e12) expSec = Math.floor(expSec / 1000);
      expSec = Math.floor(expSec);
      const ttl = expSec - nowSec;
      return Math.max(ttl, 60);
    })(),
    issuer: process.env.JWT_ISSUER || 'ignite-program',
    subject: String(uid),
  };
  console.log('JWT expiresIn (seconds):', options.expiresIn);

  return new Promise((resolve, reject) => {
    jwt.sign(payload, LEGACY_JWT_SECRET, options, (err, token) => {
      if (err) return reject(err);
      return resolve(token);
    });
  });
};

/**
 * Trims and lowercases the given email address.
 *
 * @param {string} email - Input email address
 * @returns {string} - Sanitized email address
 */
module.exports.sanitizeEmailAddress = (email) => email.trim().toLowerCase();

/**
 * Verifies an incoming bearer token.
 *
 * Primary path: verify Firebase Auth ID token via Admin SDK (supports custom claims like `apps`).
 * Fallback path: verify legacy locally-signed JWT (kept for backward compatibility during migration).
 *
 * @param {string} token - Bearer token (Firebase ID token recommended)
 * @returns {Promise<Object>} - Decoded token payload
 */
module.exports.verifyJwt = async (token) => {
  // 1) Preferred: Firebase Auth ID token
  try {
    const admin = getFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded;
  } catch (e) {
    // Continue to fallback
  }

  // 2) Fallback: legacy locally signed JWT (does NOT include Firebase custom claims)
  return new Promise((resolve, reject) => {
    const options = {algorithm: 'HS256'};
    if (!LEGACY_JWT_SECRET) return reject(new Error('LEGACY_JWT_SECRET is not set for legacy JWT verification'));
    jwt.verify(token, LEGACY_JWT_SECRET, options, (err, payload) => {
      if (err) return reject(err);
      return resolve(payload);
    });
  });
};

/**
 * Converts a Firestore document snapshot to a plain JavaScript object,
 * converting Firestore timestamps to JS Dates for specific fields.
 *
 * @param {firestore.DocumentSnapshot} doc - Firestore document snapshot
 * @returns {Object} - Converted document data with ID
 */
module.exports.docToObject = function (doc) {
  if (!doc.id) {
    console.warn('Doc is empty.');
    return {};
  }
  const data = doc.data();

  const dateFieldNames = ['created_at', 'updated_at', 'deleted_at'];

  // Convert dateFields from firestore Timestamp objects to javascript Date type if defined
  dateFieldNames.forEach((fieldName) => {
    const dateObj = data[fieldName];
    if (dateObj) {
      data[fieldName] = new firestore.Timestamp(dateObj._seconds, dateObj._nanoseconds).toDate();
    }
  });
  return {id: doc.id, ...data};
};

// Constraint definitions for pagination parameters.
module.exports.paginationConstraint = {
  'page-size': {
    numericality: true,
    presence: {allowEmpty: false},
  },
  'before': {
    type: 'string',
  },
  'after': {
    type: 'string',
  },
};

/**
 * Dynamically creates validate.js constraints for a list of required string fields.
 *
 * @param {...string} strings - Field names to validate as non-empty strings
 * @returns {Object} - Constraint object
 */
module.exports.recursiveStringContraints = (...strings) => strings.reduce((accum, str) => ({
  ...accum,
  [str]: {
    type: 'string',
    presence: {allowEmpty: false},
  }
}), {});

// Constraint definition for company and cycle identifiers.
module.exports.companyAndCycle = {
  'cycle-id': {
    type: 'string',
  },
  'company-id': {
    type: 'string',
    presence: {allowEmpty: false},
  },
};

/**
 * Handles file upload from request using busboy and uploads to Firebase Storage.
 *
 * @param {Object} admin - Firebase admin SDK instance
 * @param {Object} req - HTTP request containing file stream
 * @param {string} [fname] - Optional new filename to use
 * @param {string} [filePath] - Optional destination path in storage bucket
 * @returns {Promise<Object>} - Metadata of uploaded file
 */
module.exports.uploadHelper = (admin, req, fname = null, filePath = null) => new Promise((resolve, reject) => {
  const busboy = new Busboy({headers: req.headers});

  let uploadedFileMeta = {};

  // Stream file data from the request using busboy
  // eslint-disable-next-line
  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    const friendlyFileName = fname ? fname + extname(filename) : filename;

    const filepath = join(tmpdir(), friendlyFileName);
    uploadedFileMeta = {...uploadedFileMeta, friendlyFileName, filepath};
    file.pipe(createWriteStream(filepath));
  });

  busboy.on('finish', async () => {
    try {
      // eslint-disable-next-line
      const [file, metadata] = await admin.storage().bucket().upload(
        uploadedFileMeta.filepath,
        {
          destination: filePath ? filePath + uploadedFileMeta.friendlyFileName : uploadedFileMeta.friendlyFileName,
        }
      );
      resolve(metadata);
    } catch (e) {
      console.error('Upload failed: ', e);
      reject(e);
    }
  });
  busboy.end(req.rawBody);
});

/**
 * Determines if a user with a specific admin role can invite another role.
 *
 * @param {string} userRole - Role of the inviting admin
 * @param {string} invitedUserAssignedRole - Intended role for the invited user
 * @returns {boolean} - True if invite is permitted, otherwise false
 */
module.exports.adminCanInvite = (userRole, invitedUserAssignedRole) => {
  switch (userRole) {
    case ADMIN_ROLES.NUCLEAR:
      return true;
    case ADMIN_ROLES.SUPER:
      return [ADMIN_ROLES.BASIC, ADMIN_ROLES.SUPER, ADMIN_ROLES.IVC].includes(
        invitedUserAssignedRole
      );
    case ADMIN_ROLES.IVC:
      return ADMIN_ROLES.IVC == invitedUserAssignedRole;
    case ADMIN_ROLES.BASIC:
      return [ADMIN_ROLES.BASIC, ADMIN_ROLES.IVC].includes(invitedUserAssignedRole);
    default:
      return false;
  }
};
