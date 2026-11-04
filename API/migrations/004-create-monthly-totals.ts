import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('monthly_totals', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },    },
    month: {
      type: DataTypes.CHAR(7),
      allowNull: false,
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await queryInterface.addIndex('monthly_totals', ['user_id', 'month'], {
    unique: true,
    name: 'monthly_totals_user_id_month_unique',
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('monthly_totals');
}
