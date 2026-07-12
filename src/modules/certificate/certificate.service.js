const { pool } = require('../../config/database');

const generateRef = (type) => `CERT-${type.toUpperCase().slice(0,3)}-${Date.now().toString().slice(-6)}`;

const apply = async (citizenId, data) => {
  const ref = generateRef(data.type);
  const [result] = await pool.execute(
    `INSERT INTO certificates (citizen_id, panchayat_id, type, applicant_name, details, reference_no, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    [citizenId, data.panchayat_id, data.type, data.applicant_name, JSON.stringify(data.details), ref]
  );
  return getById(result.insertId);
};

const getById = async (id) => {
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
};

const listMine = async (citizenId, { status, type, page = 1, limit = 10 }) => {
  let where = 'WHERE c.citizen_id = ?';
  const params = [citizenId];
  if (status) { where += ' AND c.status = ?'; params.push(status); }
  if (type) { where += ' AND c.type = ?'; params.push(type); }
  const offset = (page - 1) * limit;
  const [rows] = await pool.execute(
    `SELECT c.*, p.name as panchayat_name FROM certificates c
     JOIN panchayats p ON c.panchayat_id = p.id
     ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.execute(`SELECT COUNT(*) as total FROM certificates c ${where}`, params);
  return { rows, total, page, limit, pages: Math.ceil(total / limit) };
};

const updateStatus = async (id, status, remark, pdfUrl) => {
  await pool.execute(
    `UPDATE certificates SET status = ?, remark = ?, pdf_url = ?, updated_at = NOW() WHERE id = ?`,
    [status, remark || null, pdfUrl || null, id]
  );
  return getById(id);
};

module.exports = { apply, getById, listMine, updateStatus };
