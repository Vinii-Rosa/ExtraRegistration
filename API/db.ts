import { Sequelize } from 'sequelize';

const isTest = process.env.NODE_ENV === 'test';
const database = isTest ? 'extra_hour_test' : 'extra_hour';

const db = new Sequelize(database, process.env.DB_USER || 'root', process.env.DB_PASSWORD || 'root', {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3307,
  dialect: 'mariadb',
  logging: isTest ? false : console.log,
});

export default db;
