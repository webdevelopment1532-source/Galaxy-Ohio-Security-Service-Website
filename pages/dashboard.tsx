import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AsyncStateNotice from '../components/AsyncStateNotice';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUserData = () => {
    setLoading(true);
    setError('');
    
    // Try to get user info from localStorage first
    const stored = window.localStorage.getItem('user');
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        setLoading(false);
        return;
      } catch {
        // fallback to API
      }
    }
    
    // Fallback: fetch user info from API (if available)
    let email = '';
    if (stored) {
      try {
        email = JSON.parse(stored).email;
      } catch {}
    }
    
    if (email) {
      fetch(`/api/me?email=${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          setUser(data);
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load user info. Please try again.');
          setLoading(false);
        });
    } else {
      setError('No user info found. Please log in.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const renderDashboardContent = () => {
    if (!user) return null;

    // Role-specific dashboard content
    const roleSpecificContent: Record<string, { title: string; subtitle: string }> = {
      admin: {
        title: 'Admin Dashboard',
        subtitle: `Welcome, ${user.full_name} (Admin)`,
      },
      owner: {
        title: 'Company Owner Dashboard',
        subtitle: `Welcome, ${user.full_name} (Owner)`,
      },
      manager: {
        title: 'Manager Dashboard',
        subtitle: `Welcome, ${user.full_name} (Manager)`,
      },
      employee: {
        title: 'Employee Dashboard',
        subtitle: `Welcome, ${user.full_name} (Employee)`,
      },
      intern: {
        title: 'Intern Dashboard',
        subtitle: `Welcome, ${user.full_name} (Intern)`,
      },
    };

    const content = roleSpecificContent[user.role] || {
      title: `Welcome, ${user.full_name}!`,
      subtitle: null,
    };

    return (
      <div style={{ padding: '2rem', maxWidth: 700, margin: '0 auto' }}>
        <h1 style={{ color: '#7ecfff', fontWeight: 800, fontSize: '2.2rem', marginBottom: '1.2rem' }}>
          {content.title}
        </h1>
        {content.subtitle && <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#d9e6f2' }}>{content.subtitle}</p>}
        
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(20,40,80,0.55)', borderRadius: '8px', color: '#f4fbff' }}>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Status:</strong> {user.status}</p>
          <p><strong>Role:</strong> {user.role}</p>
          {user.created_at && <p><strong>Joined:</strong> {user.created_at}</p>}
        </div>
        
        <Link 
          href="/" 
          style={{ 
            color: '#f4fbff', 
            fontWeight: 600, 
            marginTop: '2rem', 
            display: 'inline-block',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            border: '2px solid #f4fbff',
            borderRadius: '6px',
            background: 'rgba(20,40,80,0.6)',
          }}
        >
          ← Back to Home
        </Link>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Dashboard | Galaxy Guard Ohio</title>
      </Head>
      <div style={{ minHeight: '100vh', padding: '2rem', background: 'radial-gradient(circle at top, #183d5c 0%, #0a1a2f 60%, #07111d 100%)', color: '#f4fbff' }}>
      <AsyncStateNotice
        loading={loading}
        error={error}
        empty={!user && !loading && !error}
        emptyMessage="No user data available"
        loadingMessage="Loading your dashboard..."
        retryAction={loadUserData}
      >
        {renderDashboardContent()}
      </AsyncStateNotice>
      </div>
    </>
  );
}
