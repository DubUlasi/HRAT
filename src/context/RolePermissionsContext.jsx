import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CAPABILITY_DEFS, DEFAULT_ROLE_CAPABILITIES } from '../data/rolePermissions';

const RolePermissionsContext = createContext(null);

const PERMISSIONS_KEY = 'hrat-role-capabilities';

function loadCapabilities() {
  try {
    const raw = localStorage.getItem(PERMISSIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore storage failures / corrupt JSON — fall through to the seed data
  }
  return DEFAULT_ROLE_CAPABILITIES;
}

export function RolePermissionsProvider({ children }) {
  const [capabilities, setCapabilities] = useState(loadCapabilities);

  useEffect(() => {
    try {
      localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(capabilities));
    } catch {
      // ignore storage failures (e.g. quota exceeded, private browsing)
    }
  }, [capabilities]);

  const hasCapability = useCallback((role, capability) => {
    return (capabilities[role] || []).includes(capability);
  }, [capabilities]);

  // Every role currently granted `capability` — what a RequireRole guard needs to enforce it for
  // real at the route level (see App.jsx's /ict-head/users, /onboarding, /departments routes).
  const rolesWithCapability = useCallback((capability) => {
    return Object.keys(capabilities).filter((role) => capabilities[role]?.includes(capability));
  }, [capabilities]);

  const toggleCapability = useCallback((role, capability, enabled) => {
    setCapabilities((prev) => {
      const current = prev[role] || [];
      const next = enabled
        ? [...new Set([...current, capability])]
        : current.filter((c) => c !== capability);
      return { ...prev, [role]: next };
    });
  }, []);

  const value = useMemo(() => ({
    capabilities,
    capabilityDefs: CAPABILITY_DEFS,
    hasCapability,
    rolesWithCapability,
    toggleCapability,
  }), [capabilities, hasCapability, rolesWithCapability, toggleCapability]);

  return <RolePermissionsContext.Provider value={value}>{children}</RolePermissionsContext.Provider>;
}

export function useRolePermissions() {
  const ctx = useContext(RolePermissionsContext);
  if (!ctx) throw new Error('useRolePermissions must be used within a RolePermissionsProvider');
  return ctx;
}
