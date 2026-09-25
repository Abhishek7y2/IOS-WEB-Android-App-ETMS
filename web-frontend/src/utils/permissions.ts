/**
 * Centralized Role-Based Access Control (RBAC) utility for the Web Frontend.
 * Defines roles and permission checks to ensure industry-standard access management.
 */

export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
};

/**
 * Checks if the user is a superadmin.
 */
export const isSuperAdmin = (user: any): boolean => {
  if (!user || !user.role) return false;
  return user.role.toLowerCase() === ROLES.SUPERADMIN;
};

/**
 * Checks if the user is an admin or superadmin.
 */
export const isAdmin = (user: any): boolean => {
  if (!user || !user.role) return false;
  const role = user.role.toLowerCase();
  return role === ROLES.ADMIN || role === ROLES.SUPERADMIN;
};

/**
 * Helper to get a formatted display role based on strict user.role
 * Ignoring arbitrary designations for security logic.
 */
export const getDisplayRole = (user: any): string => {
  if (isSuperAdmin(user)) return 'Super Admin';
  if (isAdmin(user)) return 'Admin';
  return 'Employee';
};
