import React, { useState } from 'react';

export default function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'support', text: 'Welcome to Galaxy Guard Ohio! How can we help you today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { from: 'user', text: input }]);
      setInput('');
      setTimeout(() => {
        setMessages(msgs => [...msgs, { from: 'support', text: 'Thank you! We will get back to you soon.' }]);
      }, 1200);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
      {!open && (
        <button onClick={() => setOpen(true)} style={{ background: '#183d5c', color: '#fff', borderRadius: '50%', width: '56px', height: '56px', boxShadow: '0 0 8px #0ff8', border: 'none', fontSize: '2rem', cursor: 'pointer' }}>
          💬
        </button>
      )}
      {open && (
        <div style={{ width: '420px', minHeight: '320px', maxHeight: '90vh', background: '#0a1a2f', borderRadius: '16px', boxShadow: '0 0 16px #0ff8', padding: '1rem', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.1rem', textAlign: 'center' }}>Live Chat Support</div>
          <div style={{ flex: 1, minHeight: '120px', maxHeight: 'calc(60vh - 80px)', overflowY: 'auto', marginBottom: '0.5rem', background: '#183d5c', borderRadius: '8px', padding: '0.5rem' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ textAlign: msg.from === 'user' ? 'right' : 'left', margin: '0.3rem 0' }}>
                <span style={{ background: msg.from === 'user' ? '#ffe600' : '#7ecfff', color: msg.from === 'user' ? '#183d5c' : '#0a1a2f', borderRadius: '8px', padding: '0.3rem 0.7rem', display: 'inline-block' }}>{msg.text}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              style={{ flex: 1, borderRadius: '8px', border: '1px solid #7ecfff', padding: '0.5rem', fontSize: '1rem', background: '#fff', color: '#183d5c' }}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            />
            <button onClick={handleSend} style={{ background: '#7ecfff', color: '#183d5c', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 700, border: 'none', fontSize: '1rem', cursor: 'pointer' }}>Send</button>
            <button onClick={() => setOpen(false)} style={{ background: '#ffe600', color: '#183d5c', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 700, border: 'none', fontSize: '1rem', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
