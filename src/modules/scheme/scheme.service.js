const { pool } = require('../../config/database');
const logger   = require('../../utils/logger')('scheme.service');

const list = async ({ category, search, page = 1, limit = 10 }) => {
  page  = parseInt(page, 10);
  limit = parseInt(limit, 10);
  logger.debug('list', { category, search, page, limit });
  let where = 'WHERE 1=1';
  const params = [];
  if (category) { where += ' AND category = ?'; params.push(category); }
  if (search)   { where += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  const offset = (page - 1) * limit;
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM schemes ${where} ORDER BY name LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.execute(`SELECT COUNT(*) as total FROM schemes ${where}`, params);
    logger.debug('list result', { total, returned: rows.length });
    return { rows, total, page, limit, pages: Math.ceil(total / limit) };
  } catch (err) {
    logger.error('list failed', { category, search, page, limit, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const getById = async (id) => {
  logger.debug('getById', { id });
  try {
    const [rows] = await pool.execute(`SELECT * FROM schemes WHERE id = ? LIMIT 1`, [id]);
    if (!rows.length) throw Object.assign(new Error('Scheme not found'), { statusCode: 404 });
    return rows[0];
  } catch (err) {
    if (!err.statusCode) logger.error('getById failed', { id, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

module.exports = { list, getById };
