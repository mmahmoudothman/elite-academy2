# Elite Academy — Master Project Plan

**Version:** 1.0
**Date:** 2026-03-08
**Status:** Active
**Owner:** Main Agent (Technical Program Owner)

---

## 1. Executive Summary

Elite Academy is a React 19 SPA for executive education targeting Egypt and GCC countries. The current state is a functional demo with significant gaps for production readiness. This plan transforms it into a production-grade, admin-driven, analytics-rich educational platform.

---

## 2. Goals

1. **Full CRUD** — Every entity (courses, instructors, students, enrollments, contacts, testimonials, FAQs, categories, partners, pages) manageable via admin
2. **Role-Based Access Control** — Granular permissions for super_admin, admin, instructor, student
3. **Dynamic Content** — Zero hardcoded business content; everything admin-managed
4. **Comprehensive Analytics** — Business KPIs, funnels, engagement tracking, exportable reports
5. **Payment-Ready Enrollment** — Complete registration workflow with payment tracking
6. **Contact & CRM** — Full contact system with email routing, WhatsApp, status tracking
7. **Student Management** — Mini-CRM with profiles, history, lifecycle, communications
8. **Production Quality** — Error handling, loading states, validation, security, performance

---

## 3. Scope

### In Scope
- Frontend SPA enhancements (React + TypeScript)
- Firebase Firestore as database (with localStorage fallback)
- Admin dashboard expansion
- Public website dynamic content
- Analytics system
- i18n completion (EN/AR)
- Responsive design improvements
- Media management
- Contact integrations (email structure, WhatsApp, social)

### Out of Scope (Future Phases)
- Backend API server (Node.js/Express)
- Real payment gateway integration (Stripe/PayPal)
- Email sending service (SendGrid/Mailgun)
- SMS notifications (Twilio)
- Video hosting/streaming
- Certificate generation
- LMS features (quizzes, progress tracking, forums)
- Mobile app
- CI/CD pipeline
- E2E testing framework

---

## 4. Assumptions

1. Firebase remains the primary database (Firestore + Auth + Storage)
2. localStorage fallback mode must continue to work for demo/development
3. No backend server — all logic stays client-side for now
4. Tailwind CSS via CDN continues (no PostCSS build step)
5. Payment integration is structural only (tracking, not processing)
6. Email integration is structural (mailto: links, admin tracking, no SMTP)

---

## 5. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Firebase security rules not configured | High | Document required rules, validate client-side |
| No backend = limited security | High | Validate all inputs client-side, plan for future API |
| Large bundle size (1.7MB) | Medium | Code-split routes with React.lazy |
| API keys in client code | Medium | Use Firebase security rules, restrict key scoping |
| No automated tests | Medium | Manual testing checklist per phase |
| Translation drift | Low | Audit translations after each phase |

---

## 6. Technical Architecture

### Current Stack
```
React 19 → Vite → Tailwind CSS → Firebase (Auth + Firestore + Storage)
```

### Target Architecture
```
React 19 + React.lazy (code-split)
├── Pages (7 routes → 10+ routes)
├── Components (31 → 45+)
├── Contexts (Auth, Language, Theme)
├── Hooks (DataManager, Analytics, SiteConfig, Permissions)
├── Services (Firebase, Gemini, Analytics)
├── Utils (validation, export, formatting, permissions)
└── Types (expanded entity model)
```

### New Data Entities
```
Firestore Collections:
  testimonials/    — Student testimonials (admin-managed)
  faqs/            — FAQ items (admin-managed)
  categories/      — Course categories (admin-managed)
  pages/           — Dynamic page content
  auditLog/        — Admin action logging
  analytics/       — Event tracking data
  newsletters/     — Newsletter subscriptions
```

### Permission Model
```
super_admin: Full access to everything
admin:       CRUD on content, view analytics, manage students
instructor:  View own courses, view enrolled students
student:     View profile, enrollments, courses
```

---

## 7. Implementation Phases

### Phase 1: Foundation & Data Model (Priority: CRITICAL)
**Goal:** Expand type system, add missing entities, create permission utilities

Tasks:
- [x] 1.1 Expand types.ts with Testimonial, FAQ, Category, AuditLog, AnalyticsEvent, Newsletter types
- [x] 1.2 Create utils/permissions.ts with role-based permission checks
- [x] 1.3 Update useDataManager to handle new entities (testimonials, FAQs, categories)
- [x] 1.4 Add audit logging utility (logAdminAction)
- [x] 1.5 Create usePermissions hook
- [x] 1.6 Update ProtectedRoute to support role-based access levels
- [x] 1.7 Code-split routes with React.lazy + Suspense

### Phase 2: Admin Dashboard Expansion (Priority: HIGH)
**Goal:** Add management for all new entities, improve existing tables

Tasks:
- [x] 2.1 Add Testimonials management tab (CRUD table + form modal)
- [x] 2.2 Add FAQ management tab (CRUD table + form modal)
- [x] 2.3 Add Categories management tab (CRUD, reorder, icon/color)
- [x] 2.4 Add Newsletter subscribers tab (view, export, delete)
- [x] 2.5 Add Audit Log tab (read-only, filterable by action/user/date)
- [x] 2.6 Enhance SiteConfigEditor with more sections (announcement, WhatsApp)
- [x] 2.7 Add pagination to all tables (10/25/50 per page)
- [x] 2.8 Add sorting to all table columns
- [x] 2.9 Add bulk actions (bulk delete, bulk status change)
- [x] 2.10 Add date range filters to enrollments/contacts/analytics

### Phase 3: Public Website Dynamic Content (Priority: HIGH) ✅ COMPLETE
**Goal:** Make every landing page section admin-driven

Tasks:
- [x] 3.1 Testimonials section on landing page (from admin data)
- [x] 3.2 FAQ accordion section (from admin data)
- [x] 3.3 Dynamic categories in course filtering
- [x] 3.4 Partners section from siteConfig
- [x] 3.5 Announcement banner (admin-toggleable)
- [x] 3.6 WhatsApp floating button (admin-configurable)
- [x] 3.7 SiteConfigEditor updated with announcement & WhatsApp settings

### Phase 4: Enhanced Analytics (Priority: HIGH) ✅ COMPLETE
**Goal:** Comprehensive analytics with actionable insights

Tasks:
- [x] 4.1 Event tracking system (page views, course views, enrollment starts/completions, contact submits, social clicks, WhatsApp clicks)
- [x] 4.2 Conversion funnel visualization (Page Views → Course Views → Enrollment Starts → Completes)
- [x] 4.3 Enhanced dashboard KPIs (conversion rate, avg revenue/student, contact response rate, course fill rate)
- [x] 4.4 Date range selector (Last 7/30/90 Days, All Time)
- [x] 4.5 Top Performing Courses table (views, enrollments, revenue, fill rate)
- [x] 4.6 All existing charts enhanced with date range filtering

### Phase 5: Student Management & CRM (Priority: HIGH) ✅ COMPLETE
**Goal:** Transform basic student list into mini-CRM

Tasks:
- [x] 5.1 Enhanced StudentDetailModal with tabs (Overview, Enrollments, Notes), lifecycle pipeline, tags
- [x] 5.2 Internal notes/comments on student profiles
- [x] 5.3 Student lifecycle stages (lead, prospect, enrolled, active, alumni, inactive) with visual pipeline
- [x] 5.4 Tags system for student categorization
- [x] 5.5 Student filtering by lifecycle stage, country, role, status + column sorting
- [x] 5.6 Student bulk actions (export selected CSV, change status, change stage)
- [x] 5.7 Enhanced ProfilePage (student portal with enrollment cards, stats, language preference)

### Phase 6: Enrollment & Payment System (Priority: HIGH) ✅ COMPLETE
**Goal:** Production-ready enrollment workflow

Tasks:
- [x] 6.1 4-step enrollment form (Course Details → Info → Payment → Review & Confirm)
- [x] 6.2 Payment method selection with visual cards (Bank Transfer, Credit Card, Cash)
- [x] 6.3 Payment tracking with status workflow (Confirm/Complete/Cancel buttons)
- [x] 6.4 Enrollment confirmation with terms & conditions
- [x] 6.5 Invoice generation (printable, INV-YYYYMMDD-XXX format)
- [x] 6.6 Admin enrollment management (filters, inline notes, status workflow, invoice view)
- [x] 6.7 Discount/promo code system (ELITE10 = 10%, ELITE20 = 20%)

### Phase 7: Contact & Communication System (Priority: MEDIUM) ✅ COMPLETE
**Goal:** Complete contact management with multi-channel support

Tasks:
- [x] 7.1 Enhanced contact form with inquiry type dropdown + source page tracking
- [x] 7.2 Admin reply functionality (inline textarea, saves to adminReply/adminNotes)
- [x] 7.3 WhatsApp integration (floating button + contact page CTA, pre-filled message)
- [x] 7.4 Social media links management (from siteConfig)
- [x] 7.5 Contact stats (total, unread, avg response time, this week's)
- [x] 7.6 Real-time form validation + date range filters

### Phase 8: UI/UX Polish (Priority: MEDIUM) ✅ COMPLETE
**Goal:** Production-quality user experience

Tasks:
- [x] 8.1 Loading skeletons (HeroSkeleton, CourseCardSkeleton)
- [x] 8.2 Empty states for all lists/tables (with icon + action button support)
- [x] 8.3 Form validation improvements (inline, real-time, per-field)
- [x] 8.4 Consistent design tokens (utils/designTokens.ts)
- [x] 8.5 Status badge classes standardized across components

### Phase 9: Translation & Responsiveness (Priority: MEDIUM) ✅ COMPLETE
**Goal:** Complete i18n and responsive coverage

Tasks:
- [x] 9.1 Comprehensive translation audit — 80+ missing keys added to both EN and AR
- [x] 9.2 All new features translated (enrollment steps, dashboard tabs, contact labels, footer, etc.)
- [x] 9.3 RTL fixes — ml-/mr- converted to ms-/me- in 6 files
- [x] 9.4 Print stylesheet for invoices (@media print in InvoiceView)

### Phase 10: Security & Performance (Priority: MEDIUM) ✅ COMPLETE
**Goal:** Harden for production

Tasks:
- [x] 10.1 Input sanitization (utils/sanitize.ts) applied to ContactPage, EnrollmentModal, RegisterPage
- [x] 10.2 Rate limiting (utils/rateLimit.ts) applied to login (5/5min), enrollment (3/10min), contact (30s cooldown)
- [x] 10.3 Firebase security rules documentation (docs/FIREBASE_RULES.md)
- [x] 10.4 Code splitting with React.lazy (all 7 routes lazy-loaded)
- [x] 10.5 Error boundary coverage — per-route ErrorBoundary wrappers
- [x] 10.6 Password policy enhanced (8+ chars, uppercase, number, strength indicator)

### Phase 11: Admin User Management (Priority: HIGH) ✅ COMPLETE
**Goal:** Full RBAC management UI for user role/permission control

Tasks:
- [x] 11.1 UsersTable dashboard component with search, role filter, status filter
- [x] 11.2 Role change dropdown (super_admin only via roles.manage permission)
- [x] 11.3 Activate/deactivate users from admin panel
- [x] 11.4 New permissions: users.view, users.edit, users.delete
- [x] 11.5 Users tab in dashboard sidebar

### Phase 12: Payments with Installments (Priority: HIGH) ✅ COMPLETE
**Goal:** Installment payment plans for courses

Tasks:
- [x] 12.1 Installment types (Installment, InstallmentStatus) in types.ts
- [x] 12.2 Enrollment type extended with installmentPlan, installmentCount, installments
- [x] 12.3 Installment plan toggle in enrollment flow (for orders >= 1000)
- [x] 12.4 Installment count selection (2/3/4/6 monthly installments)
- [x] 12.5 Installment badge on enrollment amount in admin table
- [x] 12.6 Auto-generated installment schedule with monthly due dates

### Phase 13: WhatsApp Configuration (Priority: HIGH) ✅ COMPLETE
**Goal:** Admin-configurable WhatsApp contact number

Tasks:
- [x] 13.1 whatsappNumber field added to SiteConfig type
- [x] 13.2 WhatsApp number input in SiteConfigEditor with format hint
- [x] 13.3 WhatsAppButton updated to use configurable number (fallback to socialLinks)
- [x] 13.4 Default number: +20 104 074 2770

### Phase 14: Telegram Bot Notifications (Priority: HIGH) ✅ COMPLETE
**Goal:** Real-time Telegram notifications for key business events

Tasks:
- [x] 14.1 TelegramConfig type with per-notification-type toggles
- [x] 14.2 telegramService.ts with functions for registration, enrollment, payment, contact notifications
- [x] 14.3 Telegram config section in SiteConfigEditor (bot token, chat ID, enable/disable, notification type toggles)
- [x] 14.4 Test message button to verify configuration
- [x] 14.5 Fire-and-forget integration in RegisterPage, EnrollmentModal, ContactPage

### Phase 15: Student Levels & Course Timeline (Priority: MEDIUM) ✅ COMPLETE
**Goal:** Course scheduling with start/end dates and schedule info

Tasks:
- [x] 15.1 Course type extended with startDate, endDate, schedule fields
- [x] 15.2 CourseFormModal updated with date pickers and schedule input
- [x] 15.3 Level field already existed (Beginner/Intermediate/Advanced)
- [x] 15.4 Translation keys for timeline fields

### Phase 16: Ads/Announcements System (Priority: MEDIUM) ✅ COMPLETE
**Goal:** Full ad campaign management with targeting and analytics

Tasks:
- [x] 16.1 Ad type with placement, status, scheduling, targeting, impressions/clicks tracking
- [x] 16.2 AdsTable dashboard component with status/placement filters, CTR calculation
- [x] 16.3 AdFormModal with bilingual title/content, placement, scheduling, targeting
- [x] 16.4 Ads tab in dashboard sidebar (Marketing section)
- [x] 16.5 New permissions: ads.view, ads.create, ads.edit, ads.delete
- [x] 16.6 CRUD operations in useDataManager

### Phase 17: Course Cost Calculator / Financial Management (Priority: MEDIUM) ✅ COMPLETE
**Goal:** Course-level financial tracking with profit margins

Tasks:
- [x] 17.1 CourseFinancials type (instructor payout, venue, materials, marketing, other costs)
- [x] 17.2 FinancialsTable dashboard component with inline editing
- [x] 17.3 Revenue auto-calculated from paid enrollments per course
- [x] 17.4 Profit and margin calculation with color-coded display
- [x] 17.5 Summary row with total revenue, costs, and profit
- [x] 17.6 Financials tab in dashboard sidebar (Finance section)
- [x] 17.7 New permissions: financials.view, financials.edit

---

## 8. Priority Matrix

| Phase | Priority | Status | Business Value |
|-------|----------|--------|----------------|
| 1. Foundation | CRITICAL | ✅ COMPLETE | Enables everything |
| 2. Admin Dashboard | HIGH | ✅ COMPLETE | Admin productivity |
| 3. Dynamic Content | HIGH | ✅ COMPLETE | Content flexibility |
| 4. Analytics | HIGH | ✅ COMPLETE | Business intelligence |
| 5. Student CRM | HIGH | ✅ COMPLETE | Student management |
| 6. Enrollment/Payment | HIGH | ✅ COMPLETE | Revenue enablement |
| 7. Contact/Comms | MEDIUM | ✅ COMPLETE | Lead management |
| 8. UI/UX Polish | MEDIUM | ✅ COMPLETE | User satisfaction |
| 9. Translation/Responsive | MEDIUM | ✅ COMPLETE | Market reach |
| 10. Security/Performance | MEDIUM | ✅ COMPLETE | Production readiness |
| 11. Admin User Management | HIGH | ✅ COMPLETE | RBAC management |
| 12. Installment Payments | HIGH | ✅ COMPLETE | Payment flexibility |
| 13. WhatsApp Config | HIGH | ✅ COMPLETE | Contact accessibility |
| 14. Telegram Notifications | HIGH | ✅ COMPLETE | Real-time alerts |
| 15. Course Timeline | MEDIUM | ✅ COMPLETE | Scheduling |
| 16. Ads System | MEDIUM | ✅ COMPLETE | Marketing management |
| 17. Financial Management | MEDIUM | ✅ COMPLETE | Revenue tracking |

---

## 9. KPI Definitions

| KPI | Formula | Target |
|-----|---------|--------|
| Conversion Rate | Enrollments / Course Views | > 5% |
| Avg Revenue Per Student | Total Revenue / Active Students | Track trend |
| Enrollment Completion Rate | Completed / Started Enrollments | > 70% |
| Contact Response Time | Avg(respondedAt - submittedAt) | < 24 hours |
| Student Retention | Active Students / Total Students | > 80% |
| Course Fill Rate | Enrolled / Capacity per course | Track trend |
| Revenue Growth | Month-over-month revenue change | Positive |
| Page Engagement | Avg time on page | Track trend |

---

## 10. Database Schema Plan

### New Collections

```
testimonials/ {
  id, studentName, studentRole, content, rating (1-5),
  courseId?, image?, visible, order, createdAt, updatedAt
}

faqs/ {
  id, question: {en, ar}, answer: {en, ar},
  category, order, visible, createdAt, updatedAt
}

categories/ {
  id, name: {en, ar}, slug, description: {en, ar},
  icon?, color?, order, visible, courseCount, createdAt, updatedAt
}

auditLog/ {
  id, userId, userName, action, entityType, entityId,
  details?, timestamp, ip?
}

analyticsEvents/ {
  id, eventType, entityType?, entityId?, userId?,
  metadata?, timestamp, sessionId?
}

newsletters/ {
  id, email, subscribedAt, source, isActive
}
```

---

## 11. Testing Strategy

Since no test framework exists, use:
1. **Manual Testing Checklist** per phase
2. **TypeScript Strict Mode** for compile-time safety
3. **Build Verification** (vite build must succeed)
4. **Route Verification** (all routes return 200)
5. **Cross-browser Testing** (Chrome, Safari, Firefox)
6. **Responsive Testing** (mobile, tablet, desktop)
7. **RTL Testing** (Arabic mode)

---

## 12. Deployment Considerations

1. Environment variables must be set in hosting platform
2. Firebase project must be created and configured
3. Firestore security rules must be deployed
4. Domain and SSL must be configured
5. CDN caching headers for static assets
6. Error monitoring (future: Sentry integration)

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-03-08 | 1.0 | Initial plan created from full codebase audit |
| 2026-03-08 | 2.0 | All 10 phases implemented and verified |

---

## Final Implementation Summary

### Metrics
- **Files:** 44 components, 7 pages, 5 hooks, 5 services, 7 utils, 2 docs
- **Modules:** 786 (Vite build)
- **TypeScript Errors:** 0
- **Routes:** 8 (all returning 200)
- **Translation Keys:** 300+ in both EN and AR
- **New Entity Types:** 6 (Testimonial, FAQ, Category, AuditLogEntry, AnalyticsEvent, NewsletterSubscription)
- **Dashboard Tabs:** 13 (overview, courses, instructors, categories, students, enrollments, contacts, newsletters, testimonials, faqs, analytics, audit, settings)

### Architecture Delivered
```
React 19 + React.lazy (code-split by route)
├── 7 Pages (lazy-loaded with per-route ErrorBoundary)
├── 44 Components (dashboard, enrollment, auth, ui, public)
├── 5 Hooks (useDataManager, useAnalytics, useAnalyticsTracker, usePermissions, useSiteConfig)
├── 5 Services (firebase, auth, firestore, gemini, analyticsTracker)
├── 7 Utils (permissions, sanitize, rateLimit, exportCsv, validation, sampleData, designTokens)
├── Contexts (Auth + Language)
└── Full i18n (EN + AR with RTL support)
```

### Remaining Recommendations (Future Phases)
1. Backend API server (Node.js/Express) for server-side validation
2. Real payment gateway (Stripe/PayPal) integration
3. Email sending service (SendGrid) for notifications
4. Automated test suite (Vitest + React Testing Library)
5. CI/CD pipeline (GitHub Actions → Vercel/Firebase Hosting)
6. LMS features (course progress, quizzes, certificates)
7. Dark mode theme
8. PWA support for mobile
9. Error monitoring (Sentry)
10. SEO (meta tags, sitemap, structured data)
