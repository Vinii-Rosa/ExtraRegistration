import { DataTypes } from 'sequelize';
import db from '../db.js';
import type { ModelWithAssociate, Models } from './types.js';

const users = db.define('users', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}) as ModelWithAssociate;

users.associate = function (models: Models) {
  users.projects = users.hasMany(models.projects, {
    foreignKey: 'user_id',
    as: 'projects',
  });
  users.extra_hours = users.hasMany(models.extra_hours, {
    foreignKey: 'user_id',
    as: 'extra_hours',
  });
  users.monthly_totals = users.hasMany(models.monthly_totals, {
    foreignKey: 'user_id',
    as: 'monthly_totals',
  });
};

export default users;
