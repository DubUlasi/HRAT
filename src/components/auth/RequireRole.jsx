import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME } from '../../data/mockUsers';

// Every role dashboard filters complaints down to "assigned to me" (officerId/departmentId),
// so landing on one of these routes without being logged in, or while logged in as a
// different role, silently shows an empty dashboard instead of an error — confusing, since
// nothing looks broken, it just looks like there's no data. This guard makes that fail loudly:
// not logged in goes to /login, logged in as the wrong role goes to that role's own dashboard.
export default function RequireRole({ role, children }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // `role` may be a single role string or an array of roles allowed to view the page (e.g.
  // Repeat Violators, shared by Registry Head/Director/ES but not the rest of the department).
  const allowed = Array.isArray(role) ? role.includes(user.role) : user.role === role;
  if (!allowed) {
    return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
  }

  return children;
}
