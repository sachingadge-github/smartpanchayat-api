const mysql  = require('mysql2/promise');
const env    = require('./env');
const logger = require('../utils/logger')('database');

const pool = mysql.createPool({
  host:             env.db.host,
  port:             env.db.port,
  database:         env.db.name,
  user:             env.db.user,
  password:         env.db.password,
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0,
  timezone:         '+05:30',
});

pool.on('connection', () => logger.debug('New DB connection acquired from pool'));
pool.on('enqueue',    () => logger.warn('All DB connections busy — request queued'));

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    logger.info(`MySQL connected — ${env.db.host}:${env.db.port}/${env.db.name}`);
    conn.release();
  } catch (err) {
    logger.error('MySQL connection failed', { message: err.message, code: err.code });
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
