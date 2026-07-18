require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('../config/env');

// Errors we treat as warnings (already-done conditions)
const IGNORABLE = new Set([
  1050, // ER_TABLE_EXISTS_ERROR    — CREATE TABLE already exists
  1060, // ER_DUP_FIELDNAME         — ADD COLUMN already exists
  1061, // ER_DUP_KEYNAME           — ADD INDEX already exists
  1062, // ER_DUP_ENTRY             — INSERT IGNORE fallback (shouldn't reach here)
  1091, // ER_CANT_DROP_FIELD_OR_KEY — DROP column/key not found
]);

function splitStatements(sql) {
  // Strip -- line comments, then split on semicolons that end a logical statement.
  // Handles multi-line strings by splitting only on ";\n" or ";" at end of trimmed line.
  const lines = sql.split('\n');
  const out = [];
  let current = '';
  for (const line of lines) {
    const stripped = line.replace(/--.*$/, ''); // remove inline comments
    current += stripped + '\n';
    if (stripped.trimEnd().endsWith(';')) {
      const stmt = current.trim().replace(/;$/, '').trim();
      if (stmt) out.push(stmt);
      current = '';
    }
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

async function migrate() {
  const conn = await mysql.createConnection({
    host: env.db.host, port: env.db.port,
    user: env.db.user, password: env.db.password,
    multipleStatements: false,
  });

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    console.log(`\n⏳ Running: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const statements = splitStatements(sql);
    let ok = 0, skipped = 0;

    for (const stmt of statements) {
      if (!stmt || stmt.startsWith('--')) continue;
      try {
        await conn.query(stmt);
        ok++;
      } catch (err) {
        if (IGNORABLE.has(err.errno)) {
          console.log(`  ⚠️  Skipped (already exists): ${stmt.slice(0, 60).replace(/\n/g, ' ')}...`);
          skipped++;
        } else {
          console.error(`\n❌ Failed statement:\n${stmt}\n`);
          await conn.end();
          throw err;
        }
      }
    }
    console.log(`✅ Done: ${file}  (${ok} ran, ${skipped} skipped)`);
  }

  await conn.end();
  console.log('\n🎉 All migrations complete!');
}

migrate().catch(e => { console.error('❌ Migration failed:', e.message); process.exit(1); });
