const { pool } = require('../../config/database');

const list = async ({ category, search, page = 1, limit = 10 }) => {
  let where = 'WHERE 1=1';
  const params = [];
  if (category) { where += ' AND category = ?'; params.push(category); }
  if (search) { where += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  const offset = (page - 1) * limit;
  const [rows] = await pool.execute(
    `SELECT * FROM schemes ${where} ORDER BY name LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.execute(`SELECT COUNT(*) as total FROM schemes ${where}`, params);
  return { rows, total, page, limit, pages: Math.ceil(total / limit) };
};

const getById = async (id) => {
  const [rows] = await pool.execute(`SELECT * FROM schemes WHERE id = ? LIMIT 1`, [id]);
  if (!rows.length) throw Object.assign(new Error('Scheme not found'), { statusCode: 404 });
  return rows[0];
};

module.exports = { list, getById };
