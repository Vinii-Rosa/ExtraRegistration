import users from './users.js';
import projects from './projects.js';
import extra_hours from './extra_hours.js';
import monthly_totals from './monthly_totals.js';

users.hasMany(projects, { foreignKey: 'user_id', as: 'projects' });
projects.belongsTo(users, { foreignKey: 'user_id', as: 'user' });

users.hasMany(extra_hours, { foreignKey: 'user_id', as: 'extra_hours' });
extra_hours.belongsTo(users, { foreignKey: 'user_id', as: 'user' });

users.hasMany(monthly_totals, { foreignKey: 'user_id', as: 'monthly_totals' });
monthly_totals.belongsTo(users, { foreignKey: 'user_id', as: 'user' });

projects.hasMany(extra_hours, { foreignKey: 'project_id', as: 'extra_hours' });
extra_hours.belongsTo(projects, { foreignKey: 'project_id', as: 'project' });

export { users, projects, extra_hours, monthly_totals };
