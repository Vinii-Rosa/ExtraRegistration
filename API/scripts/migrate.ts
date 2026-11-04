import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { QueryInterface, QueryTypes, Sequelize } from 'sequelize';
import db from '../db.js';

type Migration = {
  up: (queryInterface: QueryInterface, sequelize: typeof Sequelize) => Promise<void>;
  down?: (queryInterface: QueryInterface, sequelize: typeof Sequelize) => Promise<void>;
};

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');

async function runMigrations() {
  await db.query(`CREATE TABLE IF NOT EXISTS sequelize_migrations (
    name VARCHAR(255) NOT NULL PRIMARY KEY,
    executed_at DATETIME NOT NULL
  )`);

  const executed = await db.query<{ name: string }>('SELECT name FROM sequelize_migrations', {
    type: QueryTypes.SELECT,
  });
  const executedNames = new Set(executed.map((row) => row.name));

  const files = (await readdir(migrationsDir))
    .filter((file) => /\.(ts|js)$/.test(file) && !file.endsWith('.d.ts'))
    .sort();

  for (const file of files) {
    const name = path.parse(file).name;
    if (executedNames.has(name)) continue;

    const migration = (await import(pathToFileURL(path.join(migrationsDir, file)).href)) as Migration;

    console.log(`Executando migration ${name}`);
    await migration.up(db.getQueryInterface(), Sequelize);
    await db.query('INSERT INTO sequelize_migrations (name, executed_at) VALUES (?, NOW())', {
      replacements: [name],
    });
  }
}

try {
  await runMigrations();
  console.log('Migrations concluídas');
} catch (error) {
  console.error('Erro nas migrations:', error);
  process.exitCode = 1;
} finally {
  await db.close();
}
