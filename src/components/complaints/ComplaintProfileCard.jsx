import React from 'react';
import Avatar from '../ui/Avatar';

export default function ComplaintProfileCard({ roleLabel, person, tagVariant = 'default' }) {
  return (
    <div className="profile-card-block">
      <div className="profile-card-top">
        <Avatar name={person.name} size={40} />
        <div className="profile-card-info">
          <span className="profile-card-name">{person.name}</span>
          <span className={`profile-card-tag tag-${tagVariant}`}>{roleLabel}</span>
        </div>
      </div>
      <dl className="profile-card-fields">
        <div><dt>Gender</dt><dd>{person.gender}</dd></div>
        <div><dt>Phone Number</dt><dd>{person.phone}</dd></div>
        <div><dt>Email</dt><dd>{person.email}</dd></div>
        <div><dt>Age at Incident</dt><dd>{person.ageAtIncident}</dd></div>
        <div><dt>Date of Birth</dt><dd>{person.dob}</dd></div>
        <div><dt>Address</dt><dd>{person.address}</dd></div>
      </dl>
    </div>
  );
}
