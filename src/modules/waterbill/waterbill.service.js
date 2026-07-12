const { pool } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');

const getDues = async (citizenId) => {
  const [rows] = await pool.execute(
    `SELECT * FROM water_bills WHERE citizen_id = ? ORDER BY year DESC, month DESC`,
    [citizenId]
  );
  const total = rows.filter(r => !r.paid).reduce((sum, r) => sum + parseFloat(r.amount), 0);
  return { bills: rows, total_due: total };
};

const getBill = async (id) => {
  const [rows] = await pool.execute(`SELECT * FROM water_bills WHERE id = ? LIMIT 1`, [id]);
  if (!rows.length) throw Object.assign(new Error('Bill not found'), { statusCode: 404 });
  return rows[0];
};

const initPayment = async (billId, citizenId) => {
  const bill = await getBill(billId);
  if (bill.citizen_id !== citizenId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  if (bill.paid) throw Object.assign(new Error('Bill already paid'), { statusCode: 400 });
  const orderId = `PAY-${uuidv4().slice(0,8).toUpperCase()}`;
  await pool.execute(`UPDATE water_bills SET order_id = ? WHERE id = ?`, [orderId, billId]);
  return { bill_id: billId, amount: bill.amount, order_id: orderId, currency: 'INR' };
};

const confirmPayment = async (billId, citizenId, paymentRef) => {
  const bill = await getBill(billId);
  if (bill.citizen_id !== citizenId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  const receiptNo = `RCP-${Date.now().toString().slice(-8)}`;
  await pool.execute(
    `UPDATE water_bills SET paid = 1, payment_date = NOW(), payment_ref = ?, receipt_no = ? WHERE id = ?`,
    [paymentRef, receiptNo, billId]
  );
  return getBill(billId);
};

module.exports = { getDues, getBill, initPayment, confirmPayment };
