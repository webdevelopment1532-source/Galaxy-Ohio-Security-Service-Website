import { useEffect, useState } from 'react';
import Link from 'next/link';
import AsyncStateNotice from '../components/AsyncStateNotice';

interface Ticket {
  id: number;
  title?: string;
  update_text?: string;
  status: string;
  priority?: string;
  created_at?: string;
  updated_at?: string;
  assigned_to?: string;
}

const widgetStyle = {
  background: '#fff',
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  padding: '1.5rem',
  marginBottom: '2rem',
  minHeight: '120px',
};

const Tickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTickets = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/tickets');
      
      if (!res.ok) {
        throw new Error('Failed to fetch tickets');
      }
      
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError('Unable to load tickets. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const getPriorityColor = (priority?: string) => {switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return '#c33';
      case 'medium':
        return '#fc0';
      case 'low':
        return '#0c8';
      default:
        return '#7ecfff';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'new':
        return '#0a7cff';
      case 'in progress':
      case 'working':
        return '#fc0';
      case 'resolved':
      case 'closed':
        return '#0c8';
      case 'on hold':
        return '#aaa';
      default:
        return '#7ecfff';
    }
  };

  return (
    <div style={{ background: '#f4f8fb', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#183d5c', fontWeight: 800, fontSize: '2.5rem', letterSpacing: '1px', margin: 0 }}>
            Ticket Management
          </h1>
          <Link
            href="/"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#0a7cff',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#0860d0')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#0a7cff')}
          >
            ← Home
          </Link>
        </div>

        {/* Dashboard Widgets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div style={widgetStyle}>
            <h2 style={{ color: '#0a7cff', marginBottom: '1rem', fontSize: '1.3rem' }}>Real-Time Tracking</h2>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Live updates for jobs, staff, and sales activities will appear here.
            </p>
          </div>
          <div style={widgetStyle}>
            <h2 style={{ color: '#0a7cff', marginBottom: '1rem', fontSize: '1.3rem' }}>Virtual Board</h2>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Tasks, assignments, and group activities will be displayed here.
            </p>
          </div>
          <div style={widgetStyle}>
            <h2 style={{ color: '#0a7cff', marginBottom: '1rem', fontSize: '1.3rem' }}>Job Assignment</h2>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Assigned jobs for employees, interns, and groups will be shown here.
            </p>
          </div>
        </div>

        {/* Tickets Section with AsyncStateNotice */}
        <div style={widgetStyle}>
          <h2 style={{ color: '#0a7cff', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            Active Tickets
          </h2>
          
          <AsyncStateNotice
            loading={loading}
            error={error}
            empty={tickets.length === 0 && !loading && !error}
            emptyMessage="No tickets found. All clear!"
            loadingMessage="Loading tickets..."
            retryAction={loadTickets}
          >
            <div style={{ display: 'grid', gap: '1rem' }}>
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  style={{
                    padding: '1rem',
                    background: '#f8fafc',
                    border: '1px solid #e0e6ed',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '1.1rem', color: '#183d5c' }}>
                        {ticket.title || ticket.update_text || 'Untitled Ticket'}
                      </strong>
                      {ticket.priority && (
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: getPriorityColor(ticket.priority) + '22',
                            color: getPriorityColor(ticket.priority),
                            border: `1px solid ${getPriorityColor(ticket.priority)}`,
                          }}
                        >
                          {ticket.priority}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      {ticket.assigned_to && <span>Assigned to: {ticket.assigned_to} • </span>}
                      {(ticket.created_at || ticket.updated_at) && (
                        <span>
                          {new Date(ticket.created_at || ticket.updated_at || '').toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      background: getStatusColor(ticket.status) + '22',
                      color: getStatusColor(ticket.status),
                      border: `2px solid ${getStatusColor(ticket.status)}`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          </AsyncStateNotice>
        </div>
      </div>
    </div>
  );
};

export default Tickets;
