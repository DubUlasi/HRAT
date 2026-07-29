import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { mockCalls } from '../data/mockCalls';

// Owns call-log data only (the calls list + creating a new entry). Cross-referencing a phone
// number against complaint history lives on ComplaintsContext instead (findCallerHistory) —
// that's fundamentally a complaints query, so it stays with the data it queries rather than
// being duplicated or awkwardly reached-into from here.
const CallsContext = createContext(null);

function nowIso() {
  return new Date().toISOString();
}

export function CallsProvider({ children }) {
  const [calls, setCalls] = useState(mockCalls);

  const getCallById = useCallback(
    (id) => calls.find((c) => c.id === id),
    [calls]
  );

  const createCallLog = useCallback(({ phoneNumber, callerType, linkedComplaintIds = [], suggestedCategory, notes, handledBy, outcome }) => {
    const id = `call-${Date.now()}`;
    const call = {
      id,
      phoneNumber,
      callerType,
      linkedComplaintIds,
      suggestedCategory: suggestedCategory || null,
      notes: notes || '',
      handledBy,
      timestamp: nowIso(),
      outcome,
    };
    setCalls((prev) => [call, ...prev]);
    return id;
  }, []);

  const value = useMemo(() => ({
    calls,
    getCallById,
    createCallLog,
  }), [calls, getCallById, createCallLog]);

  return <CallsContext.Provider value={value}>{children}</CallsContext.Provider>;
}

export function useCalls() {
  const ctx = useContext(CallsContext);
  if (!ctx) throw new Error('useCalls must be used within a CallsProvider');
  return ctx;
}
