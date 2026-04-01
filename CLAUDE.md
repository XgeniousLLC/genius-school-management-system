# CLAUDE.md — xgenious School Management System

> This file is the canonical guide for all Claude Code development sessions on this project.
> Read this file at the start of every session before writing any code.

---

## Project Identity

| Field | Value |
|---|---|
| Project | xgenious School Management System (SMS) |
| Type | Laravel + Inertia.js + React (Monolithic SPA) |
| Edition | Free & Open Source |
| Version | 1.0.0 |
| SRS Reference | `requirements/00-overview.md` |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Backend | Laravel | 11 |
| Language | PHP | 8.3 |
| Frontend | React + TypeScript | 18 |
| Bridge | Inertia.js | latest |
| State Management | Zustand | latest |
| UI Components | shadcn/ui + Tailwind CSS | latest |
| Database | MySQL | 8 |
| Cache / Queue | Redis + Laravel Horizon | latest |
| Auth | Laravel Sanctum + Spatie RBAC | latest |
| PDF | Laravel DomPDF / Snappy | latest |
| Storage | Laravel Storage (S3-compat / MinIO) | latest |
| Testing | PestPHP + Vitest + Playwright | latest |

---

## Directory Structure

```
app/
  Modules/
    {ModuleName}/
      Controllers/
      Models/
      Services/
      Requests/
      Resources/
resources/
  js/
    Pages/
      {Module}/          ← Inertia page components
    Components/          ← Shared UI components
    Stores/
      *.ts               ← Zustand store slices
    Types/
      *.ts               ← Shared TypeScript types
requirements/
  00-overview.md         ← Full SRS overview
  modules/
    01-authentication-access-control.md
    02-school-setup-configuration.md
    03-student-management.md
    04-staff-hr-management.md
    05-attendance-management.md
    06-timetable-scheduling.md
    07-examination-results.md
    08-fee-management.md
    09-library-management.md
    10-transport-management.md
    11-homework-lesson-planning.md
    12-communication.md
    13-reports-analytics.md
    14-system-administration.md
    15-mobile-pwa-api.md
```

---

## Module Development Status

Track the current sprint and completed modules here. Update after each sprint.

| # | Module | Status | Sprint |
|---|---|---|---|
| 01 | Authentication & Access Control | ✅ Done (Sprint 1) | Sprint 1–2 |
| 01 | Auth & Tenancy — Multi-school, Super Admin scaffold | ✅ Done (Sprint 2) | Sprint 2 |
| 01 | Schools CRUD — Super Admin Schools Management | ✅ Done (Sprint 2B) | Sprint 2B |
| 02 | School Setup & Configuration | ✅ Done (Sprint 3) | Sprint 3 |
| 03 | Student Management | ✅ Done (Sprint 4) | Sprint 4 |
| 16 | Admission Inquiry & Visitor Management | Pending | Sprint 4B |
| 04 | Staff & HR Management (Basic) | ✅ Done (Sprint 5) | Sprint 5 |
| 05 | Attendance Management | ✅ Done (Sprint 6) | Sprint 6 |
| 06 | Timetable & Scheduling | ✅ Done (Sprint 7) | Sprint 7 |
| 07 | Examination & Results | ✅ Done (Sprint 8) | Sprint 8 |
| 08 | Fee Management | ✅ Done (Sprint 9) | Sprint 9–10 |
| 04 | Staff & HR Management (Advanced) | ✅ Done (Sprint 11) | Sprint 11 |
| 09 | Library Management | ✅ Done (Sprint 12) | Sprint 12 |
| 18 | Inventory & Asset Management | ✅ Done (Sprint 12B) | Sprint 12B |
| 10 | Transport Management | ✅ Done (Sprint 13) | Sprint 13 |
| 17 | Hostel Management | ✅ Done (Sprint 13B) | Sprint 13B |
| 11 | Homework & Lesson Planning | ✅ Done (Sprint 14) | Sprint 14 |
| 12 | Communication | ✅ Done (Sprint 15) | Sprint 15 |
| 13 | Reports & Analytics | ✅ Done (Sprint 16) | Sprint 16 |
| 14 | System Administration | Pending | Sprint 17 |
| 15 | Mobile PWA & API | Pending | Sprint 17 |
| 19 | Subscription & Package Management | Pending | Sprint 17B |

> Update status to: `In Progress` → `Done` as each sprint completes.

---

## Session Rules (Read Before Every Sprint)

### 1. Always reference the module requirements file
Before writing code for any module, read the corresponding file in `requirements/modules/`.

### 2. Follow the sprint order
Do not skip sprints. Each phase depends on the previous. The order is:
`Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7`

### 3. Multi-tenancy is non-negotiable
Every model must:
- Have a `school_id` FK column (indexed)
- Use the global Eloquent scope that automatically applies `school_id`
- Never return data across school boundaries

### 4. Inertia-first, not API-first (for pages)
- Page rendering goes through Inertia — no separate API call for page data
- REST endpoints in `/api/v1/` are only for external consumers and AJAX sub-requests (live search, file uploads, mobile app)

### 5. Queue everything slow
- PDF generation → dispatch to queue, return a polling URL or notify when done
- Bulk imports → queue with progress tracking
- SMS/email blasts → queue via Horizon

### 6. No N+1 queries
- Always eager load relationships
- Use `with()`, `load()`, or `loadMissing()` appropriately
- Check with Laravel Telescope or query log during development

### 7. TypeScript types for all Inertia props
- Every page component receives typed props defined in `resources/js/Types/`
- No `any` types on Inertia page props

### 8. Zustand for global state only
- Local UI state → `useState`
- Cross-component shared state → Zustand store slices in `resources/js/Stores/`
- Do not put API response data in Zustand unless it's truly global (e.g., current user, unread notifications)

### 9. shadcn/ui components as the foundation
- Use shadcn/ui components before writing custom components
- Dark mode via Tailwind `dark:` classes — do not use separate CSS files for theming
- Keep accessibility (ARIA) intact — do not strip ARIA attributes from shadcn components

### 10. Security defaults
- Never use raw SQL — Eloquent parameterized queries only
- Never use `dangerouslySetInnerHTML`
- Validate all file uploads (MIME type + size)
- Store uploaded files outside webroot (use `storage/app/private` or S3)
- Rate limit all API routes

---

## Key Packages

| Package | Purpose |
|---|---|
| `spatie/laravel-permission` | Roles & permissions |
| `spatie/laravel-activitylog` | Audit logging |
| `spatie/laravel-backup` | Database & file backups |
| `pragmarx/google2fa` | TOTP 2FA |
| `laravel/horizon` | Queue monitoring |
| `barryvdh/laravel-dompdf` | PDF generation |
| `maatwebsite/laravel-excel` | Excel import/export |
| `darkaonline/l5-swagger` | API documentation |
| `tanstack/react-table` | DataTable with sorting/filtering |
| `react-hook-form` + `zod` | Form validation |
| `recharts` | Charts and graphs |
| `react-dnd` | Drag-and-drop (timetable builder) |
| `jsqr` | QR code scanning |
| `workbox` | PWA service worker |

---

## Database Conventions

All tables must include:
```sql
id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
school_id   BIGINT UNSIGNED NOT NULL INDEX (FK to schools.id)
created_at  TIMESTAMP
updated_at  TIMESTAMP
deleted_at  TIMESTAMP NULL  -- soft deletes on all major tables
```

---

## API Response Format

All REST API responses follow JSON:API-lite:
```json
{
  "data": {},
  "meta": { "total": 100, "per_page": 15, "current_page": 1 },
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "message": "Success"
}
```

---

## Environment Variables Reference

| Variable | Example | Purpose |
|---|---|---|
| `APP_URL` | `https://school.example.com` | Base URL |
| `DB_CONNECTION` | `mysql` | Database driver |
| `REDIS_HOST` | `redis` | Cache / queue |
| `MAIL_MAILER` | `smtp` | Email driver |
| `STRIPE_SECRET` | `sk_live_...` | Payment gateway |
| `VONAGE_API_KEY` | `abc123` | SMS gateway |
| `AWS_BUCKET` | `sms-files` | File storage |
| `MULTITENANCY_MODE` | `subdomain` / `path` | Tenant routing |
| `SUPER_ADMIN_EMAIL` | `admin@xgenious.com` | First super admin |

---

## Sprint Checklist Template

Use this checklist at the start of each sprint session:

- [ ] Read the module requirements file in `requirements/modules/`
- [ ] Check `CLAUDE.md` Module Development Status table — confirm prerequisites are `Done`
- [ ] Confirm all migrations follow database conventions (school_id, soft deletes)
- [ ] Confirm all models have the global `school_id` scope applied
- [ ] Confirm API routes are grouped under `/api/v1/` with Sanctum middleware
- [ ] Confirm Inertia page components have typed props
- [ ] Confirm slow operations (PDF, bulk, email) are queued
- [ ] Run `php artisan test` and `npm run type-check` before ending session
- [ ] Update the Module Development Status table in this file
