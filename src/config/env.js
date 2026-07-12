require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    name: process.env.DB_NAME || 'smart_panchayat',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'nexbuild_secret_dev',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  otp: {
    mock: process.env.MOCK_OTP === 'true',
    mockCode: process.env.MOCK_OTP_CODE || '123456',
    expiresMinutes: parseInt(process.env.OTP_EXPIRES_MINUTES) || 10,
  },
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB) || 5,
  },
  app: {
    name: process.env.APP_NAME || 'Smart Panchayat',
    version: process.env.APP_VERSION || '1.0.0',
  },
};
