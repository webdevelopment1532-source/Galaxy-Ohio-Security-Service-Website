import React from 'react';
import Link from 'next/link';
import ServiceHighlight from '../components/ServiceHighlight';
import Testimonial from '../components/Testimonial';
import TeamMember from '../components/TeamMember';
import CallToAction from '../components/CallToAction';
import LiveChatWidget from '../components/LiveChatWidget';

const sidebarItems = [
  { label: 'Pen Testing', href: '/pen-testing' },
  { label: 'Cyber Security', href: '/cyber-security' },
  { label: 'IT', href: '/it-certified' },
  { label: 'Networking', href: '/networking-certified' },
  { label: 'Full Stack Web', href: '/full-stack-web' },
  { label: 'Internship', href: '/internship' },
  { label: 'About', href: '/about' },
  { label: 'Admin Portal', href: '/admin-portal' },
  { label: 'Application', href: '/application' },
  { label: 'Companies', href: '/companies' },
  { label: 'Contact', href: '/contact' },
  { label: 'Create Account', href: '/create-account' },
  { label: 'Customer Portal', href: '/customer-portal' },
  { label: 'Employees Portal', href: '/employees-portal' },
  { label: 'Enrollments', href: '/enrollments' },
  { label: 'Interns Portal', href: '/interns-portal' },
  { label: 'Interns Registry', href: '/interns-registry' },
  { label: 'Login', href: '/login' },
  { label: 'Onboarding', href: '/onboarding' },
];

export default function Home() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflow: 'hidden', position: 'relative', flexDirection: 'column' }}>
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
      {/* Live Chat Widget */}
      <LiveChatWidget />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', marginLeft: '180px', overflow: 'visible', position: 'relative', zIndex: 2, background: 'rgba(10,26,47,0.85)', paddingLeft: '0', paddingRight: '0' }}>
        {/* Navbar */}
        <nav style={{ width: '100%', background: 'linear-gradient(90deg, #1a2747 0%, #0a1a2f 100%)', color: '#fff', padding: '1.5rem 2vw 0 2vw', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', boxShadow: '0 2px 24px #0ff8', gap: '2rem', position: 'fixed', top: 0, left: 0, zIndex: 30 }}>
          <div style={{ width: '100%', overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'auto', paddingBottom: '0.5rem', paddingLeft: '18vw' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
              <Link
                href="/onboarding"
                style={{ background: '#ffe600', color: '#183d5c', fontWeight: 700, borderRadius: '8px', padding: '0.35rem 0.7rem', marginRight: '0.5rem', boxShadow: '0 0 8px #fff8', textDecoration: 'none', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

                <span role="img" aria-label="rocket">🚀</span>Onboarding
                                
              </Link>
              {[
                { label: 'Create Account', href: '/create-account', icon: '👤' },
                { label: 'Interns Registry', href: '/interns-registry', icon: '📋' },
                { label: 'Login', href: '/login', icon: '🔑' },
                { label: 'About', href: '/about', icon: 'ℹ️' },
                { label: 'Contact', href: '/contact', icon: '📞' },
              ].map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  style={{
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    borderRadius: '8px',
                    padding: '0.35rem 0.7rem',
                    marginRight: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'background 0.2s ease',
                    background: 'rgba(24, 61, 92, 0.92)',
                    boxShadow: '0 0 0 1px rgba(126, 207, 255, 0.18)',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#224b70')}
                  onMouseOut={e => (e.currentTarget.style.background = 'rgba(24, 61, 92, 0.92)')}>

                  <span aria-hidden="true">{item.icon}</span> {item.label}

                </Link>
              ))}
            </div>
          </div>
        </nav>
        {/* Hero Section */}
        <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '3rem 1rem 0 1rem', background: 'rgba(10,26,47,0.95)', minHeight: '60vh' }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, letterSpacing: '2px', marginBottom: '0.5rem', color: '#7ecfff', textShadow: '0 0 16px #0ff8', marginTop: '5rem' }}>GALAXY GUARD OHIO</h1>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 400, color: '#7ecfff', marginBottom: '1.5rem' }}>Empowering the Next Generation of Cybersecurity Experts</h2>
            <p style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '2rem', textAlign: 'center', maxWidth: '700px' }}>
              Your trusted partner for secure, scalable web solutions. We build, protect, and monitor your digital presence so you can focus on growth.
            </p>
          <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', borderRadius: '24px', overflow: 'hidden', background: '#0a1a2f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/Galaxy-Guard-main-website-image.png" alt="Galaxy Guard Ohio Main" style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block', borderRadius: '0', margin: 0 }} />
          </div>
          {/* Service Highlights */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '2rem',
              margin: '2rem 0',
              width: '100%',
            }}
          >
            <ServiceHighlight icon={<span role="img" aria-label="shield">🛡️</span>} title="Security" description={"Cybersecurity\nProtect your business with advanced security solutions and monitoring."} iconBg="linear-gradient(135deg, #e0f7fa 60%, #ffe0e0 100%)" />
            <ServiceHighlight icon={<span role="img" aria-label="laptop">💻</span>} title="Web Development" description={"Web Development\nModern, scalable websites built for performance and security."} iconBg="linear-gradient(135deg, #fffbe6 60%, #e0f7fa 100%)" />
            <ServiceHighlight icon={<span role="img" aria-label="headset">🎧</span>} title="Support" description={"24/7 Support\nExpert help and monitoring from our online security center."} iconBg="linear-gradient(135deg, #e0e7ff 60%, #e0f7fa 100%)" />
          </div>
          <style>{`
            @media (max-width: 900px) {
              .service-highlights {
                flex-direction: column !important;
                align-items: center !important;
              }
              .service-card {
                min-width: 90vw !important;
                margin-bottom: 1.5rem !important;
              }
            }
          `}</style>
          {/* Service Highlights */}
          {/* Call to Action */}
          <div style={{ margin: '2rem 0', textAlign: 'center' }}>
            <CallToAction href="/contact" label="Request a Demo" />
          </div>
          {/* Testimonials */}
          <div style={{ maxWidth: '800px', margin: '2rem auto', background: '#1a2747', borderRadius: '16px', padding: '2rem', color: '#fff', boxShadow: '0 0 8px #0ff8' }}>
            <h3 style={{ color: '#7ecfff', marginBottom: '1rem' }}>What Our Clients Say</h3>
            <Testimonial quote="Galaxy Guard Ohio transformed our online security and built a website that truly stands out!" author="Acme Corp" />
            <Testimonial quote="The support and expertise are unmatched. Highly recommended!" author="Jane D., IT Manager" />
          </div>
          {/* Trust Signals */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '2rem 0' }}>
            <span style={{ fontSize: '2.5rem' }} role="img" aria-label="Certified">✅</span>
            <span style={{ fontSize: '2.5rem' }} role="img" aria-label="Award">🏆</span>
            <span style={{ fontSize: '2.5rem' }} role="img" aria-label="Partner">🤝</span>
          </div>
          {/* Interactive Elements */}
          <div style={{ margin: '2rem 0', textAlign: 'center' }}>
            <CallToAction href="/onboarding" label="Quick Quote" style={{ background: '#7ecfff', marginRight: '1rem' }} />
            <CallToAction href="/security-assessment" label="Free Security Assessment" />
          </div>
          {/* Video Introduction */}
          <div style={{ margin: '2rem 0', textAlign: 'center' }}>
            <div style={{
              fontSize: '4rem',
              color: '#2d3a4a',
              display: 'inline-block',
              borderRadius: '50%',
              boxShadow: '0 4px 24px #7ecfff33, 0 0 0 4px #fff6',
              background: 'linear-gradient(135deg, #fffbe6 60%, #e0f7fa 100%)',
              padding: '2.2rem',
              border: '3px solid #e0f7fa',
              filter: 'drop-shadow(0 0 8px #7ecfff33)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              outline: 'none',
              marginBottom: '0.5rem'
            }}
            tabIndex={0}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span role="img" aria-label="video introduction">🎬</span>
            </div>
            <div style={{ marginTop: '1rem', color: '#7ecfff', fontWeight: 600, fontSize: '1.2rem' }}>
              Video introduction coming soon
            </div>
          </div>
          {/* Case Studies */}
          <div style={{ maxWidth: '800px', margin: '2rem auto', background: '#183d5c', borderRadius: '16px', padding: '2rem', color: '#fff', boxShadow: '0 0 8px #0ff8' }}>
            <h3 style={{ color: '#ffe600', marginBottom: '1rem' }}>Case Studies</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '1rem' }}><strong>Retail Security Upgrade:</strong> Improved security and uptime for a major retailer.</li>
              <li><strong>Healthcare Web Portal:</strong> Built a HIPAA-compliant portal for patient management.</li>
            </ul>
          </div>
          {/* Team Introduction */}
          <div style={{ maxWidth: '800px', margin: '2rem auto', background: '#1a2747', borderRadius: '16px', padding: '2rem', color: '#fff', boxShadow: '0 0 8px #0ff8' }}>
            <h3 style={{ color: '#7ecfff', marginBottom: '1rem' }}>Meet Our Team</h3>
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <TeamMember name="John Smith" role="Lead Security Engineer" image="/Galaxy-Guard-main-website-image.png" />
              <TeamMember name="Jane Doe" role="Full Stack Developer" image="/Galaxy-Guard-main-website-image.png" />
            </div>
          </div>
          {/* Blog/News Section */}
          <div style={{ maxWidth: '800px', margin: '2rem auto', background: '#183d5c', borderRadius: '16px', padding: '2rem', color: '#fff', boxShadow: '0 0 8px #0ff8' }}>
            <h3 style={{ color: '#ffe600', marginBottom: '1rem' }}>Latest News & Insights</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '1rem' }}><strong>How to Secure Your Website in 2026</strong> — Tips from our experts.</li>
              <li><strong>Cloud Security Trends</strong> — What businesses need to know.</li>
            </ul>
          </div>
          {/* Security Tips/Resources */}
          <div style={{ maxWidth: '800px', margin: '2rem auto', background: '#1a2747', borderRadius: '16px', padding: '2rem', color: '#fff', boxShadow: '0 0 8px #0ff8' }}>
            <h3 style={{ color: '#7ecfff', marginBottom: '1rem' }}>Security Tips</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '1rem' }}><strong>Use strong passwords</strong> and enable multi-factor authentication.</li>
              <li><strong>Keep software updated</strong> to prevent vulnerabilities.</li>
            </ul>
          </div>
          {/* Social Proof */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', margin: '2rem 0' }}>
            <span
              style={{
                fontSize: '2.7rem',
                background: 'linear-gradient(135deg, #fffbe6 60%, #e0f7fa 100%)',
                borderRadius: '50%',
                padding: '1.1rem',
                boxShadow: '0 4px 24px #ffe60033, 0 0 0 4px #fff6',
                color: '#2d3a4a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #e0f7fa',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                outline: 'none',
                filter: 'drop-shadow(0 0 8px #ffe60033)'
              }}
              role="img"
              aria-label="Client 1"
              tabIndex={0}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.12)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              👤
            </span>
            <span
              style={{
                fontSize: '2.7rem',
                background: 'linear-gradient(135deg, #e0f7fa 60%, #fffbe6 100%)',
                borderRadius: '50%',
                padding: '1.1rem',
                boxShadow: '0 4px 24px #7ecfff33, 0 0 0 4px #fff6',
                color: '#2d3a4a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #fffbe6',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                outline: 'none',
                filter: 'drop-shadow(0 0 8px #7ecfff33)'
              }}
              role="img"
              aria-label="Client 2"
              tabIndex={0}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.12)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              👥
            </span>
            <span
              style={{
                fontSize: '2.7rem',
                background: 'linear-gradient(135deg, #ffe0e0 60%, #e0f7fa 100%)',
                borderRadius: '50%',
                padding: '1.1rem',
                boxShadow: '0 4px 24px #ff7e6733, 0 0 0 4px #fff6',
                color: '#2d3a4a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #e0f7fa',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                outline: 'none',
                filter: 'drop-shadow(0 0 8px #ff7e6733)'
              }}
              role="img"
              aria-label="Client 3"
              tabIndex={0}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.12)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              🏢
            </span>
          </div>
          {/* Service Icons Row (replaces video section) */}
          <div style={{ maxWidth: '800px', margin: '2rem auto', background: '#183d5c', borderRadius: '16px', padding: '2rem', color: '#fff', boxShadow: '0 0 8px #0ff8' }}>
            <h3 style={{ color: '#ffe600', marginBottom: '1rem' }}>Our Capabilities</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2.5rem', minHeight: '80px', background: '#1a2747', borderRadius: '12px', marginBottom: '1rem', border: '2px dashed #7ecfff', padding: '1.5rem 0' }}>
              <span style={{ fontSize: '2.7rem' }} role="img" aria-label="Security">🛡️</span>
              <span style={{ fontSize: '2.7rem' }} role="img" aria-label="Web Development">💻</span>
              <span style={{ fontSize: '2.7rem' }} role="img" aria-label="Support">🎧</span>
              <span style={{ fontSize: '2.7rem' }} role="img" aria-label="Certified">✅</span>
              <span style={{ fontSize: '2.7rem' }} role="img" aria-label="Award">🏆</span>
              <span style={{ fontSize: '2.7rem' }} role="img" aria-label="Partner">🤝</span>
            </div>
          </div>
          {/* Case Studies */}
          <div style={{ maxWidth: '800px', margin: '2rem auto', background: '#183d5c', borderRadius: '16px', padding: '2rem', color: '#fff', boxShadow: '0 0 8px #0ff8' }}>
            <h3 style={{ color: '#ffe600', marginBottom: '1rem' }}>Case Studies</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '1rem' }}><strong>Retailer X:</strong> Prevented a major data breach with our 24/7 monitoring.</li>
              <li><strong>Healthcare Group Y:</strong> Achieved HIPAA compliance with our security solutions.</li>
            </ul>
          </div>
          <div style={{ width: '100%', maxWidth: '330px', background: 'linear-gradient(180deg, #1a2747 0%, #183d5c 100%)', color: '#fff', borderRadius: '18px', padding: '2rem 1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '2rem auto 0 auto', boxShadow: '0 0 12px #0ff8' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#7ecfff', textAlign: 'center' }}>Full Stack Website Development</h3>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              Build modern, secure, and scalable websites for your business or personal brand. Our expert team delivers end-to-end solutions using the latest technologies.
            </p>
            <a href="/full-stack-web" style={{ background: '#ffe600', color: '#183d5c', fontWeight: 700, borderRadius: '8px', padding: '0.75rem 1.5rem', boxShadow: '0 0 8px #fff8', textDecoration: 'none', fontSize: '1.1rem', marginTop: '0.5rem', display: 'inline-block', transition: 'background 0.2s' }}>Get Started</a>
          </div>
        </section>
        {/* Footer */}
        <footer style={{ textAlign: 'center', padding: '2rem 0 1rem 0', color: '#7ecfff', fontSize: '1rem', background: 'rgba(10,22,47,0.85)', marginTop: 'auto' }}>
          &copy; {new Date().getFullYear()} Galaxy Guard Ohio. All rights reserved.
        </footer>
      </div>
    </div>
  );
  }
