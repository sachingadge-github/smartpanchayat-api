const { pool }  = require('../../config/database');
const firebase  = require('../../config/firebase');
const logger    = require('../../utils/logger')('notification.service');

const registerToken = async (citizenId, token, platform) => {
  logger.info('registerToken', { citizenId, platform });
  await pool.execute(
    `INSERT INTO device_tokens (citizen_id, token, platform)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE platform = VALUES(platform), updated_at = NOW()`,
    [parseInt(citizenId, 10), token, platform]
  );
};

const removeToken = async (citizenId, token) => {
  logger.info('removeToken', { citizenId });
  await pool.execute(
    `DELETE FROM device_tokens WHERE citizen_id = ? AND token = ?`,
    [parseInt(citizenId, 10), token]
  );
};

// Send to a single citizen (all their registered devices)
const sendToUser = async (citizenId, title, body, data = {}) => {
  citizenId = parseInt(citizenId, 10);
  logger.info('sendToUser', { citizenId, title });

  const [rows] = await pool.execute(
    `SELECT token FROM device_tokens WHERE citizen_id = ?`,
    [citizenId]
  );

  if (!rows.length) {
    logger.debug('no device tokens for citizen', { citizenId });
    return { sent: 0, skipped: 0 };
  }

  const tokens = rows.map(r => r.token);
  return _sendToTokens(tokens, title, body, data);
};

// Send to all citizens of a panchayat
const sendToPanchayat = async (panchayatId, title, body, data = {}) => {
  panchayatId = parseInt(panchayatId, 10);
  logger.info('sendToPanchayat', { panchayatId, title });

  const [rows] = await pool.execute(
    `SELECT dt.token FROM device_tokens dt
     JOIN citizens c ON dt.citizen_id = c.id
     WHERE c.panchayat_id = ?`,
    [panchayatId]
  );

  if (!rows.length) {
    logger.debug('no device tokens for panchayat', { panchayatId });
    return { sent: 0, skipped: 0 };
  }

  const tokens = rows.map(r => r.token);
  return _sendToTokens(tokens, title, body, data);
};

// Internal: send to a list of FCM tokens
const _sendToTokens = async (tokens, title, body, data = {}) => {
  const messaging = firebase.getMessaging();

  if (!messaging) {
    logger.warn('FCM not initialised — notification not sent (mock)', { title, tokens: tokens.length });
    return { sent: 0, skipped: tokens.length, mock: true };
  }

  // FCM allows max 500 tokens per multicast
  const chunks = [];
  for (let i = 0; i < tokens.length; i += 500) chunks.push(tokens.slice(i, i + 500));

  let totalSent = 0, totalFailed = 0;
  const staleTokens = [];

  for (const chunk of chunks) {
    const message = {
      tokens: chunk,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      android: { priority: 'high', notification: { sound: 'default', channelId: 'smart_panchayat' } },
      apns:    { payload: { aps: { sound: 'default', badge: 1 } } },
    };

    try {
      const response = await messaging.sendEachForMulticast(message);
      totalSent   += response.successCount;
      totalFailed += response.failureCount;

      response.responses.forEach((r, i) => {
        if (!r.success && r.error) {
          const code = r.error.code;
          if (code === 'messaging/registration-token-not-registered' ||
              code === 'messaging/invalid-registration-token') {
            staleTokens.push(chunk[i]);
          }
          logger.warn('FCM send failed for token', { code, token: chunk[i].slice(0, 20) + '...' });
        }
      });
    } catch (err) {
      logger.error('FCM multicast error', { error: err.message });
      totalFailed += chunk.length;
    }
  }

  // Clean up stale tokens
  if (staleTokens.length) {
    logger.info('removing stale FCM tokens', { count: staleTokens.length });
    for (const token of staleTokens) {
      await pool.execute(`DELETE FROM device_tokens WHERE token = ?`, [token]).catch(() => {});
    }
  }

  logger.info('FCM send complete', { sent: totalSent, failed: totalFailed });
  return { sent: totalSent, failed: totalFailed };
};

module.exports = { registerToken, removeToken, sendToUser, sendToPanchayat };
