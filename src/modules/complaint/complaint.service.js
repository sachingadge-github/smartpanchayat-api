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

const getCategories = () => [
  { id: 'water',       label: { mr: 'पाणी गळती',       hi: 'पानी की आपूर्ति',    en: 'Water Supply' },   icon: 'water',             color: '#3b82f6', order: 1 },
  { id: 'garbage',     label: { mr: 'कचरा व स्वच्छता', hi: 'कचरा और स्वच्छता',  en: 'Garbage' },         icon: 'trash',             color: '#22c55e', order: 2 },
  { id: 'road',        label: { mr: 'रस्ता नुकसान',     hi: 'सड़क क्षति',         en: 'Road Damage' },     icon: 'car',               color: '#f59e0b', order: 3 },
  { id: 'streetlight', label: { mr: 'पथदीप',            hi: 'स्ट्रीट लाइट',       en: 'Street Light' },    icon: 'bulb',              color: '#fbbf24', order: 4 },
  { id: 'drainage',    label: { mr: 'गटार',              hi: 'जल निकासी',          en: 'Drainage' },        icon: 'git-network',       color: '#8b5cf6', order: 5 },
  { id: 'tree',        label: { mr: 'झाड',               hi: 'पेड़',               en: 'Tree Issue' },      icon: 'leaf',              color: '#16a34a', order: 6 },
  { id: 'other',       label: { mr: 'इतर समस्या',       hi: 'अन्य समस्या',        en: 'Other Issues' },    icon: 'ellipsis-horizontal', color: '#64748b', order: 7 },
];

const getByIdFull = async (id) => {
  const complaint = await getById(id);

  // Build synthetic timeline from timestamps on the complaint row
  const statusOrder = ['open', 'assigned', 'in_progress', 'resolved'];
  const statusLabels = {
    open:        { mr: 'तक्रार दाखल',      hi: 'शिकायत दर्ज',     en: 'Submitted' },
    assigned:    { mr: 'कर्मचारी नियुक्त', hi: 'कर्मचारी नियुक्त', en: 'Assigned' },
    in_progress: { mr: 'काम सुरू',         hi: 'कार्य प्रारंभ',    en: 'In Progress' },
    resolved:    { mr: 'निराकरण',          hi: 'समाधान',           en: 'Resolved' },
  };
  const currentIdx = statusOrder.indexOf(complaint.status);

  const timeline = statusOrder.map((s, i) => {
    let at = null;
    if (s === 'open')     at = complaint.created_at || null;
    if (s === 'assigned') at = complaint.assigned_at || null;
    if (s === 'in_progress') at = (complaint.status === 'in_progress' || complaint.status === 'resolved') ? (complaint.updated_at || null) : null;
    if (s === 'resolved') at = complaint.status === 'resolved' ? (complaint.resolved_at || complaint.updated_at || null) : null;
    return { status: s, label: statusLabels[s], at, done: i <= currentIdx };
  });

  const assigned_to = (complaint.assigned_to_name) ? {
    name:        complaint.assigned_to_name,
    designation: complaint.assigned_to_designation || '',
    phone:       complaint.assigned_to_phone || null,
  } : null;

  return {
    ...complaint,
    timeline,
    assigned_to,
    resolution_note:  complaint.resolution_note || null,
    citizen_rating:   complaint.citizen_rating  || null,
  };
};

const rateComplaint = async (id, citizenId, rating, comment) => {
  id        = parseInt(id, 10);
  citizenId = parseInt(citizenId, 10);
  logger.info('rateComplaint', { id, citizenId, rating });
  try {
    const complaint = await getById(id);
    if (complaint.citizen_id !== citizenId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    if (complaint.status !== 'resolved')    throw Object.assign(new Error('Complaint is not resolved yet'), { statusCode: 409, code: 'NOT_RESOLVED_YET' });
    if (complaint.citizen_rating)           throw Object.assign(new Error('Already rated'), { statusCode: 409, code: 'ALREADY_RATED' });

    await pool.execute(
      `UPDATE complaints SET citizen_rating = ?, resolution_note = COALESCE(resolution_note, ?), updated_at = NOW() WHERE id = ?`,
      [rating, comment || null, id]
    );
    return getByIdFull(id);
  } catch (err) {
    if (!err.statusCode) logger.error('rateComplaint failed', { id, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

module.exports = { create, getById, getByIdFull, getCategories, listMine, listByPanchayat, updateStatus, rateComplaint };
