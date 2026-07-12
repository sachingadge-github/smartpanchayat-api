const { pool } = require('../../config/database');
const otpUtil = require('../../utils/otp');
const jwtUtil = require('../../utils/jwt');
const env = require('../../config/env');

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

module.exports = { sendOtp, verifyOtp, refreshToken };
