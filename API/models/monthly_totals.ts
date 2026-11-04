import { DataTypes } from 'sequelize';
import db from '../db.js';

const monthly_totals = db.define('monthly_totals', {
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
  month: {
    type: DataTypes.CHAR(7),
    allowNull: false,
  },
  total: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

export default monthly_totals;
