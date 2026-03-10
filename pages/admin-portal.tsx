import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { StyledForm } from '../components/StyledForm';
import AsyncStateNotice from '../components/AsyncStateNotice';
import { getBackendApiUrl } from '../lib/backendApi';

const sidebarItems = [
  { label: 'Pen Testing', href: '/pen-testing' },
  { label: 'Cyber Security', href: '/cyber-security' },
  { label: 'IT', href: '/it-certified' },
  { label: 'Networking', href: '/networking-certified' },
  { label: 'Full Stack Web', href: '/full-stack-web' },
  { label: 'Internship', href: '/internship' },
  { label: 'Interns Portal', href: '/interns-portal' },
  { label: 'Home', href: '/' }
];

export default function AdminPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
      {/* Sidebar */}
      <aside style={{
        minWidth: '160px', maxWidth: '200px', width: '180px', background: 'linear-gradient(180deg, #183d5c 0%, #0a1a2f 100%)', color: '#fff', padding: '0 0.5rem 0.3rem 0.5rem', boxShadow: '2px 0 24px #0ff8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', borderTopRightRadius: '18px', borderBottomRightRadius: '18px', height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 20, overflowY: 'auto', direction: 'rtl', textAlign: 'left'
      }}>
        <div style={{ background: 'rgba(10,26,47,0.95)', borderRadius: '16px', padding: '1.5rem 1rem', marginBottom: '2rem', width: '100%', textAlign: 'center', boxShadow: '0 0 12px #0ff8', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '2px' }}>GALAXY GUARD OHIO</div>
        <div style={{ direction: 'ltr', width: '100%' }}>
          {sidebarItems.map(item => (
            <Link
              key={item.label}
              href={item.href}
              style={{ background: 'rgba(20,40,80,0.85)', color: '#7ecfff', textDecoration: 'none', fontWeight: 600, fontSize: '1.15rem', padding: '1rem 0', borderRadius: '10px', boxShadow: '0 0 6px #0ff4', marginBottom: '1rem', width: '90%', textAlign: 'center', transition: 'background 0.2s, color 0.2s', display: 'block', border: '2px solid #1a2747' }}
              onMouseOver={e => { e.currentTarget.style.background = '#0a1a2f'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(20,40,80,0.85)'; e.currentTarget.style.color = '#7ecfff'; }}>

              {item.label}

            </Link>
          ))}
        </div>
      </aside>
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', marginLeft: '180px', overflow: 'visible', position: 'relative', zIndex: 2, background: 'rgba(10,26,47,0.85)', paddingLeft: '0', paddingRight: '0' }}>
        <main style={{ background: 'radial-gradient(ellipse at center, #0a1a2f 0%, #1a2747 100%)', minHeight: '100vh', color: '#fff', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
          <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem 2rem 1rem', background: 'rgba(10,26,47,0.95)' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#7ecfff', marginBottom: '1.5rem' }}>Admin Portal</h1>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.7', maxWidth: '700px', textAlign: 'center', marginBottom: '1.5rem' }}>
              Secure administrator access for managing users, content, and system settings. Requires elevated privileges.
            </p>

            {/* Error Feedback */}
            {error && (
              <div style={{ width: '100%', maxWidth: '600px', marginBottom: '1rem' }}>
                <AsyncStateNotice 
                  error={error} 
                  retryAction={() => {
                    setError('');
                    setSuccessMessage('');
                  }} 
                />
              </div>
            )}

            {/* Success Feedback */}
            {successMessage && (
              <div
                role="status"
                aria-live="polite"
                style={{
                  width: '100%',
                  maxWidth: '600px',
                  padding: '1.5rem',
                  background: 'rgba(0, 200, 100, 0.15)',
                  border: '2px solid #0c8',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  color: '#0f8',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                ✓ {successMessage}
              </div>
            )}

            {/* Admin Login Form */}
            <div 
              style={{ 
                width: '100%', 
                maxWidth: '600px',
                opacity: loading ? 0.6 : 1,
                pointerEvents: loading ? 'none' : 'auto',
                transition: 'opacity 0.2s',
              }}
              aria-busy={loading}
            >
              <StyledForm
                title={loading ? 'Authenticating...' : 'Admin Portal Login'}
                buttonText={loading ? 'Authenticating...' : 'Login'}
                fields={[
                  { label: 'Email', name: 'email', type: 'email', icon: '✉️', required: true },
                  { label: 'Password', name: 'password', type: 'password', icon: '🔒', required: true },
                ]}
                onSubmit={async (formData) => {
                  setLoading(true);
                  setError('');
                  setSuccessMessage('');

                  try {
                    const res = await fetch(getBackendApiUrl('/api/login'), {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(formData),
                    });
                    
                    const data = await res.json();
                    
                    if (res.ok) {
                      // Verify admin role
                      if (data.role !== 'admin') {
                        setError('Access denied. Administrator privileges required.');
                        setLoading(false);
                        return;
                      }

                      setSuccessMessage('Admin access granted! Loading admin dashboard...');
                      // Store user info in localStorage
                      window.localStorage.setItem('user', JSON.stringify(data));
                      
                      // Redirect after brief delay to show success message
                      setTimeout(() => {
                        router.push('/dashboard');
                      }, 1500);
                    } else {
                      setError(data.error || 'Authentication failed. Please verify your admin credentials.');
                      setLoading(false);
                    }
                  } catch (err) {
                    setError('Unable to connect to the authentication server. Please try again.');
                    setLoading(false);
                  }
                }}
              />
            </div>

            {/* Loading State Indicator */}
            {loading && (
              <div
                role="status"
                aria-live="polite"
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  color: '#7ecfff',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                <span aria-hidden="true">🔐</span> Verifying administrator credentials...
              </div>
            )}

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#aaa', fontSize: '0.95rem' }}>
                <Link 
                  href="/"
                  style={{
                    color: '#7ecfff',
                    fontWeight: 600,
                    textDecoration: 'none',
                    borderBottom: '1px solid transparent',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderBottomColor = '#7ecfff')}
                  onMouseOut={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
                >
                  ← Return to home page
                </Link>
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
