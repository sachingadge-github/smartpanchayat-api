const { pool } = require('../../config/database');
const logger   = require('../../utils/logger')('notice.service');

const create = async (data) => {
  logger.info('Creating notice', { panchayat_id: data.panchayat_id, type: data.type, title: data.title });
  try {
    const [result] = await pool.execute(
      `INSERT INTO notices (panchayat_id, title, body, type, created_by) VALUES (?, ?, ?, ?, ?)`,
      [data.panchayat_id, data.title, data.body, data.type || 'general', data.created_by]
    );
    logger.info('Notice created', { id: result.insertId });
    return getById(result.insertId);
  } catch (err) {
    logger.error('create failed', { data, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const getById = async (id) => {
  id = parseInt(id, 10);
  logger.debug('getById', { id });
  try {
    const [rows] = await pool.execute(
      `SELECT n.*,
         p.name as panchayat_name,
         COALESCE(n.author, p.name) as author,
         COALESCE(n.is_pinned, 0) as is_pinned,
         COALESCE(n.has_attachment, 0) as has_attachment,
         n.attachment_url
       FROM notices n
       JOIN panchayats p ON n.panchayat_id = p.id WHERE n.id = ? LIMIT 1`,
      [id]
    );
    if (!rows.length) throw Object.assign(new Error('Notice not found'), { statusCode: 404 });
    return rows[0];
  } catch (err) {
    if (!err.statusCode) logger.error('getById failed', { id, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const list = async ({ panchayat_id, type, page = 1, limit = 10 }) => {
  page  = parseInt(page, 10);
  limit = parseInt(limit, 10);
  logger.debug('list', { panchayat_id, type, page, limit });
  let where = 'WHERE 1=1';
  const params = [];
  if (panchayat_id) { where += ' AND n.panchayat_id = ?'; params.push(panchayat_id); }
  if (type)         { where += ' AND n.type = ?';         params.push(type); }
  const offset = (page - 1) * limit;
  try {
    const [rows] = await pool.execute(
      `SELECT n.*,
         p.name as panchayat_name,
         COALESCE(n.author, p.name) as author,
         COALESCE(n.is_pinned, 0) as is_pinned,
         COALESCE(n.has_attachment, 0) as has_attachment,
         n.attachment_url
       FROM notices n
       JOIN panchayats p ON n.panchayat_id = p.id
       ${where} ORDER BY n.is_pinned DESC, n.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    const [[{ total }]] = await pool.execute(`SELECT COUNT(*) as total FROM notices n ${where}`, params);
    logger.debug('list result', { panchayat_id, total, returned: rows.length });
    return { rows, total, page, limit, pages: Math.ceil(total / limit) };
  } catch (err) {
    logger.error('list failed', { panchayat_id, type, page, limit, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const remove = async (id) => {
  id = parseInt(id, 10);
  logger.info('Deleting notice', { id });
  try {
    await pool.execute(`DELETE FROM notices WHERE id = ?`, [id]);
    logger.info('Notice deleted', { id });
  } catch (err) {
    logger.error('remove failed', { id, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

module.exports = { create, getById, list, remove };
