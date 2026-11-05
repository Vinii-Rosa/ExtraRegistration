import { Sequelize } from 'sequelize';

export default async function globalSetup() {
  const admin = new Sequelize('', process.env.DB_USER || 'root', process.env.DB_PASSWORD || 'root', {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3307,
    dialect: 'mysql',
    logging: false,
  });

  try {
    await admin.query('CREATE DATABASE IF NOT EXISTS extra_hour_test');
  } finally {
    await admin.close();
  }
}
