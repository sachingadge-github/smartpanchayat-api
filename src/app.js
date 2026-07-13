require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const env = require('./config/env');
const { testConnection } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/error.middleware');

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// Static uploads
app.use('/uploads', express.static(path.resolve(env.upload.dir)));

// Swagger UI
const swaggerDoc = YAML.load(path.resolve(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, {
  customSiteTitle: 'Smart Panchayat API Docs',
  swaggerOptions: { persistAuthorization: true },
}));

// Rate limiting
app.use('/api/v1/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many requests' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// Health check
app.get('/health', (req, res) => res.json({
  status: 'ok',
  app: env.app.name,
  version: env.app.version,
  timestamp: new Date().toISOString(),
}));

// Routes
const BASE = '/api/v1';
app.use(`${BASE}/auth`,          require('./modules/auth/auth.routes'));
app.use(`${BASE}/citizen`,       require('./modules/citizen/citizen.routes'));
app.use(`${BASE}/panchayats`,    require('./modules/panchayat/panchayat.routes'));
app.use(`${BASE}/complaints`,    require('./modules/complaint/complaint.routes'));
app.use(`${BASE}/certificates`,  require('./modules/certificate/certificate.routes'));
app.use(`${BASE}/water-bills`,   require('./modules/waterbill/waterbill.routes'));
app.use(`${BASE}/notices`,       require('./modules/notice/notice.routes'));
app.use(`${BASE}/schemes`,       require('./modules/scheme/scheme.routes'));
app.use(`${BASE}/upload`,        require('./modules/upload/upload.routes'));
app.use(`${BASE}/notifications`, require('./modules/notification/notification.routes'));

// 404 & Error
app.use(notFound);
app.use(errorHandler);

const PORT = env.port;
app.listen(PORT, async () => {
  await testConnection();
  console.log(`🚀 ${env.app.name} API running on http://localhost:${PORT}`);
  console.log(`📋 Swagger: http://localhost:${PORT}/api-docs`);
  console.log(`🌍 Mode: ${env.nodeEnv}`);
});

module.exports = app;
