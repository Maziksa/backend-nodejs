import { CONFIG } from './constants.js';

export default {
  development: {
    username: CONFIG.DB_USER,
    password: CONFIG.DB_PASSWORD,
    database: CONFIG.DB_NAME,
    host: CONFIG.DB_HOST,
    port: CONFIG.DB_PORT,
    dialect: 'postgres',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: false
    }
  },
  test: {
    username: CONFIG.DB_USER,
    password: CONFIG.DB_PASSWORD,
    database: `${CONFIG.DB_NAME}_test`,
    host: CONFIG.DB_HOST,
    port: CONFIG.DB_PORT,
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: CONFIG.DB_USER,
    password: CONFIG.DB_PASSWORD,
    database: CONFIG.DB_NAME,
    host: CONFIG.DB_HOST,
    port: CONFIG.DB_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};
