const { pool } = require('../../config/database');
const logger   = require('../../utils/logger')('payments.service');

const getConfig = async (panchayatId) => {
  panchayatId = parseInt(panchayatId, 10);
  logger.debug('getConfig', { panchayatId });
  try {
    const [rows] = await pool.execute(
      `SELECT pc.*, p.name as payee_name
       FROM payment_configs pc
       JOIN panchayats p ON pc.panchayat_id = p.id
       WHERE pc.panchayat_id = ? LIMIT 1`,
      [panchayatId]
    );
    if (!rows.length) {
      // Return a sensible default so the app doesn't crash
      const [pRows] = await pool.execute(`SELECT name FROM panchayats WHERE id = ? LIMIT 1`, [panchayatId]);
      if (!pRows.length) throw Object.assign(new Error('Panchayat not found'), { statusCode: 404 });
      const name = pRows[0].name;
      return {
        upi_id:             `grampanchayat_${panchayatId}@upi`,
        payee_name:         name,
        upi_qr_payload:     `upi://pay?pa=grampanchayat_${panchayatId}%40upi&pn=${encodeURIComponent(name)}&cu=INR`,
        gateway:            'none',
        gateway_key_id:     null,
        methods_enabled:    ['upi', 'qr'],
        helpline:           null,
      };
    }
    const row = rows[0];
    return {
      upi_id:          row.upi_id,
      payee_name:      row.payee_name,
      upi_qr_payload:  row.upi_id ? `upi://pay?pa=${encodeURIComponent(row.upi_id)}&pn=${encodeURIComponent(row.payee_name)}&cu=INR` : null,
      gateway:         row.gateway || 'none',
      gateway_key_id:  row.gateway_key_id || null,
      methods_enabled: row.methods_enabled ? (typeof row.methods_enabled === 'string' ? JSON.parse(row.methods_enabled) : row.methods_enabled) : ['upi', 'qr'],
      helpline:        row.helpline || null,
    };
  } catch (err) {
    if (!err.statusCode) logger.error('getConfig failed', { panchayatId, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const getReceipt = async (receiptNo, citizenId) => {
  logger.debug('getReceipt', { receiptNo, citizenId });
  try {
    // Check water bills first
    const [wb] = await pool.execute(
      `SELECT *, 'water_bill' as source FROM water_bills WHERE receipt_no = ? AND citizen_id = ? LIMIT 1`,
      [receiptNo, parseInt(citizenId, 10)]
    );
    if (wb.length) {
      const r = wb[0];
      return {
        receipt_no:  r.receipt_no,
        pdf_url:     null,
        amount:      parseFloat(r.amount),
        paid_at:     r.payment_date,
        description: `Water bill – ${r.year || ''}/${r.month || ''}`.trim().replace(/\/$/, ''),
      };
    }

    // Check property tax
    const [pt] = await pool.execute(
      `SELECT * FROM property_tax WHERE receipt_no = ? AND citizen_id = ? LIMIT 1`,
      [receiptNo, parseInt(citizenId, 10)]
    );
    if (pt.length) {
      const r = pt[0];
      return {
        receipt_no:  r.receipt_no,
        pdf_url:     null,
        amount:      parseFloat(r.amount),
        paid_at:     r.paid_at,
        description: r.description || `Property tax ${r.year || ''}`.trim(),
      };
    }

    throw Object.assign(new Error('Receipt not found'), { statusCode: 404 });
  } catch (err) {
    if (!err.statusCode) logger.error('getReceipt failed', { receiptNo, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const getPropertyTaxDues = async (citizenId) => {
  citizenId = parseInt(citizenId, 10);
  logger.debug('getPropertyTaxDues', { citizenId });
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM property_tax WHERE citizen_id = ? AND status != 'paid' ORDER BY due_date ASC`,
      [citizenId]
    );
    const total_due = rows.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const bills = rows.map(r => ({
      id:          r.id,
      type:        'property_tax',
      description: {
        mr: r.description || `मालमत्ता कर ${r.year || ''}`,
        hi: r.description || `संपत्ति कर ${r.year || ''}`,
        en: r.description || `Property Tax ${r.year || ''}`,
      },
      property_no: r.property_no,
      amount:      parseFloat(r.amount),
      due_date:    r.due_date,
      status:      r.status,
      is_overdue:  r.due_date ? new Date(r.due_date) < new Date() : false,
    }));
    return { bills, total_due };
  } catch (err) {
    logger.error('getPropertyTaxDues failed', { citizenId, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const getPaymentHistory = async (citizenId) => {
  citizenId = parseInt(citizenId, 10);
  logger.debug('getPaymentHistory', { citizenId });
  try {
    const [wb] = await pool.execute(
      `SELECT id, amount, payment_date as date, receipt_no, 'water_bill' as type,
              CONCAT('पाणीपट्टी बिल ', year, '/', month) as description
       FROM water_bills WHERE citizen_id = ? AND paid = 1 ORDER BY payment_date DESC`,
      [citizenId]
    );
    const [pt] = await pool.execute(
      `SELECT id, amount, paid_at as date, receipt_no, 'property_tax' as type, description
       FROM property_tax WHERE citizen_id = ? AND status = 'paid' ORDER BY paid_at DESC`,
      [citizenId]
    );
    const all = [...wb, ...pt]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(r => ({ id: `${r.type}_${r.id}`, description: r.description, amount: parseFloat(r.amount), date: r.date, receipt_no: r.receipt_no }));
    return all;
  } catch (err) {
    logger.error('getPaymentHistory failed', { citizenId, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

module.exports = { getConfig, getReceipt, getPropertyTaxDues, getPaymentHistory };
