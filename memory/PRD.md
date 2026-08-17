# Prime Journey India — PRD

## Original Problem Statement
Build a high-end, production-quality, visually exceptional frontend website for an Indian travel company "Prime Journey India" (PrimeJourneyIndia.com), tagline "India, Your Way." Priority: photography, typography, graphics, animation, composition, interaction, responsiveness. Bright, colorful, premium, cinematic. Explicitly NOT to spend effort on production MongoDB/auth/backend — those are implemented manually after code export. Real Unsplash travel photography only; cinematic rotating hero (Rajasthan → Kashmir → Amritsar) with environmental effects (snow, rain, mist, sun rays, clouds, birds, water ripple, dust, flags, stars); torn-paper price campaign graphic; animated price counters; season explorer; travel styles; experiences; why-us; founders; customize form; booking modal; login UI; admin welcome screens (Master, Dheeraj, Abhishek, Ramesh); About page; Contact with Google Map; premium footer; floating WhatsApp; Prime HomeEase sister-brand link prominent near top. Exportable, clean architecture, .env.example.

## Architecture
- React 19 + CRA/craco, Tailwind CSS, framer-motion, Lenis smooth scroll, lucide-react icons, sonner toasts.
- Fonts: Plus Jakarta Sans (headings), Manrope (body/UI), DM Serif Display (editorial accents).
- Palette: ocean #0A2540, turquoise #1ABC9C, saffron #FF9933, gold #D4AF37, coral #FF7F50, off-white, charcoal ink.
- Data layer isolated in `src/data/` (siteConfig, destinations, packages, experiences, company) — ready to swap for a CMS/API.
- Service layer isolated in `src/services/mockService.js` (localStorage-backed auth + enquiries) — replace with real API calls after export; no component touches storage directly.
- `src/components/effects/EnvironmentEffects.jsx` — reusable canvas/CSS effect layers (Snow 3-depth canvas, Rain canvas, SunRays, Clouds, Mist, Birds, WaterShimmer, Droplet+ripple, Dust, Stars, Bunting flags), paused when offscreen/hidden, reduced density on mobile.
- Routes: `/` (home sections), `/about`, `/admin`. `.env.example` included (REACT_APP_BACKEND_URL, configurable Facebook/YouTube).
- Backend: untouched template FastAPI (no frontend dependency on it).

## User Personas
- Prospective traveller browsing packages/destinations, sending booking enquiries, creating an account.
- Founder/co-founders (Ramesh, Abhishek, Dheeraj) and Master admin viewing enquiry inbox via /admin demo shell.

## Core Requirements (static)
Cinematic hero rotation with environmental animation; image-led destinations/holidays/experiences; animated promotional pricing; torn-paper campaign graphic; season explorer; customize form; booking enquiry modal; login/signup/forgot/profile UI; admin welcome screens; About; Contact + map; footer; WhatsApp float; Prime HomeEase link; responsive; exportable.

## Implemented (2026-08-17)
- Full homepage: hero (3 slides, clip-reveal transitions, Ken Burns, pointer parallax, per-slide effects incl. realistic snowfall + droplet ripple on Kashmir, golden dust + bunting + birds on Rajasthan), Discover India bento, torn-paper Kashmir offer (₹39,999 → ₹29,999 animated counter), packages carousel with animated prices + detail modal, Season Explorer (Winter snow / Summer rays / Monsoon rain), Travel Your Way (8 styles), Experiences (8, incl. Wagah with tricolor photo), Why Us (exact copy), Leadership (monogram avatars — founder photos were NOT attached to the chat, so elegant RD/AD/DD monograms are used as placeholders), Customize form, Contact + live Google Map embed, full footer, floating WhatsApp (wa.me/918699913245 prefilled).
- Booking modal → mock enquiry service, success with reference ID (PJI-XXXX).
- Auth UI: login / signup / forgot / profile (localStorage mock; swap for real backend later).
- /admin: role select (Master/Dheeraj/Abhishek/Ramesh) → "Welcome, Master" style screens → demo panel with live enquiry inbox fed by the booking form.
- /about: story, vision, mission, philosophy, values, leadership.
- Top utility bar with Prime HomeEase (new tab), phone, email, language selector (EN/HI/PA). Instagram linked; Facebook/YouTube configurable via env (hidden until set, by design — no invented URLs).

## Verified
- curl/HTTP 200; webpack compiles cleanly.
- Screenshot-tested: all home sections, torn-paper counter mid-animation, monsoon tab switch, booking submit → success ref, signup → profile chip, Kashmir slide snow, About, Admin (role → welcome → panel), mobile hero/menu/nav-scroll/customize.

## Backlog / Next Tasks
- P0: Attach real Founder.jpeg / cofounder1.jpeg / cofounder2.jpeg and replace monogram avatars (Leadership + Admin).
- P0 (post-export): connect real backend (MongoDB Atlas + JWT auth + enquiry API) by swapping mockService functions.
- P1: Hindi/Punjabi translations for the language selector (currently a visual selector).
- P1: Facebook/YouTube URLs (env-configurable, not provided).
- P2: Package detail pages, destination detail pages, real Wagah ceremony photo if licensed image becomes available.
- P2: Admin role auth + CRUD for packages/enquiries.
