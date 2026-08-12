module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DB_PATH: process.env.DB_PATH || './absensi.db',

  // Face Recognition Service
  FACE_RECOGNITION_ENABLED: true,
  FACE_CONFIDENCE_THRESHOLD: 0.6, // 60% confidence minimum
  FACE_RECOGNITION_DELAY: 2000, // 2 seconds between face scans

  // NFC Settings
  NFC_SCAN_COOLDOWN: 60000, // 1 minute prevent duplicate scans
  NFC_BAUDRATE: 9600,

  // Admin Credentials (should be changed in production)
  DEFAULT_ADMIN: {
    username: 'admin',
    password: 'admin123'
  }
};
