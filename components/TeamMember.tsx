import React from 'react';

interface TeamMemberProps {
  name: string;
  role: string;
  image: string;
}

export default function TeamMember({ name, role, image }: TeamMemberProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      <img src={image} alt={name} style={{ width: '80px', borderRadius: '50%', marginBottom: '0.5rem' }} />
      <div><strong>{name}</strong></div>
      <div>{role}</div>
    </div>
  );
}
