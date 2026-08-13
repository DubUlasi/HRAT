import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { mockComplaints } from '../data/mockComplaints';
import { STAGE_ORDER, SUB_STATUS } from '../constants/complaintStatus';
import { useAuth } from './AuthContext';

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

function pushActivity(complaint, message, actor, extra) {
  return {
    ...complaint,
    activityLog: [
      ...complaint.activityLog,
      { id: `${complaint.id}-${complaint.activityLog.length}-${Date.now()}`, message, actor, timestamp: nowIso(), ...extra },
    ],
  };
}

export function ComplaintsProvider({ children }) {
  const { user } = useAuth();
  const actorName = user?.name || 'System';
  const actorOfficerId = user?.officerId || null;

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

  // Kept independent of every individual stage-action function (assignToDepartment,
  // supervisorReview, recordCouncilVerdict, ...) rather than threading a `files` param through
  // each of their signatures — every remark-taking modal calls this alongside its own action
  // when files were attached, so it's one function to maintain instead of fifteen.
  const attachDocuments = useCallback((id, files, stage) => {
    if (!files || files.length === 0) return;
    updateComplaint(id, (c) => {
      const newDocs = files.map((file) => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        stage: stage || null,
        uploadedBy: actorName,
        uploadedAt: nowIso(),
      }));
      let next = { ...c, documents: [...(c.documents || []), ...newDocs] };
      const fileWord = files.length === 1 ? 'file' : 'files';
      next = pushActivity(next, `Attached ${files.length} ${fileWord}${stage ? ` at ${stage}` : ''}`, actorName, {
        documents: newDocs.map((doc) => ({ id: doc.id, name: doc.name, url: doc.url, size: doc.size })),
      });
      return next;
    });
  }, [updateComplaint, actorName]);

  // Assigns WHO should handle numbering — the Desk Officer's own dashboard is where the number
  // actually gets processed (see processComplaintNumberAssignment below), so this only records
  // the assignment itself.
  const assignComplaintNumberOfficer = useCallback((id, officerId, officerName, remark) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        registryOfficerId: officerId,
        subStatus: SUB_STATUS.COMPLAINT_NUMBER_ASSIGNMENT,
        stageIndex: STAGE_ORDER.indexOf('case_created'),
      };
      next = pushActivity(next, `Assigned officer to assign complaint number${remark ? `, "${remark}"` : ''}`, actorName);
      return next;
    });
  }, [updateComplaint, actorName]);

  // Assigns WHO should perform the admissibility check — the Desk Officer's own dashboard is
  // where the real decision gets recorded (see submitAdmissibilityDecision below).
  const assignAdmissibilityOfficer = useCallback((id, officerId, officerName, remark) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        admissibilityOfficerId: officerId,
        subStatus: SUB_STATUS.ADMISSIBILITY_CHECK,
        stageIndex: STAGE_ORDER.indexOf('admissibility_check'),
        admissibility: { ...c.admissibility, decision: null, explanation: null, officerRemark: remark || null },
      };
      next = pushActivity(next, `Assigned officer to check admissibility of complaint${remark ? `, "${remark}"` : ''}`, actorName);
      return next;
    });
  }, [updateComplaint, actorName]);

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
        actorName
      );
      return next;
    });
  }, [updateComplaint, actorName]);

  const assignToDepartment = useCallback((id, { office, department, remark }) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        office,
        department,
        stageIndex: STAGE_ORDER.indexOf('assigned_dept'),
        subStatus: SUB_STATUS.DEPT_DIRECTOR_REVIEW,
        departmentDecision: { accepted: null, remark: null, decidedBy: null, decidedAt: null },
      };
      next = pushActivity(next, `Complaint assigned to department${remark ? `, "${remark}"` : ''}`, actorName);
      return next;
    });
  }, [updateComplaint, actorName]);

  // ── Desk Officer actions (split out of the Head's assignment steps above — the Head assigns
  // WHO should handle a step, the Desk Officer's own dashboard is where they actually process it) ──

  const processComplaintNumberAssignment = useCallback((id) => {
    setComplaints((prev) => {
      const complaintNumber = nextComplaintNumber(prev);
      return prev.map((c) => {
        if (c.id !== id) return c;
        let next = { ...c, complaintNumber };
        next = pushActivity(next, `Complaint number ${complaintNumber} assigned`, actorName);
        return next;
      });
    });
  }, [actorName]);

  const submitAdmissibilityDecision = useCallback((id, { decision, explanation, remark }) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        admissibility: {
          decision,
          explanation: explanation || null,
          officerRemark: remark || null,
          headConfirmed: false,
          headAgree: null,
          headRemark: null,
        },
      };
      next = pushActivity(next, `Admissibility check decision added: ${decision === 'ADMISSIBLE' ? 'Admissible' : 'Inadmissible'}`, actorName);
      return next;
    });
  }, [updateComplaint, actorName]);

  // ── State Office detour (single-tier — see plan) ──

  const reassignToStateOffice = useCallback((id, { officeId, remark }) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        subStatus: SUB_STATUS.SENT_TO_STATE_OFFICE,
        stateOffice: { sentTo: officeId, sentAt: nowIso(), remark: remark || null, returnedAt: null },
      };
      next = pushActivity(next, `Reassigned to state office${remark ? `, "${remark}"` : ''}`, actorName);
      return next;
    });
  }, [updateComplaint, actorName]);

  // Stub for the (separately built) State Coordinator/Personnel side to call once their local
  // review is done — resumes the normal head-office flow exactly where it left off.
  const returnFromStateOffice = useCallback((id) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        subStatus: SUB_STATUS.NEW,
        stateOffice: { ...c.stateOffice, returnedAt: nowIso() },
      };
      next = pushActivity(next, 'Returned from state office', actorName);
      return next;
    });
  }, [updateComplaint, actorName]);

  // ── Department Director ──

  const directorReviewDepartment = useCallback((id, { accepted, remark }) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        directorId: actorOfficerId,
        departmentDecision: { accepted, remark: remark || null, decidedBy: actorName, decidedAt: nowIso() },
        subStatus: accepted ? c.subStatus : SUB_STATUS.DEPT_REJECTED,
      };
      next = pushActivity(
        next,
        accepted ? 'Department accepted the complaint' : `Department rejected the complaint${remark ? `, "${remark}"` : ''}`,
        actorName
      );
      return next;
    });
  }, [updateComplaint, actorName, actorOfficerId]);

  const assignSupervisor = useCallback((id, { personId, personName, remark }) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        supervisorId: personId,
        subStatus: SUB_STATUS.ASSIGNED_TO_SUPERVISOR,
        stageIndex: STAGE_ORDER.indexOf('assigned_supervisor'),
      };
      next = pushActivity(next, `Complaint assigned to a supervisor${remark ? `, "${remark}"` : ''}`, actorName);
      return next;
    });
  }, [updateComplaint, actorName]);

  // Callable by either the Supervisor or the Director (skipping the supervisor) — the function
  // itself doesn't need to know which role invoked it.
  const assignInvestigator = useCallback((id, { personId, personName, remark }) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        investigatorId: personId,
        subStatus: SUB_STATUS.ASSIGNED_TO_INVESTIGATOR,
        stageIndex: STAGE_ORDER.indexOf('under_investigation'),
      };
      next = pushActivity(next, `Complaint assigned to an investigator${remark ? `, "${remark}"` : ''}`, actorName);
      return next;
    });
  }, [updateComplaint, actorName]);

  // ── Department Investigator ──

  const logInvestigationActivity = useCallback((id, { type, withParty, summary }) => {
    updateComplaint(id, (c) => {
      const activities = c.investigation.activities || [];
      const entry = { id: `${id}-act-${activities.length}-${Date.now()}`, type, withParty, summary, loggedAt: nowIso() };
      let next = {
        ...c,
        subStatus: c.subStatus === SUB_STATUS.ASSIGNED_TO_INVESTIGATOR ? SUB_STATUS.INVESTIGATING : c.subStatus,
        stageIndex: STAGE_ORDER.indexOf('under_investigation'),
        investigation: { ...c.investigation, activities: [...activities, entry] },
      };
      next = pushActivity(next, `Logged a ${type} with ${withParty}: "${summary}"`, actorName);
      return next;
    });
  }, [updateComplaint, actorName]);

  const updateInvestigationFinding = useCallback((id, { finding, recommendation }) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        investigation: {
          ...c.investigation,
          finding: finding ?? c.investigation.finding,
          recommendation: recommendation ?? c.investigation.recommendation,
        },
      };
      next = pushActivity(next, 'Updated investigation findings', actorName);
      return next;
    });
  }, [updateComplaint, actorName]);

  const submitInvestigationFindings = useCallback((id) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        subStatus: SUB_STATUS.SUPERVISOR_REVIEW,
        investigation: { ...c.investigation, submittedAt: nowIso() },
      };
      next = pushActivity(next, 'Investigation findings submitted', actorName);
      return next;
    });
  }, [updateComplaint, actorName]);

  // ── Department Supervisor ──

  const supervisorReview = useCallback((id, { satisfied, remark }) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        subStatus: satisfied ? SUB_STATUS.DIRECTOR_FINAL_REVIEW : SUB_STATUS.ASSIGNED_TO_INVESTIGATOR,
        supervisorReview: { remark: remark || null, satisfied, reviewedAt: nowIso() },
      };
      next = pushActivity(
        next,
        satisfied
          ? `Supervisor approved and forwarded to Director${remark ? `, "${remark}"` : ''}`
          : `Supervisor sent back to investigator${remark ? `, "${remark}"` : ''}`,
        actorName
      );
      return next;
    });
  }, [updateComplaint, actorName]);

  // ── Department Director — final sign-off ──

  const directorFinalReview = useCallback((id, { action, remark }) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        subStatus: action === 'forward' ? SUB_STATUS.DEPT_COMPLETE : SUB_STATUS.SUPERVISOR_REVIEW,
        directorReview: { remark: remark || null, action, reviewedAt: nowIso() },
      };
      next = pushActivity(
        next,
        action === 'forward'
          ? 'Director forwarded case, department work complete'
          : `Director sent back to supervisor${remark ? `, "${remark}"` : ''}`,
        actorName
      );
      return next;
    });
  }, [updateComplaint, actorName]);

  // Independent of the forward/send-back decision — a Director can flag a case for the
  // Executive Secretary's attention at any point without that ending the department's own review.
  const escalateToExecutiveSecretary = useCallback((id, { note }) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        esEscalation: { escalated: true, note: note || null, escalatedBy: actorName, escalatedAt: nowIso(), resolved: false },
      };
      next = pushActivity(next, `Escalated to Executive Secretary${note ? `, "${note}"` : ''}`, actorName);
      return next;
    });
  }, [updateComplaint, actorName]);

  // Executive Secretary clears an escalation from their queue once they've looked into it —
  // keeps `escalated: true` as history, just flips `resolved` so it drops off the active list.
  const resolveEscalation = useCallback((id, { note }) => {
    updateComplaint(id, (c) => {
      let next = { ...c, esEscalation: { ...c.esEscalation, resolved: true } };
      next = pushActivity(next, `Escalation resolved by Executive Secretary${note ? `, "${note}"` : ''}`, actorName);
      return next;
    });
  }, [updateComplaint, actorName]);

  // ── Complaint Registry Head — one-way send to council ──

  const sendToCouncil = useCallback((id) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        subStatus: SUB_STATUS.READY_FOR_COUNCIL,
        stageIndex: STAGE_ORDER.indexOf('executive_secretary'),
      };
      next = pushActivity(next, 'Sent to Executive Secretary for council review', actorName);
      return next;
    });
  }, [updateComplaint, actorName]);

  // ── Executive Secretary / Council ──

  const recordCouncilVerdict = useCallback((id, { verdict, recommendation }) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        subStatus: SUB_STATUS.CLOSED,
        stageIndex: STAGE_ORDER.indexOf('governing_council'),
        executiveSecretaryId: actorOfficerId,
        council: { verdict, recommendation: recommendation || null, decidedBy: actorName, decidedAt: nowIso() },
      };
      next = pushActivity(next, `Council recorded final verdict: ${verdict}`, actorName);
      return next;
    });
  }, [updateComplaint, actorName, actorOfficerId]);

  // For the INADMISSIBLE queue specifically — REOPEN sends it back for a fresh admissibility
  // decision, CLOSE upholds the inadmissible ruling.
  const councilReopenOrClose = useCallback((id, { decision, recommendation }) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        executiveSecretaryId: actorOfficerId,
        council: { verdict: decision, recommendation: recommendation || null, decidedBy: actorName, decidedAt: nowIso() },
      };
      if (decision === 'REOPEN') {
        next.subStatus = SUB_STATUS.ADMISSIBILITY_CHECK;
        next.admissibility = { ...c.admissibility, decision: null, explanation: null, officerRemark: null, headConfirmed: false, headAgree: null, headRemark: null };
      } else {
        next.subStatus = SUB_STATUS.CLOSED;
        next.stageIndex = STAGE_ORDER.indexOf('governing_council');
      }
      next = pushActivity(next, decision === 'REOPEN' ? 'Council reopened the case for re-review' : 'Council upheld inadmissibility, case closed', actorName);
      return next;
    });
  }, [updateComplaint, actorName, actorOfficerId]);

  const createComplaint = useCallback(({ subject, category, description, victim, allegedViolator, additionalVictims, additionalViolators, office, voiceRecordingUrl, evidenceFiles }) => {
    const id = `c-${Date.now()}`;
    // A group complaint is simply one with more than one victim and/or violator attached.
    const scope = (additionalVictims?.length || 0) > 0 || (additionalViolators?.length || 0) > 0 ? 'group' : 'single';
    let complaint = {
      id,
      subject,
      complaintNumber: null,
      category,
      scope,
      description,
      dateFiled: nowIso().slice(0, 10),
      victim,
      allegedViolator,
      additionalVictims: additionalVictims || [],
      additionalViolators: additionalViolators || [],
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
      // Everything staff attach at any later pipeline stage (as opposed to `evidence`, filed
      // with the original complaint) — shown together with `evidence` on the detail page's
      // Documents & Resources section. See attachDocuments below for how entries get added.
      documents: [],
      subStatus: SUB_STATUS.NEW,
      stageIndex: -1,
      registryOfficerId: null,
      admissibilityOfficerId: null,
      directorId: null,
      supervisorId: null,
      investigatorId: null,
      executiveSecretaryId: null,
      admissibility: { decision: null, explanation: null, officerRemark: null, headConfirmed: false, headAgree: null, headRemark: null },
      departmentDecision: { accepted: null, remark: null, decidedBy: null, decidedAt: null },
      investigation: { finding: null, recommendation: null, activities: [], submittedAt: null },
      supervisorReview: { remark: null, satisfied: null, reviewedAt: null },
      directorReview: { remark: null, action: null, reviewedAt: null },
      esEscalation: { escalated: false, note: null, escalatedBy: null, escalatedAt: null, resolved: false },
      stateOffice: { sentTo: null, sentAt: null, remark: null, returnedAt: null },
      council: { verdict: null, recommendation: null, decidedBy: null, decidedAt: null },
      activityLog: [],
    };
    complaint = pushActivity(complaint, 'Complaint submitted', actorName);
    setComplaints((prev) => [complaint, ...prev]);
    return id;
  }, [actorName]);

  const value = useMemo(() => ({
    complaints,
    getComplaintById,
    getRepeatOffenders,
    findRelatedComplaints,
    findCallerHistory,
    attachDocuments,
    assignComplaintNumberOfficer,
    assignAdmissibilityOfficer,
    confirmAdmissibilityCheck,
    assignToDepartment,
    processComplaintNumberAssignment,
    submitAdmissibilityDecision,
    reassignToStateOffice,
    returnFromStateOffice,
    directorReviewDepartment,
    assignSupervisor,
    assignInvestigator,
    logInvestigationActivity,
    updateInvestigationFinding,
    submitInvestigationFindings,
    supervisorReview,
    directorFinalReview,
    escalateToExecutiveSecretary,
    resolveEscalation,
    sendToCouncil,
    recordCouncilVerdict,
    councilReopenOrClose,
    createComplaint,
    currentUser: user || { name: 'Unknown', email: null },
  }), [
    complaints, getComplaintById, getRepeatOffenders, findRelatedComplaints, findCallerHistory, attachDocuments,
    assignComplaintNumberOfficer, assignAdmissibilityOfficer, confirmAdmissibilityCheck, assignToDepartment,
    processComplaintNumberAssignment, submitAdmissibilityDecision, reassignToStateOffice, returnFromStateOffice,
    directorReviewDepartment, assignSupervisor, assignInvestigator, logInvestigationActivity,
    updateInvestigationFinding, submitInvestigationFindings, supervisorReview, directorFinalReview,
    escalateToExecutiveSecretary, resolveEscalation, sendToCouncil, recordCouncilVerdict, councilReopenOrClose, createComplaint, user,
  ]);

  return <ComplaintsContext.Provider value={value}>{children}</ComplaintsContext.Provider>;
}

export function useComplaints() {
  const ctx = useContext(ComplaintsContext);
  if (!ctx) throw new Error('useComplaints must be used within a ComplaintsProvider');
  return ctx;
}
