const { pool } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const logger = require('../../utils/logger')('waterbill.service');

const getDues = async (citizenId) => {
  citizenId = parseInt(citizenId, 10);
  logger.debug('getDues', { citizenId });
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM water_bills WHERE citizen_id = ? ORDER BY year DESC, month DESC`,
      [citizenId]
    );
    const total = rows.filter(r => !r.paid).reduce((sum, r) => sum + parseFloat(r.amount), 0);
    logger.debug('getDues result', { citizenId, total, bills: rows.length });
    return { bills: rows, total_due: total };
  } catch (err) {
    logger.error('getDues failed', { citizenId, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const getBill = async (id) => {
  id = parseInt(id, 10);
  logger.debug('getBill', { id });
  try {
    const [rows] = await pool.execute(`SELECT * FROM water_bills WHERE id = ? LIMIT 1`, [id]);
    if (!rows.length) throw Object.assign(new Error('Bill not found'), { statusCode: 404 });
    return rows[0];
  } catch (err) {
    if (!err.statusCode) logger.error('getBill failed', { id, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const initPayment = async (billId, citizenId) => {
  billId    = parseInt(billId, 10);
  citizenId = parseInt(citizenId, 10);
  logger.info('initPayment', { billId, citizenId });
  const bill = await getBill(billId);
  if (bill.citizen_id !== citizenId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  if (bill.paid) throw Object.assign(new Error('Bill already paid'), { statusCode: 400 });
  const orderId = `PAY-${uuidv4().slice(0,8).toUpperCase()}`;
  try {
    await pool.execute(`UPDATE water_bills SET order_id = ? WHERE id = ?`, [orderId, billId]);
    logger.info('Payment initiated', { billId, orderId });
    return { bill_id: billId, amount: bill.amount, order_id: orderId, currency: 'INR' };
  } catch (err) {
    logger.error('initPayment failed', { billId, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const confirmPayment = async (billId, citizenId, paymentRef) => {
  billId    = parseInt(billId, 10);
  citizenId = parseInt(citizenId, 10);
  logger.info('confirmPayment', { billId, citizenId, paymentRef });
  const bill = await getBill(billId);
  if (bill.citizen_id !== citizenId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  const receiptNo = `RCP-${Date.now().toString().slice(-8)}`;
  try {
    await pool.execute(
      `UPDATE water_bills SET paid = 1, payment_date = NOW(), payment_ref = ?, receipt_no = ? WHERE id = ?`,
      [paymentRef, receiptNo, billId]
    );
    logger.info('Payment confirmed', { billId, receiptNo });
    return getBill(billId);
  } catch (err) {
    logger.error('confirmPayment failed', { billId, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

module.exports = { getDues, getBill, initPayment, confirmPayment };
