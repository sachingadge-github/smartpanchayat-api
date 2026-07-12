const env = require('../config/env');
const { pool } = require('../config/database');

const generate = () => {
  if (env.otp.mock) return env.otp.mockCode;
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const save = async (mobile, otp, purpose = 'login') => {
  const expiresAt = new Date(Date.now() + env.otp.expiresMinutes * 60 * 1000);
  await pool.execute(
    `INSERT INTO otp_logs (mobile, otp, purpose, expires_at) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE otp=VALUES(otp), expires_at=VALUES(expires_at), verified=0, created_at=NOW()`,
    [mobile, otp, purpose, expiresAt]
  );
};

const verify = async (mobile, otp, purpose = 'login') => {
  const [rows] = await pool.execute(
    `SELECT id FROM otp_logs
     WHERE mobile = ? AND otp = ? AND purpose = ? AND verified = 0 AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [mobile, otp, purpose]
  );
  if (!rows.length) return false;
  await pool.execute(`UPDATE otp_logs SET verified = 1 WHERE id = ?`, [rows[0].id]);
  return true;
};

const send = async (mobile, otp) => {
  if (env.otp.mock) {
    console.log(`[MOCK OTP] Mobile: ${mobile} | OTP: ${otp}`);
    return;
  }
  // TODO: integrate SMS provider (e.g. MSG91, Twilio)
  throw new Error('SMS provider not configured');
};

module.exports = { generate, save, verify, send };
