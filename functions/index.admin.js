const path = require('path');
const admin = require('firebase-admin');
const serviceAccount = require(path.join(__dirname, process.env.AUTH_FILE));

/**
 * Initializes and returns the Firebase Admin SDK instance.
 * Ensures the app is only initialized once.
 *
 * @returns {admin.app.App} Initialized Firebase Admin app instance.
 */
module.exports.getFirebaseAdmin = () => {
  // Initialize the Firebase Admin app only if no apps have been initialized yet
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: "ignite-program-kmfi"
    });
  }
  // Return the initialized Firebase Admin app instance
  return admin;
};
