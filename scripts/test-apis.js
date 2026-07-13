#!/usr/bin/env node
/**
 * Smart Panchayat API — Full Test Runner
 * Usage:
 *   node scripts/test-apis.js              # runs against Local (localhost:4002)
 *   node scripts/test-apis.js uat          # runs against UAT
 *   node scripts/test-apis.js http://...   # custom base URL
 */

const http  = require('http');
const https = require('https');

// ── CONFIG ───────────────────────────────────────────────────
const ENVS = {
  local: 'http://localhost:4002/api/v1',
  uat:   'http://smartpanchayat.co.in/api',
};

const arg     = process.argv[2] || 'local';
const BASE    = ENVS[arg] || arg;
const HEALTH  = BASE.replace(/\/api.*/, '/health');

// ── COLOURS ──────────────────────────────────────────────────
const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  gray:   '\x1b[90m',
  white:  '\x1b[97m',
};
const pass  = `${c.green}✓ PASS${c.reset}`;
const fail  = `${c.red}✗ FAIL${c.reset}`;
const skip  = `${c.yellow}⊘ SKIP${c.reset}`;
const line  = `${c.gray}${'─'.repeat(60)}${c.reset}`;

// ── HTTP CLIENT ───────────────────────────────────────────────
function request(method, url, body, token) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const lib    = parsed.protocol === 'https:' ? https : http;
    const data   = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token)  headers['Authorization'] = `Bearer ${token}`;
    if (data)   headers['Content-Length'] = Buffer.byteLength(data);

    const req = lib.request({
      hostname: parsed.hostname,
      port:     parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path:     parsed.pathname + parsed.search,
      method,
      headers,
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });

    req.on('error', (e) => resolve({ status: 0, body: { error: e.message } }));
    req.setTimeout(8000, () => { req.destroy(); resolve({ status: 0, body: { error: 'timeout' } }); });
    if (data) req.write(data);
    req.end();
  });
}

// ── RESULT TRACKING ───────────────────────────────────────────
const results = [];
let passed = 0, failed = 0, skipped = 0;

function log(icon, label, status, msg) {
  const pad = label.padEnd(42);
  console.log(`  ${icon}  ${pad} ${c.gray}[${status}]${c.reset}  ${msg}`);
}

function record(label, res, expectStatus, check) {
  const ok     = res.status === expectStatus && (!check || check(res.body));
  const icon   = ok ? pass : fail;
  const detail = ok
    ? (res.body?.message || res.body?.data ? c.green + 'OK' + c.reset : c.green + 'OK' + c.reset)
    : c.red + (res.body?.message || res.body?.error || JSON.stringify(res.body).slice(0, 80)) + c.reset;
  log(icon, label, res.status, detail);
  results.push({ label, ok, status: res.status });
  ok ? passed++ : failed++;
  return ok;
}

function recordSkip(label, reason) {
  log(skip, label, '-', c.yellow + reason + c.reset);
  results.push({ label, ok: null });
  skipped++;
}

// ── STATE ─────────────────────────────────────────────────────
const state = {
  mobile:       '9876543210',
  otp:          '123456',
  accessToken:  null,
  refreshToken: null,
  panchayat_id: 1,
  complaint_id: null,
  cert_id:      null,
  bill_id:      null,
  notice_id:    null,
  scheme_id:    1,
};

// ── TEST SUITES ───────────────────────────────────────────────
async function runHealth() {
  console.log(`\n${c.bold}${c.cyan}❯ HEALTH${c.reset}`);
  const res = await request('GET', HEALTH);
  record('GET /health', res, 200, b => b.status === 'ok');
}

async function runAuth() {
  console.log(`\n${c.bold}${c.cyan}❯ AUTH${c.reset}`);

  // Send OTP
  const r1 = await request('POST', `${BASE}/auth/send-otp`, { mobile: state.mobile });
  const ok1 = record('POST /auth/send-otp', r1, 200, b => b.success);
  if (ok1 && r1.body?.data?.otp) {
    state.otp = r1.body.data.otp;
    console.log(`     ${c.gray}↳ mock OTP: ${state.otp}${c.reset}`);
  }

  // Verify OTP
  const r2 = await request('POST', `${BASE}/auth/verify-otp`, { mobile: state.mobile, otp: state.otp });
  const ok2 = record('POST /auth/verify-otp', r2, 200, b => b.data?.accessToken);
  if (ok2) {
    state.accessToken  = r2.body.data.accessToken;
    state.refreshToken = r2.body.data.refreshToken;
    const isNew = r2.body.data.citizen?.is_new;
    console.log(`     ${c.gray}↳ ${isNew ? 'new citizen registered' : 'existing citizen login'}${c.reset}`);
  }

  // Refresh token
  if (state.refreshToken) {
    const r3 = await request('POST', `${BASE}/auth/refresh`, { refreshToken: state.refreshToken });
    const ok3 = record('POST /auth/refresh', r3, 200, b => b.data?.accessToken);
    if (ok3) state.accessToken = r3.body.data.accessToken;
  } else {
    recordSkip('POST /auth/refresh', 'no refreshToken');
  }

  // Logout
  const r4 = await request('POST', `${BASE}/auth/logout`, null, state.accessToken);
  record('POST /auth/logout', r4, 200);
}

async function runCitizen() {
  console.log(`\n${c.bold}${c.cyan}❯ CITIZEN${c.reset}`);
  if (!state.accessToken) { recordSkip('GET /citizen/profile', 'not authenticated'); return; }

  const r1 = await request('GET', `${BASE}/citizen/profile`, null, state.accessToken);
  record('GET /citizen/profile', r1, 200, b => b.data?.id);

  const r2 = await request('PUT', `${BASE}/citizen/profile`, {
    name:         'Sachin Gadge',
    gender:       'male',
    age:          30,
    address:      'At Post Nerle, Tal Valva, Dist Sangli',
    panchayat_id: state.panchayat_id,
  }, state.accessToken);
  record('PUT /citizen/profile', r2, 200, b => b.data?.name === 'Sachin Gadge');
}

async function runPanchayats() {
  console.log(`\n${c.bold}${c.cyan}❯ PANCHAYATS${c.reset}`);

  const r1 = await request('GET', `${BASE}/panchayats?page=1&limit=5`);
  record('GET /panchayats', r1, 200, b => Array.isArray(b.data));

  const r2 = await request('GET', `${BASE}/panchayats/${state.panchayat_id}`);
  record('GET /panchayats/:id', r2, 200, b => b.data?.id);

  if (state.accessToken) {
    const r3 = await request('GET', `${BASE}/panchayats/${state.panchayat_id}/stats`, null, state.accessToken);
    record('GET /panchayats/:id/stats', r3, 200, b => b.data?.total_citizens !== undefined);
  } else {
    recordSkip('GET /panchayats/:id/stats', 'not authenticated');
  }
}

async function runComplaints() {
  console.log(`\n${c.bold}${c.cyan}❯ COMPLAINTS${c.reset}`);
  if (!state.accessToken) {
    ['POST /complaints', 'GET /complaints/mine', 'GET /complaints/:id',
     'GET /complaints/panchayat/:id', 'PATCH /complaints/:id/status']
      .forEach(l => recordSkip(l, 'not authenticated'));
    return;
  }

  const r1 = await request('POST', `${BASE}/complaints`, {
    panchayat_id: state.panchayat_id,
    category:     'road',
    description:  'Large pothole near primary school gate causing accidents',
    location:     'Near Primary School, Nerle',
    latitude:     17.0282,
    longitude:    74.2754,
  }, state.accessToken);
  const ok1 = record('POST /complaints', r1, 201, b => b.data?.id);
  if (ok1) {
    state.complaint_id = r1.body.data.id;
    console.log(`     ${c.gray}↳ ref: ${r1.body.data.reference_no}${c.reset}`);
  }

  const r2 = await request('GET', `${BASE}/complaints/mine?page=1&limit=5`, null, state.accessToken);
  record('GET /complaints/mine', r2, 200, b => Array.isArray(b.data));

  if (state.complaint_id) {
    const r3 = await request('GET', `${BASE}/complaints/${state.complaint_id}`, null, state.accessToken);
    record('GET /complaints/:id', r3, 200, b => b.data?.id === state.complaint_id);

    const r5 = await request('PATCH', `${BASE}/complaints/${state.complaint_id}/status`, {
      status: 'in_progress',
      remark: 'Test runner — marked in progress',
    }, state.accessToken);
    record('PATCH /complaints/:id/status', r5, 200, b => b.success);
  } else {
    recordSkip('GET /complaints/:id', 'no complaint_id');
    recordSkip('PATCH /complaints/:id/status', 'no complaint_id');
  }

  const r4 = await request('GET', `${BASE}/complaints/panchayat/${state.panchayat_id}?status=open`, null, state.accessToken);
  record('GET /complaints/panchayat/:id', r4, 200, b => b.success);
}

async function runCertificates() {
  console.log(`\n${c.bold}${c.cyan}❯ CERTIFICATES${c.reset}`);
  if (!state.accessToken) {
    ['POST /certificates (birth)', 'GET /certificates/mine', 'GET /certificates/:id',
     'PATCH /certificates/:id/status'].forEach(l => recordSkip(l, 'not authenticated'));
    return;
  }

  const r1 = await request('POST', `${BASE}/certificates`, {
    panchayat_id:   state.panchayat_id,
    type:           'birth',
    applicant_name: 'Arjun Sachin Gadge',
    details: {
      date_of_birth:  '2020-05-15',
      place_of_birth: 'Nerle',
      father_name:    'Sachin Gadge',
      mother_name:    'Priya Gadge',
    },
  }, state.accessToken);
  const ok1 = record('POST /certificates (birth)', r1, 201, b => b.data?.id);
  if (ok1) {
    state.cert_id = r1.body.data.id;
    console.log(`     ${c.gray}↳ ref: ${r1.body.data.reference_no}${c.reset}`);
  }

  const r2 = await request('GET', `${BASE}/certificates/mine`, null, state.accessToken);
  record('GET /certificates/mine', r2, 200, b => Array.isArray(b.data));

  if (state.cert_id) {
    const r3 = await request('GET', `${BASE}/certificates/${state.cert_id}`, null, state.accessToken);
    record('GET /certificates/:id', r3, 200, b => b.data?.id === state.cert_id);

    const r4 = await request('PATCH', `${BASE}/certificates/${state.cert_id}/status`, {
      status: 'processing',
      remark: 'Test runner — marked processing',
    }, state.accessToken);
    record('PATCH /certificates/:id/status', r4, 200, b => b.success);
  } else {
    recordSkip('GET /certificates/:id', 'no cert_id');
    recordSkip('PATCH /certificates/:id/status', 'no cert_id');
  }
}

async function runWaterBills() {
  console.log(`\n${c.bold}${c.cyan}❯ WATER BILLS${c.reset}`);
  if (!state.accessToken) {
    ['GET /water-bills/dues', 'POST /water-bills/:id/pay/init', 'POST /water-bills/:id/pay/confirm']
      .forEach(l => recordSkip(l, 'not authenticated'));
    return;
  }

  const r1 = await request('GET', `${BASE}/water-bills/dues`, null, state.accessToken);
  const ok1 = record('GET /water-bills/dues', r1, 200, b => b.success);
  if (ok1 && r1.body?.data?.bills?.length) {
    state.bill_id = r1.body.data.bills[0].id;
    console.log(`     ${c.gray}↳ found ${r1.body.data.bills.length} bill(s), total: ₹${r1.body.data.total_due}${c.reset}`);
  }

  if (state.bill_id) {
    const r2 = await request('POST', `${BASE}/water-bills/${state.bill_id}/pay/init`, null, state.accessToken);
    record('POST /water-bills/:id/pay/init', r2, 200, b => b.data?.order_id);

    const r3 = await request('POST', `${BASE}/water-bills/${state.bill_id}/pay/confirm`, {
      payment_ref: 'pay_test_ref_' + Date.now(),
    }, state.accessToken);
    record('POST /water-bills/:id/pay/confirm', r3, 200, b => b.data?.receipt_no);
  } else {
    recordSkip('POST /water-bills/:id/pay/init',    'no unpaid bills found');
    recordSkip('POST /water-bills/:id/pay/confirm', 'no unpaid bills found');
  }
}

async function runNotices() {
  console.log(`\n${c.bold}${c.cyan}❯ NOTICES${c.reset}`);

  const r1 = await request('GET', `${BASE}/notices?panchayat_id=${state.panchayat_id}&page=1`);
  record('GET /notices', r1, 200, b => Array.isArray(b.data));

  if (state.accessToken) {
    const r2 = await request('POST', `${BASE}/notices`, {
      panchayat_id: state.panchayat_id,
      title:        'Test Notice — API Runner',
      body:         'This is an automated test notice created by the API test runner.',
      type:         'general',
    }, state.accessToken);
    const ok2 = record('POST /notices', r2, 201, b => b.data?.id);
    if (ok2) state.notice_id = r2.body.data.id;

    if (state.notice_id) {
      const r3 = await request('GET', `${BASE}/notices/${state.notice_id}`);
      record('GET /notices/:id', r3, 200, b => b.data?.id === state.notice_id);

      const r4 = await request('DELETE', `${BASE}/notices/${state.notice_id}`, null, state.accessToken);
      record('DELETE /notices/:id', r4, 200, b => b.success);
    } else {
      recordSkip('GET /notices/:id',    'no notice_id');
      recordSkip('DELETE /notices/:id', 'no notice_id');
    }
  } else {
    recordSkip('POST /notices',       'not authenticated');
    recordSkip('GET /notices/:id',    'not authenticated');
    recordSkip('DELETE /notices/:id', 'not authenticated');
  }
}

async function runSchemes() {
  console.log(`\n${c.bold}${c.cyan}❯ SCHEMES${c.reset}`);

  const r1 = await request('GET', `${BASE}/schemes?page=1&limit=5`);
  record('GET /schemes', r1, 200, b => Array.isArray(b.data));

  if (r1.body?.data?.length) {
    state.scheme_id = r1.body.data[0].id;
    const r2 = await request('GET', `${BASE}/schemes/${state.scheme_id}`);
    record('GET /schemes/:id', r2, 200, b => b.data?.id);
  } else {
    recordSkip('GET /schemes/:id', 'no schemes in DB');
  }
}

async function runNotifications() {
  console.log(`\n${c.bold}${c.cyan}❯ NOTIFICATIONS${c.reset}`);
  if (!state.accessToken) {
    ['POST /notifications/register', 'DELETE /notifications/unregister']
      .forEach(l => recordSkip(l, 'not authenticated'));
    return;
  }
  const token = 'fcm_test_token_' + Date.now();

  const r1 = await request('POST', `${BASE}/notifications/register`, {
    token, platform: 'android',
  }, state.accessToken);
  record('POST /notifications/register', r1, 200, b => b.success);

  const r2 = await request('DELETE', `${BASE}/notifications/unregister`, { token }, state.accessToken);
  record('DELETE /notifications/unregister', r2, 200, b => b.success);
}

// ── MAIN ──────────────────────────────────────────────────────
async function main() {
  console.log(`\n${c.bold}${c.white}Smart Panchayat API — Test Runner${c.reset}`);
  console.log(`${c.gray}Environment : ${arg.toUpperCase()}${c.reset}`);
  console.log(`${c.gray}Base URL    : ${BASE}${c.reset}`);
  console.log(`${c.gray}Health URL  : ${HEALTH}${c.reset}`);
  console.log(line);

  const start = Date.now();

  await runHealth();
  await runAuth();
  await runCitizen();
  await runPanchayats();
  await runComplaints();
  await runCertificates();
  await runWaterBills();
  await runNotices();
  await runSchemes();
  await runNotifications();

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);

  console.log(`\n${line}`);
  console.log(`${c.bold}  Results${c.reset}`);
  console.log(`  ${c.green}Passed : ${passed}${c.reset}`);
  console.log(`  ${c.red}Failed : ${failed}${c.reset}`);
  console.log(`  ${c.yellow}Skipped: ${skipped}${c.reset}`);
  console.log(`  ${c.gray}Time   : ${elapsed}s${c.reset}`);
  console.log(line);

  if (failed > 0) {
    console.log(`\n${c.bold}${c.red}  Failed Tests:${c.reset}`);
    results.filter(r => r.ok === false).forEach(r => {
      console.log(`  ${c.red}✗${c.reset} ${r.label} ${c.gray}[${r.status}]${c.reset}`);
    });
    console.log('');
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
