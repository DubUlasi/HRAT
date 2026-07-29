import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { mockComplaints } from '../data/mockComplaints';
import { STAGE_ORDER, SUB_STATUS } from '../constants/complaintStatus';

const ComplaintsContext = createContext(null);

function nowIso() {
  return new Date().toISOString();
}

function normalizeIdentityValue(value) {
  return (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

// Name is the primary match signal; phone/email (when present) are secondary signals that can
// merge two complaints even if the violator's name was entered slightly differently. Exact
// normalized-string matching only — no fuzzy matching library, per the simple-matching goal.
function violatorIdentityKeys(violator) {
  if (!violator) return [];
  const keys = [];
  const name = normalizeIdentityValue(violator.name);
  if (name) keys.push(`name:${name}`);
  const phone = normalizeIdentityValue(violator.phone);
  if (phone) keys.push(`phone:${phone}`);
  const email = normalizeIdentityValue(violator.email);
  if (email) keys.push(`email:${email}`);
  return keys;
}

// Union-find over complaints: two complaints land in the same group if their alleged violator
// shares ANY identity key (normalized name, phone, or email), transitively.
function groupComplaintsByViolator(complaints) {
  const parent = complaints.map((_, i) => i);

  function findRoot(i) {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  }

  function union(a, b) {
    const ra = findRoot(a);
    const rb = findRoot(b);
    if (ra !== rb) parent[ra] = rb;
  }

  const firstIndexForKey = new Map();
  complaints.forEach((complaint, i) => {
    violatorIdentityKeys(complaint.allegedViolator).forEach((key) => {
      if (firstIndexForKey.has(key)) {
        union(i, firstIndexForKey.get(key));
      } else {
        firstIndexForKey.set(key, i);
      }
    });
  });

  const groups = new Map();
  complaints.forEach((complaint, i) => {
    const root = findRoot(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(complaint);
  });

  return [...groups.values()];
}

function nextComplaintNumber(complaints) {
  const highest = complaints.reduce((max, c) => {
    const match = c.complaintNumber && c.complaintNumber.match(/(\d+)$/);
    const num = match ? parseInt(match[1], 10) : 0;
    return Math.max(max, num);
  }, 293);
  return `NHRC/24/${highest + 1}`;
}

function pushActivity(complaint, message, actor) {
  return {
    ...complaint,
    activityLog: [
      ...complaint.activityLog,
      { id: `${complaint.id}-${complaint.activityLog.length}-${Date.now()}`, message, actor, timestamp: nowIso() },
    ],
  };
}

// This "current user" stands in for auth until a real login/session exists.
const CURRENT_USER = { name: 'Sam Peter', email: 'sampete@example.com' };

export function ComplaintsProvider({ children }) {
  const [complaints, setComplaints] = useState(mockComplaints);

  const getComplaintById = useCallback(
    (id) => complaints.find((c) => c.id === id),
    [complaints]
  );

  // Flags every alleged violator named in 2+ complaints. Each group's `complaints` list is
  // sorted most-recent-first so `complaints[0]` doubles as the group's "anchor" for display.
  const getRepeatOffenders = useCallback(() => {
    return groupComplaintsByViolator(complaints)
      .filter((group) => group.length >= 2)
      .map((group) => {
        const sorted = [...group].sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled));
        const canonical = sorted[0].allegedViolator;
        const categories = [...new Set(group.map((c) => c.category))];
        return {
          id: normalizeIdentityValue(canonical.name) || sorted[0].id,
          name: canonical.name,
          phone: canonical.phone,
          email: canonical.email,
          complaintCount: group.length,
          categories,
          mostRecentDate: sorted[0].dateFiled,
          anchorComplaintId: sorted[0].id,
          complaints: sorted,
        };
      })
      .sort((a, b) => b.complaintCount - a.complaintCount || new Date(b.mostRecentDate) - new Date(a.mostRecentDate));
  }, [complaints]);

  // Same matching logic as getRepeatOffenders, scoped to one complaint's violator and
  // excluding the complaint itself.
  const findRelatedComplaints = useCallback((complaintId) => {
    const groups = groupComplaintsByViolator(complaints);
    const group = groups.find((g) => g.some((c) => c.id === complaintId));
    if (!group) return [];
    return group.filter((c) => c.id !== complaintId).sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled));
  }, [complaints]);

  // Used by the Call Center feature to tell a "returning" caller from a "new" one — matches
  // against the victim/complainant phone number on file, not the alleged violator's.
  const findCallerHistory = useCallback((phoneNumber) => {
    const normalized = normalizeIdentityValue(phoneNumber);
    if (!normalized) return [];
    return complaints
      .filter((c) => normalizeIdentityValue(c.victim?.phone) === normalized)
      .sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled));
  }, [complaints]);

  const updateComplaint = useCallback((id, updater) => {
    setComplaints((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
  }, []);

  const assignComplaintNumberOfficer = useCallback((id, officerId, officerName, remark) => {
    setComplaints((prev) => {
      const complaintNumber = nextComplaintNumber(prev);
      return prev.map((c) => {
        if (c.id !== id) return c;
        let next = {
          ...c,
          registryOfficerId: officerId,
          complaintNumber,
          subStatus: SUB_STATUS.COMPLAINT_NUMBER_ASSIGNMENT,
          stageIndex: STAGE_ORDER.indexOf('case_created'),
        };
        next = pushActivity(next, `Assigned officer to assign complaint number${remark ? `, "${remark}"` : ''}`, CURRENT_USER.name);
        next = pushActivity(next, `Complaint number ${complaintNumber} assigned`, officerName);
        return next;
      });
    });
  }, []);

  const assignAdmissibilityOfficer = useCallback((id, officerId, officerName, remark) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        admissibilityOfficerId: officerId,
        subStatus: SUB_STATUS.ADMISSIBILITY_CHECK,
        stageIndex: STAGE_ORDER.indexOf('admissibility_check'),
        admissibility: {
          ...c.admissibility,
          decision: 'ADMISSIBLE',
          explanation: 'The complaint has been thoroughly inspected and determined to be admissible.',
          officerRemark: remark || null,
        },
      };
      next = pushActivity(next, `Assigned officer to check admissibility of complaint${remark ? `, "${remark}"` : ''}`, CURRENT_USER.name);
      next = pushActivity(next, 'Admissibility check decision added', officerName);
      return next;
    });
  }, [updateComplaint]);

  const confirmAdmissibilityCheck = useCallback((id, { agree, remark }) => {
    updateComplaint(id, (c) => {
      const decisionIsAdmissible = c.admissibility.decision === 'ADMISSIBLE';
      const nextSubStatus = agree
        ? (decisionIsAdmissible ? SUB_STATUS.PRELIMINARY_INVESTIGATION : SUB_STATUS.INADMISSIBLE)
        : c.subStatus;

      let next = {
        ...c,
        subStatus: nextSubStatus,
        admissibility: {
          ...c.admissibility,
          headConfirmed: true,
          headAgree: agree,
          headRemark: remark || null,
        },
      };
      next = pushActivity(
        next,
        `Admissibility check confirmed by Complaint Registry Head, ${agree ? 'agreed' : 'disagreed'}${remark ? ` ("${remark}")` : ''}`,
        CURRENT_USER.name
      );
      return next;
    });
  }, [updateComplaint]);

  const assignToDepartment = useCallback((id, { office, department, remark }) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        office,
        department,
        stageIndex: STAGE_ORDER.indexOf('assigned_dept'),
        subStatus: SUB_STATUS.PRELIMINARY_INVESTIGATION,
      };
      next = pushActivity(next, `Complaint assigned to department${remark ? `, "${remark}"` : ''}`, CURRENT_USER.name);
      return next;
    });
  }, [updateComplaint]);

  const createComplaint = useCallback(({ subject, category, description, victim, allegedViolator, office, voiceRecordingUrl, evidenceFiles }) => {
    const id = `c-${Date.now()}`;
    let complaint = {
      id,
      subject,
      complaintNumber: null,
      category,
      scope: 'single',
      description,
      dateFiled: nowIso().slice(0, 10),
      victim,
      allegedViolator,
      office: office || null,
      department: null,
      voiceRecordingUrl: voiceRecordingUrl || null,
      // Client-only, in-memory: object URLs let the registry head open/download what was
      // uploaded within this browser session (there's no real backend to persist the files to).
      evidence: (evidenceFiles || []).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      })),
      subStatus: SUB_STATUS.NEW,
      stageIndex: -1,
      registryOfficerId: null,
      admissibilityOfficerId: null,
      admissibility: { decision: null, explanation: null, officerRemark: null, headConfirmed: false, headAgree: null, headRemark: null },
      investigation: { finding: null },
      activityLog: [],
    };
    complaint = pushActivity(complaint, 'Complaint submitted', CURRENT_USER.name);
    setComplaints((prev) => [complaint, ...prev]);
    return id;
  }, []);

  const value = useMemo(() => ({
    complaints,
    getComplaintById,
    getRepeatOffenders,
    findRelatedComplaints,
    findCallerHistory,
    assignComplaintNumberOfficer,
    assignAdmissibilityOfficer,
    confirmAdmissibilityCheck,
    assignToDepartment,
    createComplaint,
    currentUser: CURRENT_USER,
  }), [complaints, getComplaintById, getRepeatOffenders, findRelatedComplaints, findCallerHistory, assignComplaintNumberOfficer, assignAdmissibilityOfficer, confirmAdmissibilityCheck, assignToDepartment, createComplaint]);

  return <ComplaintsContext.Provider value={value}>{children}</ComplaintsContext.Provider>;
}

export function useComplaints() {
  const ctx = useContext(ComplaintsContext);
  if (!ctx) throw new Error('useComplaints must be used within a ComplaintsProvider');
  return ctx;
}
