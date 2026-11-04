import { DataTypes } from 'sequelize';
import db from '../db.js';

const projects = db.define('projects', {
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
});

export default projects;
