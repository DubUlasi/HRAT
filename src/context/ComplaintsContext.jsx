import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { mockComplaints } from '../data/mockComplaints';
import { departments } from '../data/mockOfficers';
import { STAGE_ORDER, SUB_STATUS } from '../constants/complaintStatus';
import { useAuth } from './AuthContext';

const ComplaintsContext = createContext(null);

// Only Supervisors and Directors (and, for the state-office detour, the State Coordinator) can
// comment on an investigation activity log entry today — kept local (not a general ROLE_LABELS
// export) since nothing else in the app needs a role label at comment-creation time.
const COMMENT_AUTHOR_ROLE_LABELS = {
  'department-supervisor': 'Department Supervisor',
  'department-director': 'Department Director',
  'state-coordinator': 'State Coordinator',
};

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

export const DEFAULT_COMPLAINT_NUMBER_FORMAT = 'NHRC/{YY}/{SEQ}';
const COMPLAINT_NUMBER_FORMAT_KEY = 'hrat-complaint-number-format';
const COMPLAINT_NUMBER_SEQ_KEY = 'hrat-complaint-number-seq';
const COMPLAINT_NUMBER_AUTO_KEY = 'hrat-complaint-number-auto';
const COMPLAINTS_KEY = 'hrat-complaints';

// Persisted like the login session and numbering settings, so complaints created in the app
// (via the wizard, or any other action) survive a page reload instead of resetting to the seed
// data. Falls back to the static seed set the first time the app ever runs in a browser, or if
// the stored value is missing/corrupt. Evidence file `url`s are client-only object URLs (see
// createComplaint below) and don't survive a reload either way — a documented limitation of this
// mock app having no real file backend, not something persisting the complaint record fixes.
function loadComplaints() {
  try {
    const raw = localStorage.getItem(COMPLAINTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore storage failures / corrupt JSON — fall through to the seed data
  }
  return mockComplaints;
}

// Fills a Registry-Head-configured template with the running sequence number and today's year.
// {YYYY}/{YY} = 4/2-digit year, {SEQ} = unpadded sequence, {SEQ2}/{SEQ3}/{SEQ4}/{SEQ5} = zero-padded.
export function formatComplaintNumber(template, seq) {
  const year = String(new Date().getFullYear());
  const seqStr = String(seq);
  return (template || DEFAULT_COMPLAINT_NUMBER_FORMAT)
    .replaceAll('{YYYY}', year)
    .replaceAll('{YY}', year.slice(-2))
    .replaceAll('{SEQ5}', seqStr.padStart(5, '0'))
    .replaceAll('{SEQ4}', seqStr.padStart(4, '0'))
    .replaceAll('{SEQ3}', seqStr.padStart(3, '0'))
    .replaceAll('{SEQ2}', seqStr.padStart(2, '0'))
    .replaceAll('{SEQ}', seqStr);
}

function loadComplaintNumberFormat() {
  try {
    return localStorage.getItem(COMPLAINT_NUMBER_FORMAT_KEY) || DEFAULT_COMPLAINT_NUMBER_FORMAT;
  } catch {
    return DEFAULT_COMPLAINT_NUMBER_FORMAT;
  }
}

// Seeds the persisted sequence counter the first time it's ever read, by scanning the highest
// trailing digit-group among existing complaint numbers — after that, the counter is explicit
// (read/written straight to localStorage) rather than re-derived, so the Head can also fast
// forward/rewind it directly from Settings (mirrors a "next number" field, not an auto-scan).
function seedComplaintNumberSeq(complaints) {
  const highest = complaints.reduce((max, c) => {
    const match = c.complaintNumber && c.complaintNumber.match(/(\d+)$/);
    const num = match ? parseInt(match[1], 10) : 0;
    return Math.max(max, num);
  }, 293);
  return highest + 1;
}

function loadComplaintNumberSeq(complaints) {
  try {
    const raw = localStorage.getItem(COMPLAINT_NUMBER_SEQ_KEY);
    if (raw) return parseInt(raw, 10);
  } catch {
    // ignore storage failures (e.g. private browsing) — fall through to the scanned default
  }
  return seedComplaintNumberSeq(complaints);
}

// Defaults to ON — new complaints get numbered the moment they're submitted, no one assigned to
// process it. Switching this off falls back to the original manual flow (Head assigns a Desk
// Officer, officer processes the number) for every complaint created from then on; complaints
// already numbered — automatically or manually — are unaffected either way.
function loadComplaintNumberAuto() {
  try {
    const raw = localStorage.getItem(COMPLAINT_NUMBER_AUTO_KEY);
    if (raw !== null) return raw === 'true';
  } catch {
    // ignore storage failures (e.g. private browsing) — fall through to the default
  }
  return true;
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

  const [complaints, setComplaints] = useState(loadComplaints);
  const [complaintNumberFormat, setComplaintNumberFormat] = useState(loadComplaintNumberFormat);
  const [complaintNumberSeq, setComplaintNumberSeq] = useState(() => loadComplaintNumberSeq(loadComplaints()));
  const [complaintNumberAuto, setComplaintNumberAuto] = useState(loadComplaintNumberAuto);

  useEffect(() => {
    try {
      localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
    } catch {
      // ignore storage failures (e.g. quota exceeded, private browsing) — complaints still work
      // for the rest of this session, they just won't survive a reload
    }
  }, [complaints]);

  const updateComplaintNumberAuto = useCallback((on) => {
    setComplaintNumberAuto(on);
    try {
      localStorage.setItem(COMPLAINT_NUMBER_AUTO_KEY, String(on));
    } catch {
      // ignore storage failures (e.g. private browsing) — the setting still applies for this session
    }
  }, []);

  const updateComplaintNumberFormat = useCallback((format) => {
    const next = format || DEFAULT_COMPLAINT_NUMBER_FORMAT;
    setComplaintNumberFormat(next);
    try {
      localStorage.setItem(COMPLAINT_NUMBER_FORMAT_KEY, next);
    } catch {
      // ignore storage failures (e.g. private browsing) — the format still applies for this session
    }
  }, []);

  const updateComplaintNumberSeq = useCallback((seq) => {
    const next = Math.max(1, parseInt(seq, 10) || 1);
    setComplaintNumberSeq(next);
    try {
      localStorage.setItem(COMPLAINT_NUMBER_SEQ_KEY, String(next));
    } catch {
      // ignore storage failures (e.g. private browsing) — the counter still applies for this session
    }
  }, []);

  // Auto-assignment isn't just for complaints created going forward — any complaint that
  // hasn't reached the numbering stage yet (still SUB_STATUS.NEW, no number) should be swept
  // into the automatic flow the moment the toggle is on, whether it's a seed complaint that
  // predates this feature or one left unnumbered from a stretch when the toggle was off.
  // Complaints that already have a number are untouched either way — only the not-yet-numbered
  // ones move. Also sweeps unnumbered complaints sitting in the state-office detour
  // (SENT_TO_STATE_OFFICE) — numbering there is orthogonal to the detour itself, so this only
  // stamps the number and leaves subStatus/stageIndex untouched (unlike the NEW case, which also
  // advances the complaint into COMPLAINT_NUMBER_ASSIGNMENT). Re-runs whenever the toggle flips
  // on or the complaint list changes; once nothing matches, the functional update returns the
  // same array reference and React skips the render.
  useEffect(() => {
    if (!complaintNumberAuto) return;
    setComplaints((prev) => {
      const pending = prev.filter((c) => !c.complaintNumber && (c.subStatus === SUB_STATUS.NEW || c.subStatus === SUB_STATUS.SENT_TO_STATE_OFFICE));
      if (pending.length === 0) return prev;
      let seq = complaintNumberSeq;
      const next = prev.map((c) => {
        if (c.complaintNumber) return c;
        if (c.subStatus === SUB_STATUS.NEW) {
          const complaintNumber = formatComplaintNumber(complaintNumberFormat, seq);
          seq += 1;
          let updated = {
            ...c,
            complaintNumber,
            subStatus: SUB_STATUS.COMPLAINT_NUMBER_ASSIGNMENT,
            stageIndex: STAGE_ORDER.indexOf('case_created'),
          };
          updated = pushActivity(updated, `Complaint number ${complaintNumber} assigned automatically`, 'System');
          return updated;
        }
        if (c.subStatus === SUB_STATUS.SENT_TO_STATE_OFFICE) {
          const complaintNumber = formatComplaintNumber(complaintNumberFormat, seq);
          seq += 1;
          let updated = { ...c, complaintNumber };
          updated = pushActivity(updated, `Complaint number ${complaintNumber} assigned automatically`, 'System');
          return updated;
        }
        return c;
      });
      updateComplaintNumberSeq(seq);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaintNumberAuto, complaints]);

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

  // A lightweight "mark this for attention" utility, independent of the formal pipeline (unlike
  // escalateToExecutiveSecretary, which routes to a specific role) — available to whoever already
  // has access to the complaint, not gated further, since flagging one case you can already see
  // doesn't reveal anything about any other case.
  const toggleComplaintFlag = useCallback((id, { flagged, reason }) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        flagged,
        flagReason: flagged ? (reason || null) : null,
        flaggedBy: flagged ? actorName : null,
        flaggedAt: flagged ? nowIso() : null,
      };
      next = pushActivity(next, flagged ? `Flagged for attention${reason ? `, "${reason}"` : ''}` : 'Flag removed', actorName);
      return next;
    });
  }, [updateComplaint, actorName]);

  // A complainant withdrawing their own case — `stageIndex` is deliberately left untouched
  // (WITHDRAWN is carried entirely by subStatus, same as CLOSED/INADMISSIBLE) rather than jumped
  // to a fixed stage, since a complaint can be withdrawn from any point in the pipeline and
  // forcing it to e.g. "Governing Council" would misrepresent how far it actually got.
  const withdrawComplaint = useCallback((id, reason) => {
    updateComplaint(id, (c) => pushActivity(
      { ...c, subStatus: SUB_STATUS.WITHDRAWN },
      `Complaint withdrawn by complainant${reason ? `: ${reason}` : ''}`,
      actorName
    ));
  }, [updateComplaint, actorName]);

  // Fills in a violator that was filed as "Unidentified" once staff actually learn who they
  // are — available to whoever already has access to the complaint, same spirit as flagging.
  // Replaces the sentinel name/`unidentified` flag rather than adding a parallel field, so
  // every downstream reader of `allegedViolator` (tables, cards, repeat-violator matching) picks
  // up the real identity automatically with no special-casing needed on their part.
  const identifyViolator = useCallback((id, { firstName, lastName, gender, phone, email, address }) => {
    updateComplaint(id, (c) => {
      const name = `${firstName} ${lastName}`.trim();
      let next = {
        ...c,
        allegedViolator: {
          ...c.allegedViolator,
          name,
          gender: gender || null,
          phone: phone || null,
          email: email || null,
          address: address || null,
          unidentified: false,
        },
      };
      next = pushActivity(next, `Identified the alleged violator as "${name}"`, actorName);
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
    const complaintNumber = formatComplaintNumber(complaintNumberFormat, complaintNumberSeq);
    setComplaints((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      let next = { ...c, complaintNumber };
      next = pushActivity(next, `Complaint number ${complaintNumber} assigned`, actorName);
      return next;
    }));
    updateComplaintNumberSeq(complaintNumberSeq + 1);
  }, [actorName, complaintNumberFormat, complaintNumberSeq, updateComplaintNumberSeq]);

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
  // Mirrors the Department Director → Supervisor → Investigator chain, just scoped to an office
  // instead of a department: Registry Head sends a NEW complaint to a state office (below), the
  // State Coordinator there assigns one State Personnel officer (assignStatePersonnel), that
  // officer does the local review and submits (submitStateFindings), the Coordinator reviews it
  // (stateCoordinatorReview) — satisfied resumes the normal head-office flow via
  // returnFromStateOffice, not satisfied bounces it back to the same officer for more work. The
  // complaint's subStatus stays SENT_TO_STATE_OFFICE for the whole detour; which of these
  // sub-steps it's actually on is read off the `stateOffice` fields themselves, not a status.

  const reassignToStateOffice = useCallback((id, { officeId, remark }) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        subStatus: SUB_STATUS.SENT_TO_STATE_OFFICE,
        stateOffice: {
          sentTo: officeId, sentAt: nowIso(), remark: remark || null,
          assignedPersonnelId: null, assignedPersonnelName: null, assignmentRemark: null, assignedAt: null,
          submittedAt: null, findingSummary: null, reviewRemark: null, returnedAt: null,
        },
      };
      next = pushActivity(next, `Reassigned to state office${remark ? `, "${remark}"` : ''}`, actorName);
      return next;
    });
  }, [updateComplaint, actorName]);

  // Resumes the normal head-office flow exactly where it left off — called by
  // stateCoordinatorReview once the Coordinator is satisfied with the state personnel's work,
  // not directly by the UI.
  const returnFromStateOffice = useCallback((id, remark) => {
    updateComplaint(id, (c) => {
      let next = {
        ...c,
        subStatus: SUB_STATUS.NEW,
        stateOffice: { ...c.stateOffice, returnedAt: nowIso(), reviewRemark: remark || null },
      };
      next = pushActivity(next, `Returned from state office to head office${remark ? `, "${remark}"` : ''}`, actorName);
      return next;
    });
  }, [updateComplaint, actorName]);

  // State Coordinator assigns a specific State Personnel officer at their own office — the
  // state-level analog of assignInvestigator.
  const assignStatePersonnel = useCallback((id, { personId, personName, remark }) => {
    updateComplaint(id, (c) => pushActivity(
      { ...c, stateOffice: { ...c.stateOffice, assignedPersonnelId: personId, assignedPersonnelName: personName, assignmentRemark: remark || null, assignedAt: nowIso() } },
      `Assigned to state personnel officer, ${personName}${remark ? `, "${remark}"` : ''}`,
      actorName
    ));
  }, [updateComplaint, actorName]);

  // State Personnel submits their local findings once done — the state-level analog of
  // submitInvestigationFindings, puts the case in front of the coordinator for review.
  const submitStateFindings = useCallback((id, { findingSummary }) => {
    updateComplaint(id, (c) => pushActivity(
      { ...c, stateOffice: { ...c.stateOffice, submittedAt: nowIso(), findingSummary: findingSummary || null } },
      'State personnel findings submitted for coordinator review',
      actorName
    ));
  }, [updateComplaint, actorName]);

  // State Coordinator reviews the personnel's submitted findings — the state-level analog of
  // supervisorReview. Satisfied sends it back to head office for real, not satisfied bounces it
  // back to the same personnel officer (findings cleared, assignment kept) for more work.
  const stateCoordinatorReview = useCallback((id, { satisfied, remark }) => {
    if (satisfied) {
      returnFromStateOffice(id, remark);
      return;
    }
    updateComplaint(id, (c) => pushActivity(
      { ...c, stateOffice: { ...c.stateOffice, submittedAt: null, findingSummary: null, reviewRemark: remark || null } },
      `Sent back to state personnel officer for more work${remark ? `, "${remark}"` : ''}`,
      actorName
    ));
  }, [updateComplaint, actorName, returnFromStateOffice]);

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
      next = pushActivity(next, `Complaint assigned to an investigation officer${remark ? `, "${remark}"` : ''}`, actorName);
      return next;
    });
  }, [updateComplaint, actorName]);

  // ── Department Investigator ──

  const logInvestigationActivity = useCallback((id, { type, withParty, happenedOn, summary, files }) => {
    updateComplaint(id, (c) => {
      const activities = c.investigation.activities || [];
      // Any files attached alongside this call/meeting/note need to land in three places: the
      // complaint's own `documents` (so they still show in Documents & Resources like every
      // other attachment), the general activity log (via pushActivity's `documents` extra, same
      // as attachDocuments), AND on this specific activity entry — that last one is what lets
      // the Investigation Activities list show which file belongs to which logged activity,
      // instead of the file only ever surfacing in the unrelated general documents list.
      const newDocs = (files || []).map((file) => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        stage: 'Investigation Activity Log',
        uploadedBy: actorName,
        uploadedAt: nowIso(),
      }));
      const docRefs = newDocs.map((doc) => ({ id: doc.id, name: doc.name, url: doc.url, size: doc.size }));
      // `happenedOn` is when the call/meeting/note actually took place (investigator-supplied,
      // date-only); `loggedAt` is when it was entered into the system — kept separate so writing
      // something up a few days late doesn't misrepresent when it actually happened.
      const entry = { id: `${id}-act-${activities.length}-${Date.now()}`, type, withParty, summary, happenedOn: happenedOn || null, loggedAt: nowIso(), documents: docRefs, comments: [] };
      let next = {
        ...c,
        subStatus: c.subStatus === SUB_STATUS.ASSIGNED_TO_INVESTIGATOR ? SUB_STATUS.INVESTIGATING : c.subStatus,
        // Gated the same way as subStatus above — a state-office complaint logging an activity
        // here should keep its stageIndex untouched (it stays -1 throughout that whole detour),
        // not get pulled onto the main pipeline's "Under Investigation" stage.
        stageIndex: c.subStatus === SUB_STATUS.ASSIGNED_TO_INVESTIGATOR ? STAGE_ORDER.indexOf('under_investigation') : c.stageIndex,
        documents: [...(c.documents || []), ...newDocs],
        investigation: { ...c.investigation, activities: [...activities, entry] },
      };
      next = pushActivity(next, `Logged a ${type} with ${withParty}: "${summary}"`, actorName, { documents: docRefs });
      return next;
    });
  }, [updateComplaint, actorName]);

  // Lets an investigation officer correct a log entry they made — any newly attached files here
  // are appended to the entry's existing documents rather than replacing them, since removing an
  // already-committed attachment isn't something this action offers.
  const updateInvestigationActivity = useCallback((id, activityId, { type, withParty, happenedOn, summary, files }) => {
    updateComplaint(id, (c) => {
      const activities = c.investigation.activities || [];
      const newDocs = (files || []).map((file) => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        stage: 'Investigation Activity Log',
        uploadedBy: actorName,
        uploadedAt: nowIso(),
      }));
      const docRefs = newDocs.map((doc) => ({ id: doc.id, name: doc.name, url: doc.url, size: doc.size }));
      const updatedActivities = activities.map((entry) => (
        entry.id === activityId
          ? { ...entry, type, withParty, summary, happenedOn: happenedOn || null, documents: [...(entry.documents || []), ...docRefs] }
          : entry
      ));
      let next = {
        ...c,
        documents: [...(c.documents || []), ...newDocs],
        investigation: { ...c.investigation, activities: updatedActivities },
      };
      next = pushActivity(next, `Edited a logged ${type} with ${withParty}`, actorName);
      return next;
    });
  }, [updateComplaint, actorName]);

  // Lets a Supervisor or Director (whoever the UI offers this to) leave feedback on a specific
  // investigation activity entry without touching the entry itself — purely additive, the
  // investigation officer sees it read-only alongside their own log. Role/department are
  // resolved and stamped onto the comment at creation time (rather than looked up wherever it's
  // displayed) so the comment always reflects who the commenter WAS at the time, even if their
  // assignment changes later.
  const addActivityComment = useCallback((id, activityId, text) => {
    updateComplaint(id, (c) => {
      const activities = c.investigation.activities || [];
      const target = activities.find((entry) => entry.id === activityId);
      const comment = {
        id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        authorName: actorName,
        authorId: actorOfficerId,
        authorRole: COMMENT_AUTHOR_ROLE_LABELS[user?.role] || null,
        authorDepartment: departments.find((d) => d.id === user?.departmentId)?.name || null,
        createdAt: nowIso(),
      };
      const updatedActivities = activities.map((entry) => (
        entry.id === activityId ? { ...entry, comments: [...(entry.comments || []), comment] } : entry
      ));
      let next = { ...c, investigation: { ...c.investigation, activities: updatedActivities } };
      next = pushActivity(next, `Commented on a logged ${target?.type || 'activity'} entry`, actorName);
      return next;
    });
  }, [updateComplaint, actorName, actorOfficerId, user]);

  // Editing (not adding) a comment is only offered while the case is still moving through the
  // Investigation Officer/Supervisor loop — once the Supervisor forwards it to the Director, or
  // the Director sends it back to the Registry, the comment is treated as part of the record
  // that was actually reviewed at that point and can no longer be quietly changed.
  const updateActivityComment = useCallback((id, activityId, commentId, text) => {
    updateComplaint(id, (c) => {
      const activities = c.investigation.activities || [];
      const updatedActivities = activities.map((entry) => {
        if (entry.id !== activityId) return entry;
        const comments = (entry.comments || []).map((comment) => (
          comment.id === commentId ? { ...comment, text, editedAt: nowIso() } : comment
        ));
        return { ...entry, comments };
      });
      return { ...c, investigation: { ...c.investigation, activities: updatedActivities } };
    });
  }, [updateComplaint]);

  const updateInvestigationFinding = useCallback((id, { finding, recommendation, files }) => {
    updateComplaint(id, (c) => {
      // Same reasoning as logInvestigationActivity's file handling: a file attached here needs to
      // land on the finding itself (so it shows in the Findings & Recommendation card, not just
      // the unrelated general Documents & Resources list) as well as in that general list.
      const newDocs = (files || []).map((file) => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        stage: 'Investigation Findings',
        uploadedBy: actorName,
        uploadedAt: nowIso(),
      }));
      const docRefs = newDocs.map((doc) => ({ id: doc.id, name: doc.name, url: doc.url, size: doc.size }));
      let next = {
        ...c,
        documents: [...(c.documents || []), ...newDocs],
        investigation: {
          ...c.investigation,
          finding: finding ?? c.investigation.finding,
          recommendation: recommendation ?? c.investigation.recommendation,
          findingDocuments: [...(c.investigation.findingDocuments || []), ...docRefs],
        },
      };
      next = pushActivity(next, 'Updated investigation findings', actorName, docRefs.length ? { documents: docRefs } : undefined);
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
          : `Supervisor sent back to investigation officer${remark ? `, "${remark}"` : ''}`,
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

  const createComplaint = useCallback(({ subject, category, description, victim, allegedViolator, additionalVictims, additionalViolators, filedBy, office, voiceRecordingUrl, evidenceFiles }) => {
    const id = `c-${Date.now()}`;
    // `scope` is about how many victims/violators are on the complaint; `filedBy` is a separate
    // question of who is doing the filing (an individual vs. a group/committee) — a committee can
    // file about a single victim, and one person can file about several, so these don't imply
    // each other.
    const scope = (additionalVictims?.length || 0) > 0 || (additionalViolators?.length || 0) > 0 ? 'group' : 'single';
    // With auto-assignment on, the number is stamped immediately and no one is ever assigned to
    // process it — the complaint lands exactly where one used to sit right after that manual step
    // completed, so the Head's "assign an admissibility officer" queue, StageTracker, etc. all
    // pick it up correctly with no changes on their end. With it off, this falls back to the
    // original NEW/unnumbered state so the manual assign-a-Desk-Officer flow still applies.
    const autoNumber = complaintNumberAuto;
    const complaintNumber = autoNumber ? formatComplaintNumber(complaintNumberFormat, complaintNumberSeq) : null;
    // Selecting a state office (anything but head office) at filing time routes the complaint
    // straight into the state-office detour instead of the head-office pipeline — the state
    // office is theirs from day one, not something Registry Head has to manually hand off via
    // reassignToStateOffice. Numbering is orthogonal to routing: it still happens immediately
    // when auto-numbering is on regardless of which office it's headed to; when it's off, a
    // State Personnel officer processes the number themselves once assigned (see
    // needsNumberProcessing/processComplaintNumberAssignment), the exact same two-step pattern
    // the Desk Officer already uses at head office.
    const isStateOfficeRouted = !!office && office !== 'hq';
    let complaint = {
      id,
      subject,
      complaintNumber,
      category,
      scope,
      filedBy: filedBy || { type: 'individual' },
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
      subStatus: isStateOfficeRouted
        ? SUB_STATUS.SENT_TO_STATE_OFFICE
        : (autoNumber ? SUB_STATUS.COMPLAINT_NUMBER_ASSIGNMENT : SUB_STATUS.NEW),
      stageIndex: autoNumber ? STAGE_ORDER.indexOf('case_created') : -1,
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
      stateOffice: isStateOfficeRouted
        ? {
            sentTo: office, sentAt: nowIso(), remark: 'Filed directly for this office.',
            assignedPersonnelId: null, assignedPersonnelName: null, assignmentRemark: null, assignedAt: null,
            submittedAt: null, findingSummary: null, reviewRemark: null, returnedAt: null,
          }
        : {
            sentTo: null, sentAt: null, remark: null,
            assignedPersonnelId: null, assignedPersonnelName: null, assignmentRemark: null, assignedAt: null,
            submittedAt: null, findingSummary: null, reviewRemark: null, returnedAt: null,
          },
      council: { verdict: null, recommendation: null, decidedBy: null, decidedAt: null },
      flagged: false,
      flagReason: null,
      flaggedBy: null,
      flaggedAt: null,
      activityLog: [],
    };
    complaint = pushActivity(complaint, 'Complaint submitted', actorName);
    if (isStateOfficeRouted) {
      complaint = pushActivity(complaint, 'Filed directly to state office', actorName);
    }
    if (autoNumber) {
      complaint = pushActivity(complaint, `Complaint number ${complaintNumber} assigned automatically`, 'System');
    }
    setComplaints((prev) => [complaint, ...prev]);
    if (autoNumber) {
      updateComplaintNumberSeq(complaintNumberSeq + 1);
    }
    return id;
  }, [actorName, complaintNumberAuto, complaintNumberFormat, complaintNumberSeq, updateComplaintNumberSeq]);

  const value = useMemo(() => ({
    complaints,
    getComplaintById,
    getRepeatOffenders,
    findRelatedComplaints,
    findCallerHistory,
    attachDocuments,
    toggleComplaintFlag,
    withdrawComplaint,
    identifyViolator,
    assignComplaintNumberOfficer,
    assignAdmissibilityOfficer,
    confirmAdmissibilityCheck,
    assignToDepartment,
    processComplaintNumberAssignment,
    submitAdmissibilityDecision,
    reassignToStateOffice,
    returnFromStateOffice,
    assignStatePersonnel,
    submitStateFindings,
    stateCoordinatorReview,
    directorReviewDepartment,
    assignSupervisor,
    assignInvestigator,
    logInvestigationActivity,
    updateInvestigationActivity,
    addActivityComment,
    updateActivityComment,
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
    complaintNumberFormat,
    updateComplaintNumberFormat,
    complaintNumberSeq,
    updateComplaintNumberSeq,
    complaintNumberAuto,
    updateComplaintNumberAuto,
    currentUser: user || { name: 'Unknown', email: null },
  }), [
    complaints, getComplaintById, getRepeatOffenders, findRelatedComplaints, findCallerHistory, attachDocuments,
    toggleComplaintFlag, withdrawComplaint, identifyViolator,
    assignComplaintNumberOfficer, assignAdmissibilityOfficer, confirmAdmissibilityCheck, assignToDepartment,
    processComplaintNumberAssignment, submitAdmissibilityDecision, reassignToStateOffice, returnFromStateOffice,
    assignStatePersonnel, submitStateFindings, stateCoordinatorReview,
    directorReviewDepartment, assignSupervisor, assignInvestigator, logInvestigationActivity, updateInvestigationActivity,
    addActivityComment, updateActivityComment, updateInvestigationFinding, submitInvestigationFindings, supervisorReview, directorFinalReview,
    escalateToExecutiveSecretary, resolveEscalation, sendToCouncil, recordCouncilVerdict, councilReopenOrClose, createComplaint,
    complaintNumberFormat, updateComplaintNumberFormat, complaintNumberSeq, updateComplaintNumberSeq,
    complaintNumberAuto, updateComplaintNumberAuto, user,
  ]);

  return <ComplaintsContext.Provider value={value}>{children}</ComplaintsContext.Provider>;
}

export function useComplaints() {
  const ctx = useContext(ComplaintsContext);
  if (!ctx) throw new Error('useComplaints must be used within a ComplaintsProvider');
  return ctx;
}
