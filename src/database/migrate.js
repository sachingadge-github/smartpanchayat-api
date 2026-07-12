require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('../config/env');

async function migrate() {
  const conn = await mysql.createConnection({
    host: env.db.host, port: env.db.port,
    user: env.db.user, password: env.db.password,
    multipleStatements: true,
  });
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    console.log(`⏳ Running: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await conn.query(sql);
    console.log(`✅ Done: ${file}`);
  }
  await conn.end();
  console.log('\n🎉 All migrations complete!');
}

migrate().catch(e => { console.error('❌ Migration failed:', e.message); process.exit(1); });
