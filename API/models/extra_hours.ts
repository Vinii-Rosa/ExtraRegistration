import { DataTypes } from 'sequelize';
import db from '../db.js';
import type { ModelWithAssociate, Models } from './types.js';

const extra_hours = db.define('extra_hours', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  project_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id',
    },
  },
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
  total_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}) as ModelWithAssociate;

extra_hours.associate = function (models: Models) {
  extra_hours.user = extra_hours.belongsTo(models.users, {
    foreignKey: 'user_id',
    as: 'user',
  });
  extra_hours.project = extra_hours.belongsTo(models.projects, {
    foreignKey: 'project_id',
    as: 'project',
  });
};

export default extra_hours;
