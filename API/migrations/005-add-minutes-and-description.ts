import { DataTypes, ModelAttributeColumnOptions, QueryInterface } from 'sequelize';

async function addColumnIfNotExists(
  queryInterface: QueryInterface,
  table: string,
  column: string,
  attributes: ModelAttributeColumnOptions,
) {
  const columns = await queryInterface.describeTable(table);
  if (columns[column]) return;

  await queryInterface.addColumn(table, column, attributes);
}

export async function up(queryInterface: QueryInterface) {
  await addColumnIfNotExists(queryInterface, 'extra_hours', 'total_minutes', {
    type: DataTypes.INTEGER,
    allowNull: true,
  });

  await addColumnIfNotExists(queryInterface, 'extra_hours', 'description', {
    type: DataTypes.TEXT,
    allowNull: true,
  });

  await addColumnIfNotExists(queryInterface, 'monthly_totals', 'total_minutes', {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  });

  await queryInterface.sequelize.query(`
    UPDATE extra_hours
    SET total_minutes = MOD(TIME_TO_SEC(TIMEDIFF(end_time, start_time)) DIV 60 + 1440, 1440)
    WHERE end_time IS NOT NULL
  `);

  await queryInterface.sequelize.query(`
    UPDATE monthly_totals mt
    SET total_minutes = (
      SELECT COALESCE(SUM(eh.total_minutes), 0)
      FROM extra_hours eh
      WHERE eh.user_id = mt.user_id AND DATE_FORMAT(eh.date, '%Y-%m') = mt.month
    )
  `);
}
