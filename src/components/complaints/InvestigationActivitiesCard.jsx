import React, { useState } from 'react';
import { Phone, Users, StickyNote, Paperclip, Pencil, MessageSquare, Send } from 'lucide-react';

const ACTIVITY_ICONS = { call: Phone, meeting: Users, note: StickyNote };

// Shared read/write view of an investigation officer's activity log (calls/meetings/notes),
// reused across the Investigation Officer's own detail page (canEdit), the Supervisor's detail
// page, and the Director's final-review detail page (the latter two get canComment) — one place
// so a log entry, its attachments, and any review comments on it look the same everywhere it's
// seen.
//
// `canComment`/`canEditComments` are both driven by canSupervisorCommentOnActivities /
// canDirectorCommentOnActivities in complaintStatus.js — each role's window to add OR edit a
// comment closes once they've handed the case to the next role, and reopens if it bounces back.
// `currentUserId` further restricts editing to only the comment's own author.
export default function InvestigationActivitiesCard({
  activities,
  canEdit,
  onEditEntry,
  canComment,
  onAddComment,
  canEditComments,
  currentUserId,
  onEditComment,
}) {
  const [openCommentId, setOpenCommentId] = useState(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editDraft, setEditDraft] = useState('');

  if (!activities?.length) return null;

  const submitComment = (entry) => {
    const text = commentDraft.trim();
    if (!text) return;
    onAddComment(entry, text);
    setCommentDraft('');
    setOpenCommentId(null);
  };

  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditDraft(comment.text);
  };

  const submitEditComment = (entry, comment) => {
    const text = editDraft.trim();
    if (!text) return;
    onEditComment(entry, comment, text);
    setEditingCommentId(null);
    setEditDraft('');
  };

  return (
    <div className="detail-section-card investigation-activities-card">
      <h3 className="section-card-title">
        <span className="investigation-activities-icon"><Users size={13} /></span>
        Investigation Activities ({activities.length})
      </h3>
      <div className="activity-vertical-timeline">
        {activities.map((entry) => {
          const Icon = ACTIVITY_ICONS[entry.type] || StickyNote;
          return (
            <div key={entry.id} className={`activity-timeline-item type-${entry.type}`}>
              <span className="activity-node-icon"><Icon size={13} /></span>
              <div className="activity-item-content">
                <div className="activity-item-header-row">
                  <div className="activity-item-header">{entry.type.charAt(0).toUpperCase() + entry.type.slice(1)} with {entry.withParty}</div>
                  {canEdit && (
                    <button
                      type="button"
                      className="activity-edit-btn"
                      onClick={() => onEditEntry(entry)}
                      aria-label="Edit this log entry"
                    >
                      <Pencil size={12} />
                    </button>
                  )}
                </div>
                <div className="activity-item-date">{entry.summary}</div>
                <div className="activity-item-date">
                  {entry.happenedOn
                    ? new Date(entry.happenedOn).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                    : new Date(entry.loggedAt).toLocaleString()}
                  {entry.happenedOn && new Date(entry.happenedOn).toDateString() !== new Date(entry.loggedAt).toDateString() && (
                    ` · logged ${new Date(entry.loggedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`
                  )}
                </div>

                {entry.documents?.length > 0 && (
                  <div className="activity-attachment-list">
                    {entry.documents.map((doc) => (
                      <a key={doc.id} href={doc.url} download={doc.name} target="_blank" rel="noreferrer" className="activity-attachment-row">
                        <Paperclip size={12} />
                        <span>{doc.name}</span>
                      </a>
                    ))}
                  </div>
                )}

                {entry.comments?.length > 0 && (
                  <div className="activity-comment-list">
                    {entry.comments.map((comment) => {
                      const canEditThisComment = canEditComments && comment.authorId && comment.authorId === currentUserId;
                      const isEditingThisComment = editingCommentId === comment.id;
                      return (
                        <div key={comment.id} className="activity-comment-row">
                          {isEditingThisComment ? (
                            <>
                              <textarea
                                className="activity-comment-input"
                                value={editDraft}
                                onChange={(e) => setEditDraft(e.target.value)}
                                autoFocus
                              />
                              <div className="activity-comment-form-actions">
                                <button type="button" className="btn-link" onClick={() => { setEditingCommentId(null); setEditDraft(''); }}>
                                  Cancel
                                </button>
                                <button type="button" className="activity-comment-submit-btn" onClick={() => submitEditComment(entry, comment)}>
                                  <Send size={12} /> Save
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="activity-comment-row-top">
                                <span className="activity-comment-author-block">
                                  <span className="activity-comment-author">{comment.authorName}</span>
                                  {(comment.authorRole || comment.authorDepartment) && (
                                    <span className="activity-comment-author-meta">
                                      {[comment.authorRole, comment.authorDepartment].filter(Boolean).join(' · ')}
                                    </span>
                                  )}
                                </span>
                                {canEditThisComment && (
                                  <button
                                    type="button"
                                    className="activity-edit-btn"
                                    onClick={() => startEditComment(comment)}
                                    aria-label="Edit this comment"
                                  >
                                    <Pencil size={11} />
                                  </button>
                                )}
                              </div>
                              <p className="activity-comment-text">{comment.text}</p>
                              <span className="activity-comment-date">
                                {new Date(comment.createdAt).toLocaleString()}
                                {comment.editedAt && ' (edited)'}
                              </span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {canComment && (
                  openCommentId === entry.id ? (
                    <div className="activity-comment-form">
                      <textarea
                        className="activity-comment-input"
                        value={commentDraft}
                        onChange={(e) => setCommentDraft(e.target.value)}
                        placeholder="Add a comment on this log entry..."
                        autoFocus
                      />
                      <div className="activity-comment-form-actions">
                        <button type="button" className="btn-link" onClick={() => { setOpenCommentId(null); setCommentDraft(''); }}>
                          Cancel
                        </button>
                        <button type="button" className="activity-comment-submit-btn" onClick={() => submitComment(entry)}>
                          <Send size={12} /> Comment
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="activity-comment-toggle-btn"
                      onClick={() => { setOpenCommentId(entry.id); setCommentDraft(''); }}
                    >
                      <MessageSquare size={12} /> Comment
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
