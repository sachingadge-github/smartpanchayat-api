const { pool } = require('../../config/database');
const logger   = require('../../utils/logger')('certificate.service');

const generateRef = (type) => `CERT-${type.toUpperCase().slice(0,3)}-${Date.now().toString().slice(-6)}`;

const apply = async (citizenId, data) => {
  const ref = generateRef(data.type);
  logger.info('Applying certificate', { citizenId, type: data.type, panchayat_id: data.panchayat_id, ref });
  try {
    const [result] = await pool.execute(
      `INSERT INTO certificates (citizen_id, panchayat_id, type, applicant_name, details, reference_no, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [citizenId, data.panchayat_id, data.type, data.applicant_name, JSON.stringify(data.details), ref]
    );
    logger.info('Certificate created', { id: result.insertId, ref });
    return getById(result.insertId);
  } catch (err) {
    logger.error('apply failed', { citizenId, type: data.type, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const getById = async (id) => {
  logger.debug('getById', { id });
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, ci.name as citizen_name, p.name as panchayat_name
       FROM certificates c
       JOIN citizens ci ON c.citizen_id = ci.id
       JOIN panchayats p ON c.panchayat_id = p.id
       WHERE c.id = ? LIMIT 1`,
      [id]
    );
    if (!rows.length) throw Object.assign(new Error('Certificate not found'), { statusCode: 404 });
    const row = rows[0];
    if (row.details) try { row.details = JSON.parse(row.details); } catch {}
    return row;
  } catch (err) {
    if (!err.statusCode) logger.error('getById failed', { id, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const listMine = async (citizenId, { status, type, page = 1, limit = 10 }) => {
  page  = parseInt(page, 10);
  limit = parseInt(limit, 10);
  logger.debug('listMine', { citizenId, status, type, page, limit });
  let where = 'WHERE c.citizen_id = ?';
  const params = [citizenId];
  if (status) { where += ' AND c.status = ?'; params.push(status); }
  if (type)   { where += ' AND c.type = ?';   params.push(type); }
  const offset = (page - 1) * limit;
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, p.name as panchayat_name FROM certificates c
       JOIN panchayats p ON c.panchayat_id = p.id
       ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.execute(`SELECT COUNT(*) as total FROM certificates c ${where}`, params);
    logger.debug('listMine result', { citizenId, total, returned: rows.length });
    return { rows, total, page, limit, pages: Math.ceil(total / limit) };
  } catch (err) {
    logger.error('listMine failed', { citizenId, params: { status, type, page, limit }, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const updateStatus = async (id, status, remark, pdfUrl) => {
  logger.info('updateStatus', { id, status, remark });
  try {
    await pool.execute(
      `UPDATE certificates SET status = ?, remark = ?, pdf_url = ?, updated_at = NOW() WHERE id = ?`,
      [status, remark || null, pdfUrl || null, id]
    );
    return getById(id);
  } catch (err) {
    logger.error('updateStatus failed', { id, status, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

module.exports = { apply, getById, listMine, updateStatus };
