import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { mockManagedUsers } from '../data/mockManagedUsers';
import { departments as pipelineDepartments } from '../data/mockOfficers';

const UserManagementContext = createContext(null);

const USERS_KEY = 'hrat-managed-users';
const DEPARTMENTS_KEY = 'hrat-admin-departments';

// This roster is the ICT Head/Personnel's own staffing & org data — separate from mockUsers.js
// (which only matters for login) and separate from mockOfficers.js's `departments` (the fixed
// set the existing complaint pipeline routes cases to). Onboarding someone or creating a
// department here creates a real, persisted admin record; it doesn't retroactively change which
// departments the pipeline can assign a complaint to — that's pipeline configuration, a
// different concern from staffing records.
function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore storage failures / corrupt JSON — fall through to the seed data
  }
  return mockManagedUsers;
}

function loadDepartments() {
  try {
    const raw = localStorage.getItem(DEPARTMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore storage failures / corrupt JSON — fall through to the seed data
  }
  return pipelineDepartments.map((d) => ({ ...d, description: '' }));
}

function slugify(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function UserManagementProvider({ children }) {
  const [users, setUsers] = useState(loadUsers);
  const [departments, setDepartments] = useState(loadDepartments);

  useEffect(() => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch {
      // ignore storage failures (e.g. quota exceeded, private browsing)
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(departments));
    } catch {
      // ignore storage failures (e.g. quota exceeded, private browsing)
    }
  }, [departments]);

  const updateUser = useCallback((id, patch) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }, []);

  const createUser = useCallback((data) => {
    const id = `managed-${Date.now()}`;
    setUsers((prev) => [
      { id, status: 'pending', deactivationReason: null, departmentId: null, lastLoginAt: null, joinedDate: new Date().toISOString().slice(0, 10), ...data },
      ...prev,
    ]);
    return id;
  }, []);

  const activateUser = useCallback((id) => {
    updateUser(id, { status: 'active', deactivationReason: null });
  }, [updateUser]);

  const deactivateUser = useCallback((id, reason) => {
    updateUser(id, { status: 'inactive', deactivationReason: reason });
  }, [updateUser]);

  const removeUser = useCallback((id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const createDepartment = useCallback((data) => {
    const id = slugify(data.name) || `dept-${Date.now()}`;
    setDepartments((prev) => [...prev, { id, description: '', ...data }]);
    return id;
  }, []);

  const updateDepartment = useCallback((id, patch) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }, []);

  const deleteDepartment = useCallback((id) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    setUsers((prev) => prev.map((u) => (u.departmentId === id ? { ...u, departmentId: null } : u)));
  }, []);

  const assignMembersToDepartment = useCallback((departmentId, userIds) => {
    setUsers((prev) => prev.map((u) => (userIds.includes(u.id) ? { ...u, departmentId } : u)));
  }, []);

  const getUserById = useCallback((id) => users.find((u) => u.id === id), [users]);

  const value = useMemo(() => ({
    users,
    departments,
    createUser,
    updateUser,
    activateUser,
    deactivateUser,
    removeUser,
    getUserById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    assignMembersToDepartment,
  }), [users, departments, createUser, updateUser, activateUser, deactivateUser, removeUser, getUserById, createDepartment, updateDepartment, deleteDepartment, assignMembersToDepartment]);

  return <UserManagementContext.Provider value={value}>{children}</UserManagementContext.Provider>;
}

export function useUserManagement() {
  const ctx = useContext(UserManagementContext);
  if (!ctx) throw new Error('useUserManagement must be used within a UserManagementProvider');
  return ctx;
}
