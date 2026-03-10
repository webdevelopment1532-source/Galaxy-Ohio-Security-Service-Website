import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AsyncStateNotice from '../components/AsyncStateNotice';
import { getBackendApiUrl } from '../lib/backendApi';

interface Enrollment {
  id: number;
  program_name: string;
  status: string;
  enrolled_date: string;
  completion_date?: string;
}

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

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEnrollments = async () => {
    setLoading(true);
    setError('');

    try {
      // Get user from localStorage to fetch their enrollments
      const userStr = window.localStorage.getItem('user');
      if (!userStr) {
        setError('Please log in to view your enrollments.');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      
      const res = await fetch(getBackendApiUrl(`/api/enrollments?userId=${encodeURIComponent(String(user.id))}`), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        setEnrollments(Array.isArray(data) ? data : data.enrollments || []);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to load enrollments.');
      }
    } catch (err) {
      setError('Unable to connect to the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'enrolled':
        return '#0c8';
      case 'completed':
        return '#7ecfff';
      case 'pending':
        return '#fc0';
      case 'inactive':
      case 'dropped':
        return '#c33';
      default:
        return '#aaa';
    }
  };
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
          <section style={{ padding: '4rem 2rem 2rem 2rem', background: 'rgba(10,26,47,0.95)', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#7ecfff', marginBottom: '1.5rem', textAlign: 'center' }}>
                Enrollments
              </h1>
              <p style={{ fontSize: '1.2rem', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto 2rem auto', textAlign: 'center', color: '#ccc' }}>
                View and manage your enrollments for programs and certifications.
              </p>

              {/* Enrollment Data with AsyncStateNotice */}
              <AsyncStateNotice
                loading={loading}
                error={error}
                empty={enrollments.length === 0 && !loading && !error}
                emptyMessage="You have no enrollments yet. Explore our programs to get started!"
                loadingMessage="Loading your enrollments..."
                retryAction={loadEnrollments}
              >
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      style={{
                        background: 'rgba(20,40,80,0.85)',
                        border: '2px solid #7ecfff',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 0 12px rgba(0,255,255,0.2)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,255,255,0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 0 12px rgba(0,255,255,0.2)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7ecfff', margin: 0 }}>
                          {enrollment.program_name}
                        </h2>
                        <span
                          style={{
                            padding: '0.4rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            background: getStatusColor(enrollment.status) + '22',
                            color: getStatusColor(enrollment.status),
                            border: `2px solid ${getStatusColor(enrollment.status)}`,
                          }}
                        >
                          {enrollment.status}
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', color: '#ccc' }}>
                        <div>
                          <strong style={{ color: '#7ecfff', fontSize: '0.9rem' }}>Enrolled:</strong>
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>
                            {new Date(enrollment.enrolled_date).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {enrollment.completion_date && (
                          <div>
                            <strong style={{ color: '#7ecfff', fontSize: '0.9rem' }}>Completed:</strong>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>
                              {new Date(enrollment.completion_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </AsyncStateNotice>

              {/* Action Links */}
              <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <Link
                  href="/"
                  style={{
                    display: 'inline-block',
                    padding: '0.75rem 2rem',
                    background: 'rgba(20,40,80,0.85)',
                    color: '#7ecfff',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    borderRadius: '8px',
                    border: '2px solid #7ecfff',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#0a1a2f';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(20,40,80,0.85)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  ← Explore Programs
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
