<<<<<<< HEAD
<<<<<<< HEAD


![Build Status](https://github.com/webdevelopment1532-source/Galaxy-Ohio-Security-Service-Website/actions/workflows/ci.yml/badge.svg)
![CodeQL](https://github.com/webdevelopment1532-source/Galaxy-Ohio-Security-Service-Website/actions/workflows/codeql-analysis.yml/badge.svg)
![Dependabot](https://github.com/webdevelopment1532-source/Galaxy-Ohio-Security-Service-Website/actions/workflows/dependabot.yml/badge.svg)
![Contributors](https://img.shields.io/github/contributors/webdevelopment1532-source/Galaxy-Ohio-Security-Service-Website)
![License](https://img.shields.io/github/license/webdevelopment1532-source/Galaxy-Ohio-Security-Service-Website)

Production-grade Next.js application for Galaxy Guard Ohio with comprehensive testing, accessibility-first design, and secure Sales Center integration.

---


```bash
# Install dependencies
npm install

# Backend env setup (one-time)
cp backend/.env.example backend/.env

# Development
npm run dev              # Start dev server on http://localhost:3000
npm run dev:backend      # Start Ohio backend API in development mode

# Testing
npm run test:all         # Run all tests (backend + frontend + e2e)
npm run test:unit        # Unit & accessibility tests
npm run test:e2e         # Playwright E2E tests
npm run test:backend     # Backend integration tests
npm run replay:ohio-events      # One-shot replay of pending outbox events
npm run publisher:ohio-events   # Continuous outbox publisher loop

# Production
npm run build            # Build for production
npm run start            # Start production server
npm run start:backend    # Start Ohio backend API server
```

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Styling**: Inline styles (planned: Tailwind CSS)
- **Runtime**: Node.js 20+
- **Framework**: Express 5

✅ **Accessibility-First**
- AsyncStateNotice pattern for consistent async states
- useMenuNavigation hook for keyboard-accessible dropdowns
- HMAC SHA-256 signed events to Sales Center
- Event-log table for guaranteed delivery
- Frontend CI: Lint → Test → Build
- Backend CI: Test → Security Scan
- Customer, Employee, Intern, Manager, Admin, Owner dashboards
- Secure authentication with JWT

<<<<<<< HEAD
Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
>>>>>>> e7f32a0 (Initial commit from Create Next App)
=======
```
/mnt/ai/websites/galaxysecurityweb/galaxy-guard-ohio-next/
├── .github/workflows/      # CI/CD pipelines
├── backend/                # Express API + integration logic
│   ├── shared/            # HMAC sender, event-log, JWT auth
│   ├── workers/           # Background replay worker
│   └── INTEGRATION.md     # Sales Center integration docs
├── components/            # Reusable React components
│   ├── AsyncStateNotice.tsx
│   └── ...
├── e2e/                   # Playwright tests
├── hooks/                 # Custom React hooks
│   └── useMenuNavigation.ts
├── pages/                 # Next.js pages
├── test/                  # Test setup & utilities
├── TESTING.md             # Testing guide
├── IMPLEMENTATION_CHECKLIST.md  # Build roadmap
└── package.json
```

## Integration & Security
- **Ops APIs**: `GET /api/integrations/ohio/health`, `GET /api/integrations/ohio/dead-letter`, `POST /api/integrations/ohio/requeue/:eventId`
- **Contract**: `backend/openapi/sales-center-ohio-events.v1.yaml`

### Environment Variables

Required (see `backend/.env.example`):
```env
# Database
DB_HOST=localhost
DB_USER=ohio_user
DB_PASSWORD=secure_password
DB_NAME=ohio_db

# Sales Center Integration
SALES_CENTER_INTEGRATION_URL=https://sales-center.galaxyguard.com
OHIO_INTEGRATION_SECRET=shared_secret_matching_sales_center
OHIO_INTEGRATION_EVENT_VERSION=v1
OHIO_INTEGRATION_ENDPOINT_PATH=/api/integrations/ohio/events
OHIO_EVENT_LOG_MAX_ATTEMPTS=10
OHIO_EVENT_LOG_REPLAY_BATCH_SIZE=25
OHIO_OUTBOX_POLL_INTERVAL_MS=2000
```

`npm run dev:backend` and `npm run start:backend` automatically load values from `backend/.env`.

## Apache2 Virtual Host Example

```apache
<VirtualHost *:443>
	ServerName ohio.galaxyguard.com
	DocumentRoot /var/www/galaxyguard/galaxy-guard-ohio-next/dist
	ProxyPass /api http://127.0.0.1:5000/api
	ProxyPassReverse /api http://127.0.0.1:5000/api
	SSLEngine on
	SSLCertificateFile /etc/ssl/certs/ohio.crt
	SSLCertificateKeyFile /etc/ssl/private/ohio.key
</VirtualHost>
<VirtualHost *:443>
	ServerName ssc.galaxyguard.com
	DocumentRoot /var/www/galaxyguard/Galaxy Guard Sales Service Center/dist
	ProxyPass /api http://127.0.0.1:6000/api
	ProxyPassReverse /api http://127.0.0.1:6000/api
	SSLEngine on
	SSLCertificateFile /etc/ssl/certs/ssc.crt
	SSLCertificateKeyFile /etc/ssl/private/ssc.key
</VirtualHost>
```
- `/onboarding`, `/create-account`, `/login`, `/customer-portal`, `/admin-portal`, `/application`, `/companies`, `/contact`, `/employees-portal`, `/interns-portal`, `/security-assessment`, `/pen-testing`, `/cyber-security`, `/full-stack-web`, etc.
- Data models for users, tickets, companies, payments, and service reports

## Deployment Steps
1. Build frontend: `npm run build` (Next.js) or `vite build` (Vite)
2. Start backend API server: `pm2 start backend/server.js` (Ohio) or `pm2 start backend/src/index.js` (SSC)
3. Configure Apache virtual hosts and SSL
4. Test endpoints and inter-API communication
5. Set up firewalls and scheduled API syncs
- Validate and sanitize all payloads
- Never link databases directly
- All communication is via secure APIs
- Data flows only via authenticated, encrypted requests
- Backend: Node.js, Express, TypeScript

---
For more details, see the documentation in each subproject and the `.github/copilot-instructions.md` file.
>>>>>>> 83f8c69 (Platform update: real data, security fixes, report added)
