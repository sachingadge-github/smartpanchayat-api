const { pool } = require('../../config/database');

const TYPES = ['general', 'meeting', 'scheme', 'water', 'emergency'];

const create = async (data) => {
  const [result] = await pool.execute(
    `INSERT INTO notices (panchayat_id, title, body, type, created_by) VALUES (?, ?, ?, ?, ?)`,
    [data.panchayat_id, data.title, data.body, data.type || 'general', data.created_by]
  );
  return getById(result.insertId);
};

const getById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT n.*, p.name as panchayat_name FROM notices n
     JOIN panchayats p ON n.panchayat_id = p.id WHERE n.id = ? LIMIT 1`,
    [id]
  );
  if (!rows.length) throw Object.assign(new Error('Notice not found'), { statusCode: 404 });
  return rows[0];
};

const list = async ({ panchayat_id, type, page = 1, limit = 10 }) => {
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);
  let where = 'WHERE 1=1';
  const params = [];
  if (panchayat_id) { where += ' AND n.panchayat_id = ?'; params.push(panchayat_id); }
  if (type) { where += ' AND n.type = ?'; params.push(type); }
  const offset = (page - 1) * limit;
  const [rows] = await pool.execute(
    `SELECT n.*, p.name as panchayat_name FROM notices n
     JOIN panchayats p ON n.panchayat_id = p.id
     ${where} ORDER BY n.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.execute(`SELECT COUNT(*) as total FROM notices n ${where}`, params);
  return { rows, total, page, limit, pages: Math.ceil(total / limit) };
};

const remove = async (id) => {
  await pool.execute(`DELETE FROM notices WHERE id = ?`, [id]);
};

module.exports = { create, getById, list, remove };
