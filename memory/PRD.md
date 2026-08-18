# Prime Journey India — PRD

## Original Problem Statement
Premium immersive Indian travel website "Prime Journey India" (India, Your Way.) — visually exceptional frontend; refinement pass added: Playfair Display typography, 6-slide cinematic hero (Rajasthan/Pangong/Amritsar/Kashmir/Jaipur/Wagah) with layered transitions, in-hero torn-paper animated price card, alias-driven hero search, clickable internal destination/package pages, reviews, Prime HomeEase band, floating contact rail, Vedanta Web footer credit, removal of public Login (Feedback instead), and REAL backend-connected admin auth with alias→internal-account mapping and role permissions.

## Architecture
- Frontend: React 19 + CRA, Tailwind, framer-motion, Lenis. Fonts: Playfair Display (headings), Manrope (UI), Cormorant Garamond (editorial accents).
- Data: `src/data/` — siteConfig (incl. centralized `assets` map for logo/founder/co-founders), destinations (+heroSlides), packages (7, full detail data), experiences, company, searchIndex (alias/fuzzy search).
- Services: `src/services/mockService.js` — enquiryService posts to real backend `/api/enquiries` with localStorage fallback; adminService = real JWT admin API; authService reserved for future customer accounts (public login removed by spec).
- Backend: FastAPI + MongoDB (`server.py`) — `/api/enquiries` (public intake), admin auth: POST `/api/admin/auth/login` (alias→internal account, bcrypt, JWT 12h, 5-strike/15-min lockout), GET `/api/admin/auth/me|overview|enquiries`, GET `/api/admin/settings` (master-only, 403 otherwise). Idempotent seeding of 4 admins from `ADMIN_INITIAL_PASSWORD` env.
- Assets: drop real `logo.png`, `founder.jpeg`, `cofounder1.jpeg`, `cofounder2.jpeg` into `frontend/public/assets/` — every usage (homepage, About, admin welcome, dashboard) updates automatically via PersonImage/Logo fallback components. NOT YET UPLOADED by user — monogram fallbacks active.
- Routes: `/`, `/about`, `/admin`, `/destinations/:id`, `/packages/:id`.

## Implemented
- 2026-08-17 (build 1): full cinematic homepage, effects engine, torn-paper offer, packages, seasons, styles, experiences, why-us, leadership, customize, contact+map, footer, WhatsApp, booking/auth mock.
- 2026-08-17 (refinement): typography overhaul (Playfair/Cormorant), 6-slide hero with new vibrant verified photography (Mehrangarh blue-sky, Pangong turquoise, Golden Temple, Kashmir snow, Hawa Mahal, Wagah ceremony), cinematic in/out transitions + continuous 100→106% zoom, in-hero torn-paper offer with animated per-slide price, hero search (aliases, e.g. "india pakistan"→Wagah), destination & package detail pages (itinerary/highlights/inclusions/exclusions/stay/meals/transfers/best-time/gallery/related), all cards/chips clickable internally, premium Why Us with editorial image, Reviews carousel, Prime HomeEase band, floating contact rail (desktop rail + mobile expandable; FB/X/YT env-gated), Feedback modal (replaces public Login), footer Vedanta Web credit, real backend admin auth with alias mapping + personalized welcomes + identity chip + role-based settings enforcement.

- 2026-08-18 (hero-only update): new FIRST master brand slide — "Travel with Prime Journey India" / "Save More. Travel More. Live More." (third line gold italic) / "Your perfect Indian escape, without the unnecessary spend." with one AI-generated realistic family-with-suitcases photo (`/assets/hero-family.webp`, 77KB, eager+high priority). All existing slides keep order/content; offer card hidden only on master. Golden Temple + Wagah hero PNGs converted to same-pixels WebP (2.8MB→281KB, 3.6MB→480KB) at `/images/*-hero.webp`; originals untouched. Subsequent slides lazy-load; only master preloads at high priority. Removed a stray `)}` text glitch under hero CTAs. `yarn build` passes.

## Verified (2026-08-17)
- curl: admin login (Master/Dheeraj), me, enquiries, settings 200 master / 403 non-master, 401 wrong-password & no-token, enquiry POST → PJI-0101.
- Screenshots: hero slides 1–2 + torn offer price animating, search fuzzy match, package page (price ₹29,999, itinerary), Kashmir destination page, admin full flow (Welcome, Mr. Ramesh; identity chip; real enquiry row PJI-0101; settings restriction), reviews, HomeEase, footer credit, feedback submit → PJI-0102, mobile hero (offer visible, no overflow).

## Credentials
See /app/memory/test_credentials.md. Admin aliases: Master@pji.com / Ramesh@pji.com / Abhishek@pji.com / Dheeraj@pji.com, shared initial password in backend/.env (`ADMIN_INITIAL_PASSWORD`, never in frontend).

## Backlog
- P0: upload real logo + founder photos into public/assets/.
- P1: Facebook/YouTube/X URLs (env), Hindi/Punjabi translations.
- P2: admin content CRUD, enquiry status management, payment integration, CMS.
