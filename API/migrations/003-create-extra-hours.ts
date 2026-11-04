import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('extra_hours', {
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
    project_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id',
      },    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    card_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    card_link: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    total_value: {
      type: DataTypes.INTEGER,
      allowNull: true,
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

  await queryInterface.addIndex('extra_hours', ['user_id', 'date'], {
    name: 'extra_hours_user_id_date',
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('extra_hours');
}
