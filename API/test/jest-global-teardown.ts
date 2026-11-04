import { Sequelize } from 'sequelize';

const TEST_DATABASE = 'extra_hour_test';

export default async function globalTeardown() {
  if (!TEST_DATABASE.endsWith('_test')) return;

  const admin = new Sequelize('', process.env.DB_USER || 'root', process.env.DB_PASSWORD || 'root', {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3307,
    dialect: 'mariadb',
    logging: false,
  });

  try {
    await admin.query(`DROP DATABASE IF EXISTS ${TEST_DATABASE}`);
  } finally {
    await admin.close();
  }
}
