const { pool } = require('../../config/database');
const otpUtil  = require('../../utils/otp');
const jwtUtil  = require('../../utils/jwt');
const env      = require('../../config/env');
const logger   = require('../../utils/logger')('auth.service');

const sendOtp = async (mobile) => {
  const otp = otpUtil.generate();
  await otpUtil.save(mobile, otp, 'login');
  await otpUtil.send(mobile, otp);
  return env.otp.mock ? { mock: true, otp } : { mock: false };
};

const verifyOtp = async (mobile, otp) => {
  const valid = await otpUtil.verify(mobile, otp, 'login');
  if (!valid) throw Object.assign(new Error('Invalid or expired OTP'), { statusCode: 400 });

  let [rows] = await pool.execute(`SELECT * FROM citizens WHERE mobile = ? LIMIT 1`, [mobile]);
  let citizen = rows[0];
  const isNew = !citizen;

  if (isNew) {
    const [result] = await pool.execute(
      `INSERT INTO citizens (mobile, role) VALUES (?, 'citizen')`,
      [mobile]
    );
    [rows] = await pool.execute(`SELECT * FROM citizens WHERE id = ? LIMIT 1`, [result.insertId]);
    citizen = rows[0];
  }

  const payload = { id: citizen.id, mobile: citizen.mobile, role: citizen.role };
  return {
    isNew,
    citizen,
    accessToken: jwtUtil.sign(payload),
    refreshToken: jwtUtil.signRefresh(payload),
  };
};

const refreshToken = async (token) => {
  try {
    const decoded = jwtUtil.verify(token);
    const [rows] = await pool.execute(`SELECT * FROM citizens WHERE id = ? LIMIT 1`, [decoded.id]);
    if (!rows.length) throw new Error('Citizen not found');
    const { id, mobile, role } = rows[0];
    return { accessToken: jwtUtil.sign({ id, mobile, role }) };
  } catch {
    throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
  }
};

const register = async ({ name, mobile, panchayat_id }) => {
  logger.info('register attempt', { mobile, panchayat_id });

  const [existing] = await pool.execute(
    `SELECT id FROM citizens WHERE mobile = ? LIMIT 1`, [mobile]
  );
  if (existing.length) {
    throw Object.assign(new Error('Mobile number already registered'), { statusCode: 409 });
  }

  const [panchayat] = await pool.execute(
    `SELECT id FROM panchayats WHERE id = ? LIMIT 1`, [parseInt(panchayat_id, 10)]
  );
  if (!panchayat.length) {
    throw Object.assign(new Error('Panchayat not found'), { statusCode: 404 });
  }

  const [result] = await pool.execute(
    `INSERT INTO citizens (name, mobile, panchayat_id, role) VALUES (?, ?, ?, 'citizen')`,
    [name.trim(), mobile, parseInt(panchayat_id, 10)]
  );

  const [[citizen]] = await pool.execute(
    `SELECT c.*, p.name as panchayat_name FROM citizens c
     LEFT JOIN panchayats p ON c.panchayat_id = p.id
     WHERE c.id = ? LIMIT 1`,
    [result.insertId]
  );

  const payload = { id: citizen.id, mobile: citizen.mobile, role: citizen.role };
  logger.info('register success', { id: citizen.id, mobile });
  return {
    citizen,
    accessToken:  jwtUtil.sign(payload),
    refreshToken: jwtUtil.signRefresh(payload),
  };
};

module.exports = { sendOtp, verifyOtp, refreshToken, register };
