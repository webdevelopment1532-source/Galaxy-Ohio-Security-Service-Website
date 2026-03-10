# Ohio Website - Best Build Implementation Checklist

Implementation checklist for operationalizing the Ohio website with Sales Center-aligned patterns for accessibility, security, and maintainability.

## ✅ Phase 1: Foundation (COMPLETED)

### Backend Integration & Security
- [x] Remove hardcoded DB credentials
- [x] Environment-based configuration (.env.example template)
- [x] HMAC-signed event dispatch to Sales Center
- [x] Event-log table for guaranteed delivery
- [x] Exponential backoff retry with replay worker
- [x] Backend unit tests (5 passed)
- [x] Sales Center contract alignment verification
- [x] Integration documentation (backend/INTEGRATION.md)

### Frontend Testing Infrastructure
- [x] Install Vitest + jsdom + Testing Library
- [x] Install Playwright for E2E tests
- [x] Install jest-axe for accessibility testing
- [x] Configure vitest.config.ts
- [x] Configure playwright.config.ts
- [x] Create test setup file with Next.js mocks
- [x] Add test scripts to package.json

### Accessibility Primitives
- [x] Create AsyncStateNotice component
- [x] Create useMenuNavigation hook
- [x] Comprehensive unit tests (18 tests passed)
- [x] Axe accessibility validation for all states

### CI/CD Automation
- [x] Frontend CI workflow (lint, test, build)
- [x] Backend CI workflow (tests, security scan)
- [x] ESLint with jsx-a11y rules
- [x] Playwright artifacts (traces, screenshots, reports)
- [x] npm audit security scanning

### Documentation
- [x] Testing guide (TESTING.md)
- [x] Integration details (backend/INTEGRATION.md)
- [x] Implementation checklist (this file)

---

## 🔄 Phase 2: Pattern Extraction & Standardization (COMPLETED)

### Refactor Existing Components
- [x] Dashboard - Use AsyncStateNotice pattern
- [x] Login page - Add error handling with AsyncStateNotice
- [x] Customer Portal - Async state + keyboard nav
- [x] Admin Portal - Role-based access with async feedback
- [x] Enrollments - Data table with loading/error/empty states
- [x] Tickets - CRUD operations with async feedback

### Extract Reusable Patterns
- [ ] Create DataTable component with sorting/filtering
- [ ] Create Modal/Dialog primitive with focus trap
- [ ] Create Toast/Notification system (role="status")
- [ ] Create FormField wrapper with label association
- [ ] Create LoadingButton component (aria-busy state)

### Expand Test Coverage
- [ ] Add Axe tests for ServiceHighlight component
- [ ] Add Axe tests for Testimonial component
- [ ] Add Axe tests for TeamMember component
- [ ] Add Axe tests for StyledForm component
- [ ] Add Axe tests for LiveChatWidget component
- [ ] Add E2E test for login flow
- [ ] Add E2E test for form submission (contact, application)
- [ ] Add E2E test for navigation (sidebar links)

---

## 📋 Phase 3: High-Risk Data Views (PLANNED)

### Analytics & Reporting Components
- [ ] Create AnalyticsPanelShell (consistent container)
- [ ] CampaignAnalytics - Chart + table with ARIA labels
- [ ] SalesTrends - Time series with data table fallback
- [ ] ServiceSalesPie - Chart with text alternative
- [ ] RevenueOverview - Key metrics with status regions

### Accessibility Enhancements
- [ ] Add `<caption>` to all data tables
- [ ] Add ARIA labels to all charts
- [ ] Implement keyboard navigation for chart interactions
- [ ] Add data table text alternatives for visualizations
- [ ] Screen reader testing for analytics views

---

## 🚀 Phase 4: Performance & Observability (PLANNED)

### Performance Optimization
- [ ] Install next/image for optimized images
- [ ] Implement lazy loading for heavy components
- [ ] Add bundle size monitoring in CI
- [ ] Set up Core Web Vitals reporting
- [ ] Optimize font loading (next/font)
- [ ] Implement code splitting for routes

### Real User Monitoring
- [ ] Integrate Sentry or similar RUM tool
- [ ] Set up error boundary components
- [ ] Add performance metrics tracking
- [ ] Create error logging pipeline
- [ ] Set up alerting for critical errors

### SEO & Meta Tags
- [ ] Add next/head with proper meta tags
- [ ] Generate sitemap.xml
- [ ] Add robots.txt
- [ ] Implement structured data (JSON-LD)
- [ ] Add Open Graph tags

---

## 🔐 Phase 5: Security Hardening (PLANNED)

### Frontend Security
- [ ] Add Content Security Policy headers
- [ ] Implement CSRF protection for forms
- [ ] Add rate limiting for API routes
- [ ] Sanitize user inputs (DOMPurify)
- [ ] Add XSS protection headers

### Backend Security
- [ ] Implement request validation middleware
- [ ] Add SQL injection prevention (parameterized queries)
- [ ] Set up API rate limiting
- [ ] Add JWT token refresh mechanism
- [ ] Implement role-based access control (RBAC)

### Dependency Management
- [ ] Set up Dependabot for automated updates
- [ ] Configure Snyk vulnerability scanning
- [ ] Create security policy (SECURITY.md)
- [ ] Schedule weekly dependency audits
- [ ] Pin production dependencies

---

## 📊 Phase 6: Advanced Testing (PLANNED)

### Visual Regression Testing
- [ ] Set up Percy or Chromatic
- [ ] Create visual baselines for key pages
- [ ] Add visual tests to CI pipeline
- [ ] Document visual testing workflow

### Load Testing
- [ ] Set up k6 or Artillery
- [ ] Create load test scenarios
- [ ] Test API endpoints under load
- [ ] Document performance benchmarks

### Accessibility Audits
- [ ] Schedule quarterly manual audits
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Test with keyboard-only navigation
- [ ] Test with voice control
- [ ] Document a11y testing procedures

---

## 🎯 Success Metrics

### Code Quality
- Unit test coverage: **Goal 80%+** (Current: N/A)
- E2E test coverage: **All critical flows**
- Lint warnings: **0** (enforced in CI)
- Accessibility violations: **0 critical/serious**

### Performance
- Lighthouse Score: **90+** (Performance, Accessibility, Best Practices, SEO)
- Core Web Vitals: **Pass all metrics**
- Bundle size: **< 200KB gzipped**
- Time to Interactive: **< 3s on 3G**

### Security
- npm audit: **0 critical/high vulnerabilities**
- OWASP Top 10: **All mitigated**
- Security headers: **A+ on securityheaders.com**
- CSP violations: **0 in production**

---

## 📝 Next Actions (Priority Order)

1. **Refactor remaining pages to AsyncStateNotice pattern**
   - Login, Customer Portal, Admin Portal, Enrollments, Tickets
   - Ensures consistent async feedback across application

2. **Add Playwright E2E tests for critical flows**
   - Login → Dashboard
   - Form submission (contact, application)
   - Navigation and keyboard accessibility

3. **Extract reusable DataTable and Modal components**
   - Standardize data display patterns
   - Ensure keyboard navigation and focus management

4. **Expand Axe test coverage to all components**
   - ServiceHighlight, Testimonial, TeamMember, StyledForm, LiveChatWidget
   - Validate zero violations before production

5. **Implement performance monitoring**
   - Next.js built-in analytics or Lighthouse CI
   - Track Core Web Vitals in production

6. **Set up Dependabot and security scanning**
   - Automated dependency updates
   - Weekly vulnerability scans

---

## 🔗 Related Documentation

- [TESTING.md](./TESTING.md) - Testing guide and patterns
- [backend/INTEGRATION.md](./backend/INTEGRATION.md) - Sales Center integration details
- [backend/.env.example](./backend/.env.example) - Required environment variables
- [.github/workflows/](..github/workflows/) - CI/CD pipeline configuration

---

## 📞 Support & Resources

- **Sales Center Alignment**: Review Sales Center patterns before implementation
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Practices**: https://www.w3.org/WAI/ARIA/apg/
- **Next.js Docs**: https://nextjs.org/docs
- **Playwright Docs**: https://playwright.dev/
- **Vitest Docs**: https://vitest.dev/

---

**Last Updated**: March 8, 2026
**Status**: Phase 1 ✅ Complete | Phase 2 ✅ Complete (Pages Refactored)
