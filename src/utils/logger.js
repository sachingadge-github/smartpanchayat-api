const fs   = require('fs');
const path = require('path');

const LOG_DIR  = path.resolve(__dirname, '../../logs');
const ENV      = process.env.NODE_ENV || 'development';
const isProd   = ENV === 'production';

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const streams = {
  combined: fs.createWriteStream(path.join(LOG_DIR, 'combined.log'), { flags: 'a' }),
  error:    fs.createWriteStream(path.join(LOG_DIR, 'error.log'),    { flags: 'a' }),
};

const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const MIN_LEVEL = isProd ? LEVELS.INFO : LEVELS.DEBUG;

const colours = {
  DEBUG: '\x1b[36m', INFO: '\x1b[32m', WARN: '\x1b[33m', ERROR: '\x1b[31m', reset: '\x1b[0m',
};

function write(level, module, message, meta) {
  if (LEVELS[level] < MIN_LEVEL) return;

  const ts      = new Date().toISOString();
  const metaStr = meta ? ' ' + JSON.stringify(meta) : '';
  const line    = `[${ts}] [${level}] [${module}] ${message}${metaStr}`;

  // file
  streams.combined.write(line + '\n');
  if (level === 'ERROR') streams.error.write(line + '\n');

  // console
  const colour = colours[level] || '';
  console.log(`${colour}${line}${colours.reset}`);
}

function makeLogger(module) {
  return {
    debug: (msg, meta) => write('DEBUG', module, msg, meta),
    info:  (msg, meta) => write('INFO',  module, msg, meta),
    warn:  (msg, meta) => write('WARN',  module, msg, meta),
    error: (msg, meta) => write('ERROR', module, msg, meta),
  };
}

module.exports = makeLogger;
