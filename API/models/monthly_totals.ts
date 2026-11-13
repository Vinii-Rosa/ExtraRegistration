import { DataTypes } from 'sequelize';
import db from '../db.js';
import type { ModelWithAssociate, Models } from './types.js';

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
  total_minutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}) as ModelWithAssociate;

monthly_totals.associate = function (models: Models) {
  monthly_totals.user = monthly_totals.belongsTo(models.users, {
    foreignKey: 'user_id',
    as: 'user',
  });
};

export default monthly_totals;
