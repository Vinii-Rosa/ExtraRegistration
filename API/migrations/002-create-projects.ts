import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('projects', {
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
    project_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hourly_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_profit: {
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

  await queryInterface.addIndex('projects', ['user_id', 'project_name'], {
    unique: true,
    name: 'projects_user_id_project_name_unique',
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('projects');
}
