import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { mockComplaints } from '../data/mockComplaints';
import { STAGE_ORDER, SUB_STATUS } from '../constants/complaintStatus';

const ComplaintsContext = createContext(null);

function nowIso() {
  return new Date().toISOString();
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
        next = pushActivity(next, `Assigned officer to assign complaint number${remark ? ` — "${remark}"` : ''}`, CURRENT_USER.name);
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
      next = pushActivity(next, `Assigned officer to check admissibility of complaint${remark ? ` — "${remark}"` : ''}`, CURRENT_USER.name);
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
        `Admissibility check confirmed by Complaint Registry Head — ${agree ? 'agreed' : 'disagreed'}${remark ? ` ("${remark}")` : ''}`,
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
      next = pushActivity(next, `Complaint assigned to department${remark ? ` — "${remark}"` : ''}`, CURRENT_USER.name);
      return next;
    });
  }, [updateComplaint]);

  const createComplaint = useCallback(({ subject, category, description, victim, allegedViolator, office, voiceRecordingUrl }) => {
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
      subStatus: SUB_STATUS.NEW,
      stageIndex: -1,
      registryOfficerId: null,
      admissibilityOfficerId: null,
      admissibility: { decision: null, explanation: null, officerRemark: null, headConfirmed: false, headAgree: null, headRemark: null },
      activityLog: [],
    };
    complaint = pushActivity(complaint, 'Complaint submitted', CURRENT_USER.name);
    setComplaints((prev) => [complaint, ...prev]);
    return id;
  }, []);

  const value = useMemo(() => ({
    complaints,
    getComplaintById,
    assignComplaintNumberOfficer,
    assignAdmissibilityOfficer,
    confirmAdmissibilityCheck,
    assignToDepartment,
    createComplaint,
    currentUser: CURRENT_USER,
  }), [complaints, getComplaintById, assignComplaintNumberOfficer, assignAdmissibilityOfficer, confirmAdmissibilityCheck, assignToDepartment, createComplaint]);

  return <ComplaintsContext.Provider value={value}>{children}</ComplaintsContext.Provider>;
}

export function useComplaints() {
  const ctx = useContext(ComplaintsContext);
  if (!ctx) throw new Error('useComplaints must be used within a ComplaintsProvider');
  return ctx;
}
