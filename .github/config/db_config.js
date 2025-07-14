const dbConfig = {
  user: 'sa',
  password: 'admin123456',
  server: '10.10.0.11',
  port: 1433,
  database: 'payx_data',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

module.exports = dbConfig;