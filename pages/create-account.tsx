import React from 'react';
import Link from 'next/link';
import { StyledForm } from '../components/StyledForm';
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

export default function CreateAccount() {

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
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#7ecfff', marginBottom: '1.5rem' }}>Create Account</h1>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.7', maxWidth: '700px' }}>
              Fill out the form below to create your account.
            </p>
            <StyledForm
              title="Create Account"
              buttonText="Sign Up"
              fields={[
                { label: 'Full Name', name: 'name', type: 'text', icon: '👤', required: true, autocomplete: 'name' },
                { label: 'Email', name: 'email', type: 'email', icon: '✉️', required: true, autocomplete: 'email' },
                { label: 'Password', name: 'password', type: 'password', icon: '🔒', required: true, autocomplete: 'current-password' },
                {
                  label: 'Role',
                  name: 'role',
                  type: 'select',
                  required: true,
                  autocomplete: 'organization-title',
                  options: [
                    { label: 'Customer (default)', value: 'customer' },
                    { label: 'Company Owner', value: 'owner' },
                    { label: 'Manager', value: 'manager' },
                    { label: 'Employee', value: 'employee' },
                    { label: 'Intern', value: 'intern' }
                  ]
                }
              ]}
              onSubmit={async (formData, event) => {
                event?.preventDefault();
                event?.stopPropagation();
                if (!formData.name || !formData.email || !formData.password || !formData.role) {
                  alert('Please fill out all fields.');
                  return;
                }
                try {
                  const payload = {
                    full_name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                  };
                  const res = await fetch(getBackendApiUrl('/api/register'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    alert('Account created successfully!');
                  } else {
                    alert(data.error || 'Registration failed.');
                  }
                } catch {
                  alert('Server error.');
                }
              }}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
