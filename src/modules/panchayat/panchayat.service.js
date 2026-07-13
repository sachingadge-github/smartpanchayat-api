const { pool } = require('../../config/database');
const logger   = require('../../utils/logger')('panchayat.service');

const getAll = async ({ search, district, taluka, page = 1, limit = 20 }) => {
  page  = parseInt(page, 10);
  limit = parseInt(limit, 10);
  logger.debug('getAll', { search, district, taluka, page, limit });
  let where = 'WHERE 1=1';
  const params = [];
  if (search)   { where += ' AND name LIKE ?';    params.push(`%${search}%`); }
  if (district) { where += ' AND district = ?';   params.push(district); }
  if (taluka)   { where += ' AND taluka = ?';     params.push(taluka); }
  const offset = (page - 1) * limit;
  try {
    const [rows] = await pool.execute(`SELECT * FROM panchayats ${where} ORDER BY name LIMIT ? OFFSET ?`, [...params, limit, offset]);
    const [[{ total }]] = await pool.execute(`SELECT COUNT(*) as total FROM panchayats ${where}`, params);
    logger.debug('getAll result', { total, returned: rows.length });
    return { rows, total, page, limit, pages: Math.ceil(total / limit) };
  } catch (err) {
    logger.error('getAll failed', { search, district, taluka, page, limit, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const getById = async (id) => {
  id = parseInt(id, 10);
  logger.debug('getById', { id });
  try {
    const [rows] = await pool.execute(
      `SELECT p.*,
         (SELECT COUNT(*) FROM citizens WHERE panchayat_id = p.id) AS citizen_count,
         (SELECT COUNT(*) FROM complaints WHERE panchayat_id = p.id AND status != 'resolved') AS open_complaints
       FROM panchayats p WHERE p.id = ? LIMIT 1`,
      [id]
    );
    if (!rows.length) throw Object.assign(new Error('Panchayat not found'), { statusCode: 404 });
    return rows[0];
  } catch (err) {
    if (!err.statusCode) logger.error('getById failed', { id, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const getStats = async (id) => {
  id = parseInt(id, 10);
  logger.debug('getStats', { id });
  try {
    const [[stats]] = await pool.execute(
      `SELECT
         (SELECT COUNT(*) FROM citizens WHERE panchayat_id = ?) as total_citizens,
         (SELECT COUNT(*) FROM complaints WHERE panchayat_id = ?) as total_complaints,
         (SELECT COUNT(*) FROM complaints WHERE panchayat_id = ? AND status = 'resolved') as resolved_complaints,
         (SELECT COUNT(*) FROM notices WHERE panchayat_id = ?) as total_notices,
         (SELECT COALESCE(SUM(amount),0) FROM water_bills WHERE panchayat_id = ? AND paid = 1) as total_collected`,
      [id, id, id, id, id]
    );
    logger.debug('getStats result', { id, stats });
    return stats;
  } catch (err) {
    logger.error('getStats failed', { id, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

module.exports = { getAll, getById, getStats };
