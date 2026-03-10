import React from 'react';

const TEAM_MEMBER_FALLBACK_IMAGE = '/Galaxy-Guard-main-website-image.png';

interface TeamMemberProps {
  name: string;
  role: string;
  image: string;
}

export default function TeamMember({ name, role, image }: TeamMemberProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      <img
        src={image}
        alt={name}
        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%', marginBottom: '0.5rem' }}
        onError={(event) => {
          const target = event.currentTarget;
          if (target.src.endsWith(TEAM_MEMBER_FALLBACK_IMAGE)) {
            return;
          }
          target.src = TEAM_MEMBER_FALLBACK_IMAGE;
        }}
      />
      <div><strong>{name}</strong></div>
      <div>{role}</div>
    </div>
  );
}
