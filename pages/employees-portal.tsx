
import React from 'react';
import Link from 'next/link';
import { StyledForm } from '../components/StyledForm';

const sidebarItems = [
  { label: 'Dashboard', href: '/employees-portal', icon: '📊' },
  { label: 'Pen Testing', href: '/pen-testing', icon: '🧪' },
  { label: 'Cyber Security', href: '/cyber-security', icon: '🛡️' },
  { label: 'IT', href: '/it-certified', icon: '💻' },
  { label: 'Networking', href: '/networking-certified', icon: '🌐' },
  { label: 'Full Stack Web', href: '/full-stack-web', icon: '🖥️' },
  { label: 'Internship', href: '/internship', icon: '🎓' },
  { label: 'Interns Portal', href: '/interns-portal', icon: '👥' },
  { label: 'Home', href: '/', icon: '🏠' }
];

export default function EmployeesPortal() {
              // Live server state
              const [serverStats, setServerStats] = React.useState<any>(null);
              const [serverLoading, setServerLoading] = React.useState(false);
              const fetchServerStats = async () => {
                setServerLoading(true);
                try {
                  const res = await fetch('/api/analytics/server');
                  const data = await res.json();
                  setServerStats(data);
                } catch {
                  setServerStats(null);
                }
                setServerLoading(false);
              };
              React.useEffect(() => { fetchServerStats(); }, []);
            // Live DB state
            const [dbStats, setDbStats] = React.useState<any>(null);
            const [dbLoading, setDbLoading] = React.useState(false);
            const fetchDbStats = async () => {
              setDbLoading(true);
              try {
                const res = await fetch('/api/analytics/db');
                const data = await res.json();
                setDbStats(data);
              } catch {
                setDbStats(null);
              }
              setDbLoading(false);
            };
            React.useEffect(() => { fetchDbStats(); }, []);
          // Notification type for board support
          type Notification = {
            icon: string;
            message: string;
            showOnBoard?: boolean;
          };
        // Chart export function
        const exportChart = (chartId: string) => {
          alert(`Exporting chart: ${chartId} (demo)`);
          // TODO: Implement real export logic (SVG/PNG/PDF)
        };
      // Advanced notifications state
      const [notifications, setNotifications] = React.useState<Notification[]>([
        { icon: '✅', message: 'Deployment completed successfully' },
        { icon: '⚠️', message: 'Security alert: Unusual login detected' },
        { icon: '🔔', message: 'System event: New user registered' },
        { icon: '🚨', message: 'Critical: API key rotated' },
      ]);
            // Add notification to board
            const addNotificationToBoard = (notification: Notification) => {
              setNotifications(notifications.map(n => n === notification ? { ...n, showOnBoard: true } : n));
            };
      const [notificationFilter, setNotificationFilter] = React.useState('');
      const filteredNotifications = notifications.filter(n => n.message.toLowerCase().includes(notificationFilter.toLowerCase()));
      const [toastMessage, setToastMessage] = React.useState('');
      const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(''), 4000); };
    // Advanced branding state
    const [primaryColor, setPrimaryColor] = React.useState('#7ecfff');
    const [accentColor, setAccentColor] = React.useState('#ffe600');
    const [bgColor, setBgColor] = React.useState('#1a2747');
    React.useEffect(() => {
      if (typeof window !== 'undefined') {
        setPrimaryColor(localStorage.getItem('theme-primary') || '#7ecfff');
        setAccentColor(localStorage.getItem('theme-accent') || '#ffe600');
        setBgColor(localStorage.getItem('theme-bg') || '#1a2747');
      }
    }, []);
    const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  // User state
  const [user, setUser] = React.useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [logs, setLogs] = React.useState<any>(null);
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Modal state variables
  const [showAddUserModal, setShowAddUserModal] = React.useState(false);
  const [showEditRolesModal, setShowEditRolesModal] = React.useState(false);
  const [showDeployModal, setShowDeployModal] = React.useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('employeeToken');
      setIsAuthenticated(!!token);
      // Try to get user info from localStorage
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {}
      }
    }
  }, []);

  // Exclusive admin check
  const isExclusiveAdmin = user && user.email === 'webdevelopment1532@gmail.com' && user.role?.includes('ceo');

  const handleLogin = (formData: Record<string, any>) => {
    // Secure login: authenticate via backend
    setLoading(true);
    setError('');
    fetch('http://localhost:4000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('employeeToken', data.token || 'employee-token');
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            setIsAuthenticated(true);
          }
        } else {
          setError(data.error || 'Login failed. Please check your credentials and try again.');
          setIsAuthenticated(false);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Login failed. Please check your credentials and try again.');
        setIsAuthenticated(false);
        setLoading(false);
      });
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('employeeToken');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Fetch live analytics and logs
  React.useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      Promise.all([
        fetch('http://localhost:4000/analytics/db').then(res => res.json()).catch(() => null),
        fetch('http://localhost:4000/analytics/server').then(res => res.json()).catch(() => null),
        // Add logs endpoint if available
        // fetch('http://localhost:4000/analytics/logs').then(res => res.json()).catch(() => null),
        fetch('/api/me?email=' + encodeURIComponent(user?.email || '')).then(res => res.json()).catch(() => null),
      ]).then(([analyticsData, serverData, userData]) => {
        setAnalytics(analyticsData);
        setLogs(serverData); // Temporarily use serverData for logs until logs endpoint is available
        if (userData) setUser(userData);
        setLoading(false);
      }).catch(() => {
        setError('Failed to load live data.');
        setLoading(false);
      });
    }
  }, [isAuthenticated]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a2747' }}>
      <aside style={{ width: '250px', background: '#22304a', color: '#fff', padding: '2rem 1.2rem', borderRight: '2px solid #2e3d5c', minHeight: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 10 }}>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {sidebarItems.map((item) => (
              <li key={item.href} style={{ marginBottom: '1.2rem' }}>
                <Link href={item.href} style={{ color: '#7ecfff', fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <span>{item.icon}</span> {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ marginTop: '2rem', width: '100%' }}>
          <h3 style={{ color: '#ffe600', fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.7rem', letterSpacing: '1px' }}>Quick Actions</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li><a href="/resources" style={{ color: '#7ecfff', textDecoration: 'underline', fontWeight: 700 }}>Employee Resources</a></li>
            <li><a href="/support" style={{ color: '#7ecfff', textDecoration: 'underline', fontWeight: 700 }}>Support Center</a></li>
            <li><a href="/tools" style={{ color: '#7ecfff', textDecoration: 'underline', fontWeight: 700 }}>Tools & Utilities</a></li>
          </ul>
        </div>
      </aside>
      {/* Main Command Center Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', marginLeft: '250px', overflow: 'visible', position: 'relative', zIndex: 2, background: '#22304a', paddingLeft: '0', paddingRight: '0' }}>
        <main style={{ background: '#22304a', minHeight: '100vh', color: '#fff', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
          <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem 2rem 1rem', background: '#1a2747' }}>
            <h1 style={{ fontSize: '2.7rem', fontWeight: 900, color: '#7ecfff', marginBottom: '1.5rem', letterSpacing: '1px' }}>Command Center Dashboard</h1>
            {/* Profile Section */}
            {isAuthenticated ? (
              <div style={{ background: '#22304a', borderRadius: '14px', boxShadow: '0 0 8px #22304a', padding: '2rem 2.5rem', marginBottom: '2.5rem', width: '100%', maxWidth: '700px', display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap', border: '1.5px solid #2e3d5c' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                    <span role="img" aria-label="profile" style={{ fontSize: '2.2rem', color: '#7ecfff' }}>👤</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#7ecfff', marginBottom: '0.2rem' }}>Welcome, {user.name}</div>
                      <div style={{ fontWeight: 500, fontSize: '1.05rem', color: '#fff' }}>{user.position}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: '0.5rem', color: '#fff', fontSize: '1.05rem' }}><b>Email:</b> {user.email}</div>
                  <div style={{ marginBottom: '0.5rem', color: '#ffe600', fontWeight: 600, fontSize: '1.05rem' }}><b>Status:</b> {user.status}</div>
                  <div style={{ marginBottom: '0.5rem', color: '#7ecfff', fontSize: '1.05rem' }}><b>Role:</b> {user.role}</div>
                  <div style={{ marginBottom: '0.5rem', color: '#fff', fontSize: '1.05rem' }}><b>Joined:</b> {user.joined}</div>
                  <Link href="/" style={{ color: '#7ecfff', fontWeight: 700, textDecoration: 'underline', fontSize: '1rem', marginTop: '0.7rem', display: 'inline-block' }}>← Back to Home</Link>
                  {/* Assignment Section */}
                  <div style={{ marginTop: '1.5rem', background: '#2e3d5c', borderRadius: '8px', boxShadow: '0 0 4px #22304a', padding: '1.1rem', color: '#fff', border: '1px solid #22304a' }}>
                    <div style={{ fontWeight: 700, color: '#7ecfff', fontSize: '1.13rem', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Dashboard Assignment</div>
                    <div style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}><b>Position:</b> {user.position}</div>
                    <div style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}><b>Tasks:</b> Complete onboarding, review security policies, start first project</div>
                    <div style={{ fontSize: '1.05rem' }}><b>Responsibilities:</b> Maintain code quality, collaborate with team, report progress</div>
                  </div>
                  {/* Admin widgets and controls */}
                  {user.role.includes('ceo') || user.role.includes('admin') ? (
                    <div style={{ marginTop: '1.5rem', background: '#22304a', borderRadius: '8px', boxShadow: '0 0 4px #22304a', padding: '1.1rem', color: '#fff', border: '1px solid #2e3d5c' }}>
                      <div style={{ fontWeight: 700, color: '#7ecfff', fontSize: '1.13rem', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Admin Controls</div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '1.05rem', marginBottom: '0.5rem' }}>
                        <li>• Access Security & Command Center <span style={{ color: '#ffe600', fontWeight: 600 }}>(coming soon)</span></li>
                        <li>• Manage users, roles, and permissions</li>
                        <li>• View platform analytics and logs</li>
                        <li>• Configure system settings</li>
                      </ul>
                      {isExclusiveAdmin && (
                        <div style={{ marginTop: '1.1rem', background: '#2e3d5c', borderRadius: '8px', boxShadow: '0 0 4px #22304a', padding: '1.1rem', color: '#fff', border: '1px solid #22304a' }}>
                          <div style={{ fontWeight: 700, color: '#7ecfff', fontSize: '1.13rem', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Curtis Turner Exclusive Features</div>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '1.05rem' }}>
                            <li>• Custom platform branding and theme controls</li>
                            <li>• Advanced developer tools and code deployment</li>
                            <li>• Direct access to all system logs and debug panels</li>
                            <li>• Personalized analytics dashboard</li>
                            <li>• Priority access to new features and modules</li>
                            <li>• API key management and integration settings</li>
                            <li>• Full access to platform configuration</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
                <button onClick={handleLogout} style={{ background: '#2e3d5c', color: '#fff', fontWeight: 700, borderRadius: '8px', padding: '0.5rem 1.2rem', fontSize: '1rem', border: 'none', boxShadow: '0 0 4px #22304a', cursor: 'pointer', marginLeft: '1rem', marginTop: '1.2rem' }}>Logout</button>
              </div>
            ) : (
              <StyledForm
                title="Employees Portal Login"
                buttonText="Login"
                fields={[
                  { label: 'Email', name: 'email', type: 'email', icon: '✉️', required: true },
                  { label: 'Password', name: 'password', type: 'password', icon: '🔒', required: true },
                ]}
                onSubmit={handleLogin}
              />
            )}
            {/* Command Center Panels */}
            {isAuthenticated && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem', width: '100%', maxWidth: '1200px', justifyContent: 'center' }}>
                                                {/* Advanced Live Database Panel */}
                                                <section style={{ background: '#2e3d5c', borderRadius: '10px', boxShadow: '0 0 8px #22304a', padding: '1.2rem', border: '2px solid #7ecfff', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                  <h2 style={{ fontWeight: 700, color: '#7ecfff', fontSize: '1.3rem', marginBottom: '0.7rem', letterSpacing: '1px' }}>Live Database Status</h2>
                                                  {dbLoading ? <div style={{ color: '#ffe600' }}>Loading database stats...</div> : dbStats ? (
                                                    <>
                                                      <div style={{ color: '#fff', marginBottom: '1rem' }}>
                                                        <b>Host:</b> {dbStats.host}<br />
                                                        <b>Port:</b> {dbStats.port}<br />
                                                        <b>User:</b> {dbStats.user}<br />
                                                        <b>Database:</b> {dbStats.database}<br />
                                                        <b>Connection Limit:</b> {dbStats.connectionLimit}<br />
                                                      </div>
                                                      <div style={{ color: '#7ecfff', marginBottom: '1rem' }}>
                                                        <b>Active Connections:</b> {dbStats.activeConnections}<br />
                                                        <b>Idle Connections:</b> {dbStats.idleConnections}<br />
                                                        <b>Failed Connections:</b> {dbStats.failedConnections}<br />
                                                      </div>
                                                      <div style={{ color: '#ffe600', marginBottom: '1rem' }}>
                                                        <b>Query Performance:</b><br />
                                                        Avg Response: {dbStats.avgResponseMs}ms<br />
                                                        Slow Queries: {dbStats.slowQueries}<br />
                                                      </div>
                                                      <div style={{ color: '#fff', marginBottom: '1rem' }}>
                                                        <b>Table Health:</b><br />
                                                        Users: {dbStats.usersCount} rows<br />
                                                        Sales: {dbStats.salesCount} rows<br />
                                                        Last Updated: {dbStats.lastUpdated}<br />
                                                      </div>
                                                      <div style={{ color: '#7ecfff', marginBottom: '1rem' }}>
                                                        <b>Backup Status:</b> Last backup: {dbStats.lastBackup}<br />
                                                        <button style={{ background: '#7ecfff', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', marginTop: '0.7rem', cursor: 'pointer' }} onClick={() => alert('Backup started (mock).')}>Start Backup</button>
                                                      </div>
                                                      <div style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>
                                                        <b>Interactive Query Explorer:</b>
                                                        <form onSubmit={e => { e.preventDefault(); alert('Query executed (mock).'); }} style={{ marginTop: '0.7rem' }}>
                                                          <input type="text" placeholder="SELECT * FROM users WHERE status = 'active';" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #7ecfff', marginBottom: '0.7rem' }} />
                                                          <button type="submit" style={{ background: '#7ecfff', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', cursor: 'pointer' }}>Run Query</button>
                                                        </form>
                                                      </div>
                                                    </>
                                                  ) : <div style={{ color: '#c33' }}>No database stats available.</div>}
                                                  <button style={{ background: '#7ecfff', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', marginTop: '0.7rem', cursor: 'pointer' }} onClick={fetchDbStats}>Refresh DB Stats</button>
                                                </section>
                                                {/* Advanced Live Server Tracking Panel */}
                                                <section style={{ background: '#2e3d5c', borderRadius: '10px', boxShadow: '0 0 8px #22304a', padding: '1.2rem', border: '2px solid #ffe600', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                  <h2 style={{ fontWeight: 700, color: '#ffe600', fontSize: '1.3rem', marginBottom: '0.7rem', letterSpacing: '1px' }}>Live Server Status</h2>
                                                  {serverLoading ? <div style={{ color: '#ffe600' }}>Loading server stats...</div> : serverStats ? (
                                                    <>
                                                      <div style={{ color: '#fff', marginBottom: '1rem' }}>
                                                        <b>Server Host:</b> {serverStats.host}<br />
                                                        <b>Port:</b> {serverStats.port}<br />
                                                        <b>Uptime:</b> {serverStats.uptime}<br />
                                                        <b>Requests Served:</b> {serverStats.requestsServed}<br />
                                                        <b>Active Sessions:</b> {serverStats.activeSessions}<br />
                                                      </div>
                                                      <div style={{ color: '#7ecfff', marginBottom: '1rem' }}>
                                                        <b>CPU Usage:</b> {serverStats.cpuUsage}%<br />
                                                        <b>Memory Usage:</b> {serverStats.memoryUsage}MB<br />
                                                        <b>Disk Usage:</b> {serverStats.diskUsage}%<br />
                                                        {/* Example chart placeholder */}
                                                        <svg width="180" height="60" style={{ marginTop: '0.5rem' }}>
                                                          <rect x="0" y="50" width="180" height="10" fill="#22304a" />
                                                          <rect x="0" y="50" width={serverStats.cpuUsage * 1.8} height="10" fill="#7ecfff" />
                                                          <rect x="0" y="40" width={serverStats.memoryUsage / 10} height="10" fill="#ffe600" />
                                                          <rect x="0" y="30" width={serverStats.diskUsage * 1.8} height="10" fill="#fc0" />
                                                        </svg>
                                                      </div>
                                                      <div style={{ color: '#fff', marginBottom: '1rem' }}>
                                                        <b>Endpoint Tracker:</b><br />
                                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                          {serverStats.endpoints.map((ep: string, idx: number) => (
                                                            <li key={idx}>{ep}</li>
                                                          ))}
                                                        </ul>
                                                      </div>
                                                      <div style={{ color: '#c33', marginBottom: '1rem' }}>
                                                        <b>Error Logs:</b><br />
                                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                          {serverStats.errorLogs.map((log: string, idx: number) => (
                                                            <li key={idx}>{log}</li>
                                                          ))}
                                                        </ul>
                                                      </div>
                                                      <div style={{ color: '#fff', marginBottom: '1rem' }}>
                                                        <b>Smart Controls:</b><br />
                                                        <button style={{ background: '#7ecfff', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', marginRight: '0.7rem', cursor: 'pointer' }} onClick={() => alert('Server restarted (mock).')}>Restart Server</button>
                                                        <button style={{ background: '#c33', color: '#fff', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', cursor: 'pointer' }} onClick={() => alert('Server shutdown (mock).')}>Shutdown Server</button>
                                                      </div>
                                                    </>
                                                  ) : <div style={{ color: '#c33' }}>No server stats available.</div>}
                                                  <button style={{ background: '#ffe600', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', marginTop: '0.7rem', cursor: 'pointer' }} onClick={fetchServerStats}>Refresh Server Stats</button>
                                                </section>
                                {/* System Status & Maintenance Notices Panel */}
                                <section style={{ background: '#2e3d5c', borderRadius: '10px', boxShadow: '0 0 8px #22304a', padding: '1.2rem', border: '2px solid #fc0', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                  <h2 style={{ fontWeight: 700, color: '#fc0', fontSize: '1.3rem', marginBottom: '0.7rem', letterSpacing: '1px' }}>System Status & Maintenance</h2>
                                  {["DB", "API", "Integration", "Portal"].map((service) => {
                                    // Mocked .env values for now, with defaults
                                    const status = {
                                      DB: 'online',
                                      API: 'online',
                                      Integration: 'online',
                                      Portal: 'online',
                                    }[service] || 'unknown';
                                    const nextMaintenance = {
                                      DB: '2026-03-15T02:00:00Z',
                                      API: '2026-03-16T03:00:00Z',
                                      Integration: '2026-03-17T01:00:00Z',
                                      Portal: '2026-03-18T04:00:00Z',
                                    }[service] || '';
                                    const notice = {
                                      DB: 'Scheduled database upgrade. Expect brief downtime.',
                                      API: 'API update. Possible short outage.',
                                      Integration: 'Integration refresh. No expected downtime.',
                                      Portal: 'Portal enhancements. Minimal impact.',
                                    }[service] || 'No notice.';
                                    return (
                                      <div key={service} style={{ marginBottom: '1.2rem', background: '#22304a', borderRadius: '8px', padding: '1rem', border: '1px solid #fc0' }}>
                                        <h3 style={{ color: '#7ecfff', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{service} Status</h3>
                                        <div style={{ color: '#fff', marginBottom: '0.3rem' }}><b>Status:</b> <span style={{ color: status === 'online' ? '#7ecfff' : '#c33' }}>{status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}</span></div>
                                        <div style={{ color: '#ffe600', marginBottom: '0.3rem' }}><b>Next Maintenance:</b> {nextMaintenance ? new Date(nextMaintenance).toLocaleString() : 'N/A'}</div>
                                        <div style={{ color: '#fff', fontSize: '1rem' }}><b>Notice:</b> {notice}</div>
                                        <button style={{ background: '#fc0', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', marginTop: '0.7rem', cursor: 'pointer' }} onClick={() => alert(`${service} maintenance details sent to your email.`)}>Get Maintenance Details</button>
                                      </div>
                                    );
                                  })}
                                </section>
                {/* Quick Links Panel */}
                <section style={{ background: '#2e3d5c', borderRadius: '10px', boxShadow: '0 0 8px #22304a', padding: '1.2rem', border: '2px solid #7ecfff', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h2 style={{ fontWeight: 700, color: '#7ecfff', fontSize: '1.3rem', marginBottom: '0.7rem', letterSpacing: '1px' }}>Quick Links</h2>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '1rem', color: '#fff', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <span title="Documentation"><span role="img" aria-label="docs" style={{ fontSize: '1.3rem' }}>📄</span></span>
                      <a href="/docs" style={{ color: '#7ecfff', textDecoration: 'underline', fontWeight: 700 }} title="View platform documentation">Documentation</a>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <span title="Support Center"><span role="img" aria-label="support" style={{ fontSize: '1.3rem' }}>🛠️</span></span>
                      <a href="/support" style={{ color: '#ffe600', textDecoration: 'underline', fontWeight: 700 }} title="Get help and support">Support Center</a>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <span title="Dev Tools"><span role="img" aria-label="tools" style={{ fontSize: '1.3rem' }}>🧰</span></span>
                      <a href="/tools" style={{ color: '#fc0', textDecoration: 'underline', fontWeight: 700 }} title="Access developer tools and utilities">Dev Tools & Utilities</a>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <span title="GitHub"><span role="img" aria-label="github" style={{ fontSize: '1.3rem' }}>🌐</span></span>
                      <a href="https://github.com/galaxyguard/ohio-next" target="_blank" rel="noopener" style={{ color: '#7ecfff', textDecoration: 'underline', fontWeight: 700 }} title="View GitHub repository">GitHub Repository</a>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <span title="External Integrations"><span role="img" aria-label="integration" style={{ fontSize: '1.3rem' }}>🔗</span></span>
                      <a href="https://galaxyguard.com/integrations" target="_blank" rel="noopener" style={{ color: '#7ecfff', textDecoration: 'underline', fontWeight: 700 }} title="External integrations and APIs">External Integrations</a>
                    </li>
                  </ul>
                </section>
                {/* Performance Charts Panel */}
                <section style={{ background: '#2e3d5c', borderRadius: '10px', boxShadow: '0 0 8px #22304a', padding: '1.2rem', border: '2px solid #7ecfff', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h2 style={{ fontWeight: 700, color: '#7ecfff', fontSize: '1.3rem', marginBottom: '0.7rem', letterSpacing: '1px' }}>Performance Charts</h2>
                  <div style={{ marginBottom: '1rem', color: '#fff' }}>
                    <b>System Health:</b>
                    <div style={{ width: '100%', height: '120px', background: '#22304a', borderRadius: '6px', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="180" height="80">
                        <polyline points="0,60 30,40 60,20 90,30 120,10 150,50 180,20" fill="none" stroke="#7ecfff" strokeWidth="4" />
                        <animate attributeName="points" values="0,60 30,40 60,20 90,30 120,10 150,50 180,20;0,60 30,50 60,30 90,40 120,20 150,60 180,30" dur="2s" repeatCount="indefinite" />
                      </svg>
                      <button style={{ marginLeft: '1rem', background: '#7ecfff', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.3rem 1rem', border: 'none', cursor: 'pointer' }} onClick={() => exportChart('system-health')}>Export</button>
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem', color: '#fff' }}>
                    <b>User Activity:</b>
                    <div style={{ width: '100%', height: '120px', background: '#22304a', borderRadius: '6px', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="180" height="80">
                        <polyline points="0,70 30,60 60,50 90,40 120,30 150,20 180,10" fill="none" stroke="#ffe600" strokeWidth="4" />
                        <animate attributeName="points" values="0,70 30,60 60,50 90,40 120,30 150,20 180,10;0,70 30,50 60,40 90,30 120,20 150,10 180,0" dur="2s" repeatCount="indefinite" />
                      </svg>
                      <button style={{ marginLeft: '1rem', background: '#ffe600', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.3rem 1rem', border: 'none', cursor: 'pointer' }} onClick={() => exportChart('user-activity')}>Export</button>
                    </div>
                  </div>
                  <div style={{ color: '#fff' }}>
                    <b>Deployment History:</b>
                    <div style={{ width: '100%', height: '120px', background: '#22304a', borderRadius: '6px', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="180" height="80">
                        <polyline points="0,40 30,50 60,60 90,70 120,60 150,50 180,40" fill="none" stroke="#fc0" strokeWidth="4" />
                        <animate attributeName="points" values="0,40 30,50 60,60 90,70 120,60 150,50 180,40;0,40 30,60 60,70 90,60 120,50 150,40 180,30" dur="2s" repeatCount="indefinite" />
                      </svg>
                      <button style={{ marginLeft: '1rem', background: '#fc0', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.3rem 1rem', border: 'none', cursor: 'pointer' }} onClick={() => exportChart('deployment-history')}>Export</button>
                    </div>
                  </div>
                </section>
                {/* Notifications Panel */}
                <section style={{ background: '#2e3d5c', borderRadius: '10px', boxShadow: '0 0 8px #22304a', padding: '1.2rem', border: '2px solid #fc0', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h2 style={{ fontWeight: 700, color: '#fc0', fontSize: '1.3rem', marginBottom: '0.7rem', letterSpacing: '1px' }}>Notifications</h2>
                  <input type="text" placeholder="Filter notifications..." value={notificationFilter} onChange={e => setNotificationFilter(e.target.value)} style={{ marginBottom: '1rem', width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ffe600' }} />
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '1rem', color: '#fff', maxHeight: '180px', overflowY: 'auto' }}>
                    {filteredNotifications.map((n, idx) => (
                      <li key={idx} style={{ marginBottom: '0.7rem', background: '#22304a', borderRadius: '6px', padding: '0.7rem', border: '1px solid #fc0', display: 'flex', alignItems: 'center', gap: '0.7rem', position: 'relative' }}>
                        <span>{n.icon}</span>
                        <span>{n.message}</span>
                        <button style={{ marginLeft: 'auto', background: '#fc0', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.2rem 0.7rem', border: 'none', cursor: 'pointer' }} onClick={() => showToast(n.message)}>Toast</button>
                        <button style={{ marginLeft: '0.5rem', background: '#7ecfff', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.2rem 0.7rem', border: 'none', cursor: 'pointer' }} onClick={() => addNotificationToBoard(n)}>Add to Board</button>
                        {n.showOnBoard ? (
                          <span style={{ position: 'absolute', top: '-18px', right: '0', background: '#ffe600', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.2rem 0.7rem', fontSize: '0.9rem' }}>On Board</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  <button style={{ background: '#fc0', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', marginTop: '0.7rem', cursor: 'pointer' }} onClick={() => setNotifications([...notifications, { icon: '🔔', message: 'New real-time notification!' }])}>Simulate Real-Time</button>
                  <button style={{ background: '#7ecfff', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', marginTop: '0.7rem', marginLeft: '0.7rem', cursor: 'pointer' }} onClick={() => setNotifications([...notifications, { icon: '📝', message: 'Board notification added!', showOnBoard: true }])}>Add Board Notification</button>
                  {toastMessage && (
                    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#fc0', color: '#22304a', fontWeight: 700, borderRadius: '8px', padding: '1rem 2rem', boxShadow: '0 0 8px #22304a', zIndex: 2000 }}>
                      {toastMessage}
                      <button style={{ marginLeft: '1rem', background: '#c33', color: '#fff', fontWeight: 700, borderRadius: '6px', padding: '0.2rem 0.7rem', border: 'none', cursor: 'pointer' }} onClick={() => setToastMessage('')}>Dismiss</button>
                    </div>
                  )}
                                {/* Board Notifications Panel */}
                                <section style={{ background: '#2e3d5c', borderRadius: '10px', boxShadow: '0 0 8px #22304a', padding: '1.2rem', border: '2px solid #ffe600', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                  <h2 style={{ fontWeight: 700, color: '#ffe600', fontSize: '1.3rem', marginBottom: '0.7rem', letterSpacing: '1px' }}>Board Notifications</h2>
                                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '1rem', color: '#fff', maxHeight: '180px', overflowY: 'auto' }}>
                                    {notifications.filter(n => n.showOnBoard).map((n, idx) => (
                                      <li key={idx} style={{ marginBottom: '0.7rem', background: '#22304a', borderRadius: '6px', padding: '0.7rem', border: '1px solid #ffe600', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                                        <span>{n.icon}</span>
                                        <span>{n.message}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </section>
                </section>
                {/* Live Analytics Panel */}
                <section style={{ background: '#2e3d5c', borderRadius: '10px', boxShadow: '0 0 8px #22304a', padding: '1.2rem', border: '2px solid #ffe600', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h2 style={{ fontWeight: 700, color: '#7ecfff', fontSize: '1.3rem', marginBottom: '0.7rem', letterSpacing: '1px' }}>Live Platform Analytics</h2>
                  {loading ? <div style={{ color: '#ffe600' }}>Loading analytics...</div> : analytics ? (
                    <div>
                      <div><b>Integration:</b> {analytics.integration}</div>
                      <div><b>Endpoint:</b> {analytics.endpoint}</div>
                      <div><b>Event Version:</b> {analytics.eventVersion}</div>
                      <div><b>Queue:</b> {JSON.stringify(analytics.queue)}</div>
                      <div><b>Timestamp:</b> {analytics.timestamp}</div>
                    </div>
                  ) : <div style={{ color: '#c33' }}>No analytics data.</div>}
                </section>
                {/* System Logs Panel */}
                <section style={{ background: '#2e3d5c', borderRadius: '10px', boxShadow: '0 0 8px #22304a', padding: '1.2rem', border: '2px solid #0ff8', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h2 style={{ fontWeight: 700, color: '#7ecfff', fontSize: '1.3rem', marginBottom: '0.7rem', letterSpacing: '1px' }}>System Logs & Dead-Letter Events</h2>
                  {loading ? <div style={{ color: '#ffe600' }}>Loading logs...</div> : logs && logs.events ? (
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.95rem' }}>
                        {logs.events.map((event: any) => (
                          <li key={event.event_id} style={{ marginBottom: '0.5rem', color: '#fff' }}>
                            <b>{event.event_type}</b> [{event.status}]<br />
                            <span style={{ color: '#7ecfff' }}>Attempts:</span> {event.attempts} <span style={{ color: '#ffe600' }}>Error:</span> {event.error_message || 'None'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : <div style={{ color: '#c33' }}>No log data.</div>}
                </section>
                {/* Interactive Controls Panel */}
                <section style={{ background: '#2e3d5c', borderRadius: '10px', boxShadow: '0 0 8px #22304a', padding: '1.2rem', border: '2px solid #7ecfff', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h2 style={{ fontWeight: 700, color: '#ffe600', fontSize: '1.3rem', marginBottom: '0.7rem', letterSpacing: '1px' }}>Interactive Controls</h2>
                  {/* User Management */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ color: '#7ecfff', fontWeight: 700, fontSize: '1.1rem' }}>User Management</h3>
                    <button style={{ background: '#7ecfff', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', marginBottom: '0.5rem', cursor: 'pointer' }} onClick={() => setShowAddUserModal(true)}>➕ Add User</button>
                    <button style={{ background: '#ffe600', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', marginLeft: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }} onClick={() => setShowEditRolesModal(true)}>📝 Edit Roles</button>
                  </div>
                  {/* Code Deployment */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ color: '#7ecfff', fontWeight: 700, fontSize: '1.1rem' }}>Code Deployment</h3>
                    <button style={{ background: '#0ff8', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', marginBottom: '0.5rem', cursor: 'pointer' }} onClick={() => setShowDeployModal(true)}>⬆️ Deploy Code</button>
                  </div>
                  {/* API Key Management */}
                  <div>
                    <h3 style={{ color: '#7ecfff', fontWeight: 700, fontSize: '1.1rem' }}>API Key Management</h3>
                    <button style={{ background: '#fc0', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', marginBottom: '0.5rem', cursor: 'pointer' }} onClick={() => setShowApiKeyModal(true)}>🔑 Manage API Keys</button>
                  </div>
                  {/* Modals */}
                  {showAddUserModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: '#fff', color: '#22304a', borderRadius: '10px', padding: '2rem', minWidth: '320px', boxShadow: '0 0 16px #22304a' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem' }}>Add User</h3>
                        <form onSubmit={e => { e.preventDefault(); /* TODO: connect to backend */ setShowAddUserModal(false); }}>
                          <input type="text" placeholder="Full Name" required style={{ marginBottom: '0.7rem', width: '100%', padding: '0.5rem' }} />
                          <input type="email" placeholder="Email" required style={{ marginBottom: '0.7rem', width: '100%', padding: '0.5rem' }} />
                          <input type="password" placeholder="Password" required style={{ marginBottom: '0.7rem', width: '100%', padding: '0.5rem' }} />
                          <button type="submit" style={{ background: '#7ecfff', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', marginTop: '0.7rem', cursor: 'pointer' }}>Add</button>
                          <button type="button" style={{ marginLeft: '0.7rem', background: '#c33', color: '#fff', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', cursor: 'pointer' }} onClick={() => setShowAddUserModal(false)}>Cancel</button>
                        </form>
                      </div>
                    </div>
                  )}
                  {showEditRolesModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: '#fff', color: '#22304a', borderRadius: '10px', padding: '2rem', minWidth: '320px', boxShadow: '0 0 16px #22304a' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem' }}>Edit Roles</h3>
                        <form onSubmit={e => { e.preventDefault(); /* TODO: connect to backend */ setShowEditRolesModal(false); }}>
                          <input type="email" placeholder="User Email" required style={{ marginBottom: '0.7rem', width: '100%', padding: '0.5rem' }} />
                          <input type="text" placeholder="New Role" required style={{ marginBottom: '0.7rem', width: '100%', padding: '0.5rem' }} />
                          <button type="submit" style={{ background: '#ffe600', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', marginTop: '0.7rem', cursor: 'pointer' }}>Update</button>
                          <button type="button" style={{ marginLeft: '0.7rem', background: '#c33', color: '#fff', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', cursor: 'pointer' }} onClick={() => setShowEditRolesModal(false)}>Cancel</button>
                        </form>
                      </div>
                    </div>
                  )}
                  {showDeployModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: '#fff', color: '#22304a', borderRadius: '10px', padding: '2rem', minWidth: '320px', boxShadow: '0 0 16px #22304a' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem' }}>Deploy Code</h3>
                        <form onSubmit={e => { e.preventDefault(); /* TODO: connect to backend */ setShowDeployModal(false); }}>
                          <input type="text" placeholder="Branch/Tag" required style={{ marginBottom: '0.7rem', width: '100%', padding: '0.5rem' }} />
                          <button type="submit" style={{ background: '#0ff8', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', marginTop: '0.7rem', cursor: 'pointer' }}>Deploy</button>
                          <button type="button" style={{ marginLeft: '0.7rem', background: '#c33', color: '#fff', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', cursor: 'pointer' }} onClick={() => setShowDeployModal(false)}>Cancel</button>
                        </form>
                      </div>
                    </div>
                  )}
                  {showApiKeyModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: '#fff', color: '#22304a', borderRadius: '10px', padding: '2rem', minWidth: '320px', boxShadow: '0 0 16px #22304a' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem' }}>API Key Management</h3>
                        <form onSubmit={e => { e.preventDefault(); /* TODO: connect to backend */ setShowApiKeyModal(false); }}>
                          <input type="text" placeholder="API Key Name" required style={{ marginBottom: '0.7rem', width: '100%', padding: '0.5rem' }} />
                          <button type="submit" style={{ background: '#fc0', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', marginTop: '0.7rem', cursor: 'pointer' }}>Create/Rotate</button>
                          <button type="button" style={{ marginLeft: '0.7rem', background: '#c33', color: '#fff', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', cursor: 'pointer' }} onClick={() => setShowApiKeyModal(false)}>Cancel</button>
                        </form>
                      </div>
                    </div>
                  )}
                </section>
                {/* Custom Branding & Theme Controls Panel */}
                {isExclusiveAdmin && (
                  <section style={{ background: '#2e3d5c', borderRadius: '10px', boxShadow: '0 0 8px #22304a', padding: '1.2rem', border: '2px solid #ffe600', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2 style={{ fontWeight: 700, color: '#ffe600', fontSize: '1.3rem', marginBottom: '0.7rem', letterSpacing: '1px' }}>Custom Branding & Theme Controls</h2>
                    <form onSubmit={e => { e.preventDefault(); localStorage.setItem('theme-primary', primaryColor); localStorage.setItem('theme-accent', accentColor); localStorage.setItem('theme-bg', bgColor); }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ color: '#7ecfff', fontWeight: 700, fontSize: '1.1rem' }}>Primary Color:</label>
                        <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ marginLeft: '0.5rem', width: '40px', height: '40px', border: 'none', background: 'transparent' }} />
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ color: '#7ecfff', fontWeight: 700, fontSize: '1.1rem' }}>Accent Color:</label>
                        <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ marginLeft: '0.5rem', width: '40px', height: '40px', border: 'none', background: 'transparent' }} />
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ color: '#7ecfff', fontWeight: 700, fontSize: '1.1rem' }}>Background:</label>
                        <select value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ marginLeft: '0.5rem', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none' }}>
                          <option value="#1a2747">Dark Blue</option>
                          <option value="#22304a">Galaxy Guard Blue</option>
                          <option value="#fff">White</option>
                          <option value="#000">Black</option>
                        </select>
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ color: '#7ecfff', fontWeight: 700, fontSize: '1.1rem' }}>Logo:</label>
                        <input type="file" accept="image/*" style={{ marginLeft: '0.5rem' }} onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = ev => setLogoPreview(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }} />
                        {logoPreview && <img src={logoPreview} alt="Logo Preview" style={{ marginTop: '0.7rem', maxWidth: '120px', borderRadius: '6px', border: '2px solid #7ecfff' }} />}
                      </div>
                      <button type="submit" style={{ background: '#7ecfff', color: '#22304a', fontWeight: 700, borderRadius: '6px', padding: '0.4rem 1rem', border: 'none', marginTop: '0.7rem', cursor: 'pointer' }}>Save Theme</button>
                    </form>
                  </section>
                )}
              </div>
            )}
            <p style={{ fontSize: '1.3rem', lineHeight: '1.8', maxWidth: '900px', color: '#fff', marginTop: '3rem', fontWeight: 700, letterSpacing: '1px' }}>
              Access employee resources, tools, and support. Use the sidebar to navigate to other sections or return to the homepage. This dashboard is your command center for development, security, and collaboration.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
