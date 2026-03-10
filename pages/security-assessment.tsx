import React from 'react';

export default function SecurityAssessment() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,26,47,0.95)', color: '#fff', fontFamily: 'Segoe UI, Arial, sans-serif', padding: '2vw' }}>
      <div style={{ width: '100%', maxWidth: '540px', margin: '3rem auto', background: 'linear-gradient(135deg, #183d5c 0%, #0a1a2f 100%)', borderRadius: '20px', boxShadow: '0 0 24px #0ff8', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: '#7ecfff', textAlign: 'center' }}>Security Assessment</h1>
        <p style={{ maxWidth: '340px', fontSize: '1rem', textAlign: 'center', marginBottom: '1.5rem', color: '#fff' }}>
          Get a free online security assessment for your business or website. Fill out the form below and our experts will review your setup and provide recommendations to improve your security posture.
        </p>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          <label htmlFor="name" style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.08rem', letterSpacing: '0.5px' }}>Name</label>
          <input id="name" name="name" type="text" required autoComplete="name" style={{ padding: '1rem', borderRadius: '10px', border: '2px solid #7ecfff', fontSize: '1.08rem', background: '#0a1a2f', color: '#fff', marginBottom: '0.5rem' }} />
          <label htmlFor="email" style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.08rem', letterSpacing: '0.5px' }}>Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" style={{ padding: '1rem', borderRadius: '10px', border: '2px solid #7ecfff', fontSize: '1.08rem', background: '#0a1a2f', color: '#fff', marginBottom: '0.5rem' }} />
          <label htmlFor="website" style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.08rem', letterSpacing: '0.5px' }}>Website/Business</label>
          <input id="website" name="website" type="text" style={{ padding: '1rem', borderRadius: '10px', border: '2px solid #7ecfff', fontSize: '1.08rem', background: '#0a1a2f', color: '#fff', marginBottom: '0.5rem' }} />
          <label htmlFor="details" style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.08rem', letterSpacing: '0.5px' }}>Details/Concerns</label>
          <textarea id="details" name="details" rows={4} style={{ padding: '1rem', borderRadius: '10px', border: '2px solid #7ecfff', fontSize: '1.08rem', background: '#0a1a2f', color: '#fff', marginBottom: '0.5rem' }} />
          <button type="submit" style={{ background: '#ffe600', color: '#183d5c', fontWeight: 800, borderRadius: '10px', padding: '1.1rem', fontSize: '1.15rem', marginTop: '1rem', cursor: 'pointer', border: 'none', boxShadow: '0 0 12px #fff8', letterSpacing: '0.5px' }}>Submit Assessment</button>
        </form>
      </div>
    </div>
  );
}
