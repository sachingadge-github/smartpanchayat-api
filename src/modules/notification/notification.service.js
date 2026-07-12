const { pool } = require('../../config/database');

const registerToken = async (citizenId, token, platform) => {
  await pool.execute(
    `INSERT INTO device_tokens (citizen_id, token, platform)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE platform = VALUES(platform), updated_at = NOW()`,
    [citizenId, token, platform]
  );
};

const removeToken = async (citizenId, token) => {
  await pool.execute(`DELETE FROM device_tokens WHERE citizen_id = ? AND token = ?`, [citizenId, token]);
};

// TODO: integrate FCM / APNs for real push notifications
const send = async (citizenId, title, body, data = {}) => {
  console.log(`[PUSH] → Citizen ${citizenId}: ${title} — ${body}`);
  return { sent: true, mock: true };
};

module.exports = { registerToken, removeToken, send };
