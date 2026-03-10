# Celeb Clock - Product Requirements Document

## Overview
Celeb Clock is a birthday-focused web application that helps users discover insights about their birthdate, including celebrity matches, age calculations, zodiac signs, numerology, and life expectancy predictions.

## Original Problem Statement
Clone the `celeb-clock` repository from GitHub, explore its functionality, and enhance it with new features including:
- Bug fixes for state persistence and data flow
- Celebrity birthday matching optimization
- SEO-optimized blog system
- Admin dashboard with content generation
- Modern, viral-ready homepage design

## Tech Stack
- **Frontend:** React + TypeScript + Vite
- **Styling:** TailwindCSS + Shadcn UI
- **Backend:** FastAPI (Python)
- **Database:** Supabase (Auth) + MongoDB (App Data)
- **AI Integration:** Emergent LLM Key via `emergentintegrations`

---

## What's Been Implemented

### Session: December 2025

#### 1. Viral Hero Section (NEW)
- **Headline:** "You share a birthday with someone famous."
- **Social Proof:** Live counter showing "12,847+ birthdays decoded today"
- **Value Proposition:** Celebrity twin, 897 million seconds, 42 other things
- **Birthday Input Form:** Direct DD/MM/YYYY input in hero
- **Primary CTA:** "Find My Celebrity Twin →"
- **Trust Indicators:** 50,000+ celebrities, 42+ insights, 100% free

#### 2. Bento Grid Feature Layout (NEW)
Replaced the old "What Can You Do Here?" section with a modern 12-column Bento Grid:

| Card | Features |
|------|----------|
| **Age Calculator** (large) | Live ticker showing years, days, hours, minutes |
| **Celebrity Match** (medium) | Avatar previews with "AE", "EL", "WI" + 47 more |
| **Life Expectancy** (medium, Pro) | Gauge showing 82.4 years, health factor impacts |
| **Zodiac** | Pisces symbol, traits (Creative, Intuitive, Gentle) |
| **Numerology** | Large "7" - The Seeker |
| **Birthstone** | Aquamarine with gem/flower emojis |
| **Planetary Age** | Mars 14.9 yrs, Jupiter 2.4 yrs, Saturn 0.95 yrs |
| **Today's Birthdays** | Oscar Isaac 45, Bow Wow 37, etc. |
| **Articles** | Blog article previews |

#### 3. Previous Session Work (from handoff)
- Global birth date state management (BirthDateContext)
- Celebrity birthday search optimization (local-first)
- Full blog system with 14 SEO articles
- Advanced SEO (sitemap.xml, robots.txt, JSON-LD, Open Graph)
- `@tailwindcss/typography` for blog styling

---

## Prioritized Backlog

### P0 (Critical)
- [ ] Complete Admin Dashboard backend APIs
- [ ] Implement AI blog draft generation via Emergent LLM Key
- [ ] User management endpoints for admin

### P1 (High)
- [ ] Integrate Resend API for welcome/premium emails (waiting for API key)
- [ ] Create email templates (welcome_email.html, premium_email.html)
- [ ] Blog draft review/publish workflow

### P2 (Medium)
- [ ] Payment integration (Stripe) for premium subscriptions
- [ ] Analytics dashboard with user location data
- [ ] Shareable "Spotify Wrapped" style birthday cards

### P3 (Future/Backlog)
- [ ] Mobile app conversion (React Native/Flutter)
- [ ] More interactive What-If scenarios
- [ ] Social media sharing optimization

---

## Key Files

### New/Updated This Session
- `/app/src/pages/Index.tsx` - Viral hero section with birthday input
- `/app/src/components/BentoGrid.tsx` - Modern Bento Grid layout
- `/app/src/index.css` - Fixed pointer-events on card-party-border

### Core Files
- `/app/src/context/BirthDateContext.tsx` - Global birth date state
- `/app/src/components/FeaturePillars.tsx` - Old feature cards (replaced)
- `/app/src/data/blogPosts.ts` - Blog article data
- `/app/backend/server.py` - FastAPI backend (needs completion)

---

## Design System
- **Primary Color:** Deep Blue (hsl 214 84% 36%)
- **Accent Color:** Teal (hsl 174 44% 47%)
- **Background:** Light gradient cosmic theme
- **Cards:** Glass-morphism with party border effect
- **Typography:** System fonts with gradient text effects

---

## Testing Status
- Hero section: Manually verified via screenshots
- Bento Grid: Verified working on desktop
- Form submission: Working (navigates to celebrity page)
- Mobile responsiveness: CSS Grid stacks correctly

---

## Notes for Next Session
1. Backend server.py needs implementation for admin APIs
2. User asked about using Claude's dark theme layout - decided to keep light theme
3. Research showed Option A (Hero + Bento) is optimal for conversions
4. Celebrity twin concept has highest viral potential per BuzzFeed/Spotify Wrapped psychology
