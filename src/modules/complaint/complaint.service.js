const { pool } = require('../../config/database');
const logger   = require('../../utils/logger')('complaint.service');

const generateRef = () => `CMP-${Date.now().toString().slice(-6)}`;

const create = async (citizenId, data, photoUrl = null) => {
  const ref = generateRef();
  logger.info('Creating complaint', { citizenId, panchayat_id: data.panchayat_id, category: data.category, ref });
  try {
    const [result] = await pool.execute(
      `INSERT INTO complaints (citizen_id, panchayat_id, category, description, photo_url, location, latitude, longitude, reference_no, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      [citizenId, data.panchayat_id, data.category, data.description, photoUrl,
       data.location || null, data.latitude || null, data.longitude || null, ref]
    );
    logger.info('Complaint created', { id: result.insertId, ref });
    return getById(result.insertId);
  } catch (err) {
    logger.error('create failed', { citizenId, data, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const getById = async (id) => {
  id = parseInt(id, 10);
  logger.debug('getById', { id });
  try {
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
  } catch (err) {
    if (!err.statusCode) logger.error('getById failed', { id, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const listMine = async (citizenId, { status, category, page = 1, limit = 10 }) => {
  page   = parseInt(page, 10);
  limit  = parseInt(limit, 10);
  const offset = (page - 1) * limit;
  logger.debug('listMine', { citizenId, status, category, page, limit, offset });
  let where = 'WHERE c.citizen_id = ?';
  const params = [citizenId];
  if (status)   { where += ' AND c.status = ?';   params.push(status); }
  if (category) { where += ' AND c.category = ?'; params.push(category); }
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, p.name as panchayat_name FROM complaints c
       JOIN panchayats p ON c.panchayat_id = p.id
       ${where} ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    const [[{ total }]] = await pool.execute(`SELECT COUNT(*) as total FROM complaints c ${where}`, params);
    logger.debug('listMine result', { citizenId, total, returned: rows.length });
    return { rows, total, page, limit, pages: Math.ceil(total / limit) };
  } catch (err) {
    logger.error('listMine failed', { citizenId, params: { status, category, page, limit }, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const listByPanchayat = async (panchayatId, { status, category, page = 1, limit = 10 }) => {
  panchayatId = parseInt(panchayatId, 10);
  page   = parseInt(page, 10);
  limit  = parseInt(limit, 10);
  const offset = (page - 1) * limit;
  logger.debug('listByPanchayat', { panchayatId, status, category, page, limit, offset });
  let where = 'WHERE c.panchayat_id = ?';
  const params = [panchayatId];
  if (status)   { where += ' AND c.status = ?';   params.push(status); }
  if (category) { where += ' AND c.category = ?'; params.push(category); }
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, ci.name as citizen_name FROM complaints c
       JOIN citizens ci ON c.citizen_id = ci.id
       ${where} ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    const [[{ total }]] = await pool.execute(`SELECT COUNT(*) as total FROM complaints c ${where}`, params);
    logger.debug('listByPanchayat result', { panchayatId, total, returned: rows.length });
    return { rows, total, page, limit, pages: Math.ceil(total / limit) };
  } catch (err) {
    logger.error('listByPanchayat failed', { panchayatId, params: { status, category, page, limit }, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const updateStatus = async (id, status, remark) => {
  id = parseInt(id, 10);
  logger.info('updateStatus', { id, status, remark });
  try {
    await pool.execute(
      `UPDATE complaints SET status = ?, remark = ?, updated_at = NOW() WHERE id = ?`,
      [status, remark || null, id]
    );
    return getById(id);
  } catch (err) {
    logger.error('updateStatus failed', { id, status, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

module.exports = { create, getById, listMine, listByPanchayat, updateStatus };
