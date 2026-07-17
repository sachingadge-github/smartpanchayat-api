const admin  = require('firebase-admin');
const path   = require('path');
const logger = require('../utils/logger')('firebase');

let messaging = null;

function init() {
  if (messaging) return messaging;

  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!keyPath) {
    logger.warn('FIREBASE_SERVICE_ACCOUNT_PATH not set — push notifications disabled');
    return null;
  }

  try {
    const serviceAccount = require(path.resolve(keyPath));
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
    messaging = admin.messaging();
    logger.info('Firebase Admin SDK initialised');
    return messaging;
  } catch (err) {
    logger.error('Firebase init failed', { error: err.message });
    return null;
  }
}

module.exports = { init, getMessaging: () => messaging };
