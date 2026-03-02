import React from 'react';

interface ServiceHighlightProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg?: string;
}

export default function ServiceHighlight({ icon, title, description, iconBg }: ServiceHighlightProps) {
  return (
    <div style={{
      background: '#f7fafc',
      borderRadius: '20px',
      padding: '2rem 1.5rem',
      minWidth: '220px',
      color: '#2d3a4a',
      boxShadow: '0 4px 24px #7ecfff33, 0 0 0 4px #fff6',
      textAlign: 'center',
      border: '2px solid #e0f7fa',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      outline: 'none',
      marginBottom: '1rem',
      filter: 'drop-shadow(0 0 8px #7ecfff33)'
    }}
    tabIndex={0}
    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{
        fontSize: '2.7rem',
        background: iconBg || 'linear-gradient(135deg, #fffbe6 60%, #e0f7fa 100%)',
        borderRadius: '50%',
        padding: '1.1rem',
        boxShadow: '0 4px 24px #ffe60033, 0 0 0 4px #fff6',
        color: '#2d3a4a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '3px solid #e0f7fa',
        margin: '0 auto 1rem auto',
        width: '4.5rem',
        height: '4.5rem',
        transition: 'box-shadow 0.2s',
      }}>{icon}</div>
      <h4 style={{ fontWeight: 700, fontSize: '1.2rem', margin: '0.5rem 0 0.7rem 0', color: '#183d5c' }}>{title}</h4>
      <p style={{ fontSize: '1.05rem', color: '#2d3a4a', whiteSpace: 'pre-line', margin: 0 }}>{description}</p>
    </div>
  );
}
