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
    const [rows] = await pool.execute(`SELECT * FROM panchayats ${where} ORDER BY name LIMIT ${limit} OFFSET ${offset}`, params);
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

// ── Panchayat Profile ────────────────────────────────────────────────────────

const getProfile = async (id) => {
  id = parseInt(id, 10);
  logger.debug('getProfile', { id });
  try {
    // Base panchayat row
    const [pRows] = await pool.execute(
      'SELECT * FROM panchayats WHERE id = ? LIMIT 1',
      [id]
    );
    if (!pRows.length) throw Object.assign(new Error('Panchayat not found'), { statusCode: 404 });

    // Extended profile
    const [profileRows] = await pool.execute(
      'SELECT * FROM panchayat_profiles WHERE panchayat_id = ? LIMIT 1',
      [id]
    );

    // Staff ordered by display_order
    const [staff] = await pool.execute(
      `SELECT id, name, designation, role_type, ward_no, photo_url,
              phone, email, education, since_year, party, bio, display_order
       FROM panchayat_staff
       WHERE panchayat_id = ? AND is_active = 1
       ORDER BY display_order ASC`,
      [id]
    );

    const sarpanch = staff.find(s => s.role_type === 'sarpanch') || null;
    const team     = staff.filter(s => s.role_type !== 'sarpanch');

    return {
      ...pRows[0],
      profile: profileRows[0] || null,
      sarpanch,
      team,
    };
  } catch (err) {
    if (!err.statusCode) logger.error('getProfile failed', { id, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const upsertProfile = async (panchayat_id, data) => {
  panchayat_id = parseInt(panchayat_id, 10);
  logger.debug('upsertProfile', { panchayat_id });

  const fields = [
    'about','history','vision','established_year','area_sq_km',
    'total_households','literacy_rate','main_occupation','languages_spoken',
    'cover_photo_url','village_map_url','pincode','latitude','longitude',
    'contact_phone','contact_email','office_address','office_hours',
    'website_url','facebook_url','whatsapp_number',
  ];

  const keys    = fields.filter(f => data[f] !== undefined);
  const values  = keys.map(k => data[k]);

  if (!keys.length) throw Object.assign(new Error('No fields to update'), { statusCode: 400 });

  const setClauses = keys.map(k => `${k} = ?`).join(', ');

  try {
    await pool.execute(
      `INSERT INTO panchayat_profiles (panchayat_id, ${keys.join(', ')})
       VALUES (?, ${keys.map(() => '?').join(', ')})
       ON DUPLICATE KEY UPDATE ${setClauses}`,
      [panchayat_id, ...values, ...values]
    );
    return getProfile(panchayat_id);
  } catch (err) {
    logger.error('upsertProfile failed', { panchayat_id, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

// ── Staff ────────────────────────────────────────────────────────────────────

const addStaff = async (panchayat_id, data) => {
  panchayat_id = parseInt(panchayat_id, 10);
  logger.debug('addStaff', { panchayat_id, name: data.name });
  try {
    const [result] = await pool.execute(
      `INSERT INTO panchayat_staff
         (panchayat_id, name, designation, role_type, ward_no, photo_url,
          phone, email, education, since_year, party, bio, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        panchayat_id,
        data.name,
        data.designation,
        data.role_type || 'other',
        data.ward_no   || null,
        data.photo_url || null,
        data.phone     || null,
        data.email     || null,
        data.education || null,
        data.since_year|| null,
        data.party     || null,
        data.bio       || null,
        data.display_order || 99,
      ]
    );
    const [rows] = await pool.execute('SELECT * FROM panchayat_staff WHERE id = ?', [result.insertId]);
    return rows[0];
  } catch (err) {
    logger.error('addStaff failed', { panchayat_id, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const updateStaff = async (panchayat_id, staff_id, data) => {
  panchayat_id = parseInt(panchayat_id, 10);
  staff_id     = parseInt(staff_id, 10);
  logger.debug('updateStaff', { panchayat_id, staff_id });

  const allowed = [
    'name','designation','role_type','ward_no','photo_url',
    'phone','email','education','since_year','party','bio','display_order','is_active',
  ];
  const keys   = allowed.filter(f => data[f] !== undefined);
  const values = keys.map(k => data[k]);

  if (!keys.length) throw Object.assign(new Error('No fields to update'), { statusCode: 400 });

  try {
    const [result] = await pool.execute(
      `UPDATE panchayat_staff SET ${keys.map(k => `${k} = ?`).join(', ')}
       WHERE id = ? AND panchayat_id = ?`,
      [...values, staff_id, panchayat_id]
    );
    if (!result.affectedRows) throw Object.assign(new Error('Staff member not found'), { statusCode: 404 });
    const [rows] = await pool.execute('SELECT * FROM panchayat_staff WHERE id = ?', [staff_id]);
    return rows[0];
  } catch (err) {
    if (!err.statusCode) logger.error('updateStaff failed', { panchayat_id, staff_id, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const deleteStaff = async (panchayat_id, staff_id) => {
  panchayat_id = parseInt(panchayat_id, 10);
  staff_id     = parseInt(staff_id, 10);
  try {
    const [result] = await pool.execute(
      'DELETE FROM panchayat_staff WHERE id = ? AND panchayat_id = ?',
      [staff_id, panchayat_id]
    );
    if (!result.affectedRows) throw Object.assign(new Error('Staff member not found'), { statusCode: 404 });
  } catch (err) {
    if (!err.statusCode) logger.error('deleteStaff failed', { panchayat_id, staff_id, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

// ── Quick Services ───────────────────────────────────────────────────────────

const getQuickServices = async (id) => {
  id = parseInt(id, 10);
  logger.debug('getQuickServices', { id });
  try {
    // Verify panchayat exists
    const [pRows] = await pool.execute('SELECT id, name FROM panchayats WHERE id = ? LIMIT 1', [id]);
    if (!pRows.length) throw Object.assign(new Error('Panchayat not found'), { statusCode: 404 });

    const [recentNotices] = await pool.execute(
      `SELECT id, title, type, created_at FROM notices
       WHERE panchayat_id = ? ORDER BY created_at DESC LIMIT 3`,
      [id]
    );

    const [activeSchemes] = await pool.execute(
      `SELECT id, name, category, benefit, last_date FROM schemes
       WHERE last_date IS NULL OR last_date >= CURDATE()
       ORDER BY last_date ASC LIMIT 5`
    );

    const [pendingBills] = await pool.execute(
      `SELECT COUNT(*) as count, COALESCE(SUM(amount),0) as total_due
       FROM water_bills WHERE panchayat_id = ? AND paid = 0`,
      [id]
    );

    const [complaintStats] = await pool.execute(
      `SELECT
         COUNT(*) as total,
         SUM(status = 'open') as open,
         SUM(status = 'in_progress') as in_progress,
         SUM(status = 'resolved') as resolved
       FROM complaints WHERE panchayat_id = ?`,
      [id]
    );

    const [certificates] = await pool.execute(
      `SELECT
         COUNT(*) as total,
         SUM(status = 'pending') as pending,
         SUM(status = 'ready') as ready
       FROM certificates WHERE panchayat_id = ?`,
      [id]
    );

    return {
      panchayat: pRows[0],
      services: {
        notices: {
          label: 'Notices & Announcements',
          icon: 'megaphone',
          recent: recentNotices,
        },
        schemes: {
          label: 'Government Schemes',
          icon: 'document-text',
          active_count: activeSchemes.length,
          items: activeSchemes,
        },
        water_bills: {
          label: 'Water Bills',
          icon: 'water',
          unpaid_count: pendingBills[0].count,
          total_due: parseFloat(pendingBills[0].total_due),
        },
        complaints: {
          label: 'Complaints',
          icon: 'warning',
          ...complaintStats[0],
        },
        certificates: {
          label: 'Certificates',
          icon: 'ribbon',
          ...certificates[0],
        },
      },
    };
  } catch (err) {
    if (!err.statusCode) logger.error('getQuickServices failed', { id, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

module.exports = { getAll, getById, getStats, getProfile, upsertProfile, addStaff, updateStaff, deleteStaff, getQuickServices };
