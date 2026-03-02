import React from 'react';

interface CallToActionProps {
  href: string;
  label: string;
  style?: React.CSSProperties;
}

export default function CallToAction({ href, label, style }: CallToActionProps) {
  return (
    <a href={href} style={{ background: '#ffe600', color: '#183d5c', fontWeight: 700, borderRadius: '8px', padding: '1rem 2rem', boxShadow: '0 0 8px #fff8', textDecoration: 'none', fontSize: '1.2rem', display: 'inline-block', transition: 'background 0.2s', ...style }}>
      {label}
    </a>
  );
}
