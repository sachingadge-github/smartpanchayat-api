const { pool } = require('../../config/database');

const getAll = async ({ search, district, taluka, page = 1, limit = 20 }) => {
  let where = 'WHERE 1=1';
  const params = [];
  if (search) { where += ' AND name LIKE ?'; params.push(`%${search}%`); }
  if (district) { where += ' AND district = ?'; params.push(district); }
  if (taluka) { where += ' AND taluka = ?'; params.push(taluka); }

  const offset = (page - 1) * limit;
  const [rows] = await pool.execute(`SELECT * FROM panchayats ${where} ORDER BY name LIMIT ? OFFSET ?`, [...params, limit, offset]);
  const [[{ total }]] = await pool.execute(`SELECT COUNT(*) as total FROM panchayats ${where}`, params);
  return { rows, total, page, limit, pages: Math.ceil(total / limit) };
};

const getById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT p.*,
       (SELECT COUNT(*) FROM citizens WHERE panchayat_id = p.id) AS citizen_count,
       (SELECT COUNT(*) FROM complaints WHERE panchayat_id = p.id AND status != 'resolved') AS open_complaints
     FROM panchayats p WHERE p.id = ? LIMIT 1`,
    [id]
  );
  if (!rows.length) throw Object.assign(new Error('Panchayat not found'), { statusCode: 404 });
  return rows[0];
};

const getStats = async (id) => {
  const [[stats]] = await pool.execute(
    `SELECT
       (SELECT COUNT(*) FROM citizens WHERE panchayat_id = ?) as total_citizens,
       (SELECT COUNT(*) FROM complaints WHERE panchayat_id = ?) as total_complaints,
       (SELECT COUNT(*) FROM complaints WHERE panchayat_id = ? AND status = 'resolved') as resolved_complaints,
       (SELECT COUNT(*) FROM notices WHERE panchayat_id = ?) as total_notices,
       (SELECT COALESCE(SUM(amount),0) FROM water_bills WHERE panchayat_id = ? AND paid = 1) as total_collected`,
    [id, id, id, id, id]
  );
  return stats;
};

module.exports = { getAll, getById, getStats };
