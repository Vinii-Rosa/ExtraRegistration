import users from './users.js';
import projects from './projects.js';
import extra_hours from './extra_hours.js';
import monthly_totals from './monthly_totals.js';
import type { Models } from './types.js';

const models: Models = { users, projects, extra_hours, monthly_totals };

users.associate?.(models);
projects.associate?.(models);
extra_hours.associate?.(models);
monthly_totals.associate?.(models);

export { users, projects, extra_hours, monthly_totals };
export default models;
