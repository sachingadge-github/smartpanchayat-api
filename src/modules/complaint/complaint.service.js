const { pool } = require('../../config/database');

const generateRef = () => `CMP-${Date.now().toString().slice(-6)}`;

const create = async (citizenId, data, photoUrl = null) => {
  const ref = generateRef();
  const [result] = await pool.execute(
    `INSERT INTO complaints (citizen_id, panchayat_id, category, description, photo_url, location, latitude, longitude, reference_no, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
    [citizenId, data.panchayat_id, data.category, data.description, photoUrl,
     data.location || null, data.latitude || null, data.longitude || null, ref]
  );
  return getById(result.insertId);
};

const getById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT c.*, ci.name as citizen_name, ci.mobile as citizen_mobile, p.name as panchayat_name
     FROM complaints c
     JOIN citizens ci ON c.citizen_id = ci.id
     JOIN panchayats p ON c.panchayat_id = p.id
     WHERE c.id = ? LIMIT 1`,
    [id]
  );
  if (!rows.length) throw Object.assign(new Error('Complaint not found'), { statusCode: 404 });
  return rows[0];
};

const listMine = async (citizenId, { status, category, page = 1, limit = 10 }) => {
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);
  let where = 'WHERE c.citizen_id = ?';
  const params = [citizenId];
  if (status) { where += ' AND c.status = ?'; params.push(status); }
  if (category) { where += ' AND c.category = ?'; params.push(category); }
  const offset = (page - 1) * limit;
  const [rows] = await pool.execute(
    `SELECT c.*, p.name as panchayat_name FROM complaints c
     JOIN panchayats p ON c.panchayat_id = p.id
     ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.execute(`SELECT COUNT(*) as total FROM complaints c ${where}`, params);
  return { rows, total, page, limit, pages: Math.ceil(total / limit) };
};

const listByPanchayat = async (panchayatId, { status, category, page = 1, limit = 10 }) => {
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);
  let where = 'WHERE c.panchayat_id = ?';
  const params = [panchayatId];
  if (status) { where += ' AND c.status = ?'; params.push(status); }
  if (category) { where += ' AND c.category = ?'; params.push(category); }
  const offset = (page - 1) * limit;
  const [rows] = await pool.execute(
    `SELECT c.*, ci.name as citizen_name FROM complaints c
     JOIN citizens ci ON c.citizen_id = ci.id
     ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.execute(`SELECT COUNT(*) as total FROM complaints c ${where}`, params);
  return { rows, total, page, limit, pages: Math.ceil(total / limit) };
};

const updateStatus = async (id, status, remark) => {
  await pool.execute(
    `UPDATE complaints SET status = ?, remark = ?, updated_at = NOW() WHERE id = ?`,
    [status, remark || null, id]
  );
  return getById(id);
};

module.exports = { create, getById, listMine, listByPanchayat, updateStatus };
