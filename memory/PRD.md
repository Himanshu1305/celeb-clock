# Celeb Clock - Product Requirements Document

## Overview
Celeb Clock is a birthday-focused web application that helps users discover insights about their birthdate, including celebrity matches, age calculations, zodiac signs, numerology, and life expectancy predictions.

## Tech Stack
- **Frontend:** React + TypeScript + Vite + TailwindCSS + Shadcn UI
- **Backend:** FastAPI (Python)
- **Database:** Supabase (Auth) + MongoDB (App Data)
- **AI Integration:** Emergent LLM Key via `emergentintegrations` (Claude Sonnet)

---

## What's Been Implemented

### Session: December 2025

#### 1. Combined Hero Section (NEW)
- **Headline:** "You're **897 million seconds** old. And someone famous shares your birthday."
- **Social Proof:** Live counter showing "12,847+ birthdays decoded today"
- **Value Proposition:** Exact age updating live + celebrity twin + 42 other things
- **Birthday Input Form:** Direct DD/MM/YYYY input in hero
- **Primary CTA:** "Reveal Everything →" navigates to /results
- **Trust Indicators:** 50,000+ celebrities, 42+ insights, 100% free

#### 2. Combined Results Page (/results) (NEW)
- **Live Age Counter:** Years, Months, Days, Hours updating every second
- **Total Seconds Alive:** Large counter updating in real-time
- **Additional Stats:** Total Days, Total Hours, Total Minutes, Heartbeats
- **Quick Facts:** Generation (Millennial/Gen Z/etc), Zodiac Sign, Life Path Number
- **Celebrity Matches:** Integrated WikiBirthdayMatches component
- **Zodiac Details:** Integrated ZodiacAndFacts component
- **Shareable Card:** Spotify Wrapped-style birthday card with:
  - Preview card with gradient design
  - Twitter/Facebook share buttons
  - Copy link functionality
  - Download as PNG (using html2canvas)

#### 3. Animated Bento Grid (NEW)
Replaced old feature cards with modern 12-column Bento Grid featuring micro-animations:

| Card | Animation |
|------|-----------|
| **Age Calculator** | Live ticker updating seconds with flash effect |
| **Celebrity Match** | Avatars expand on hover with stagger |
| **Life Expectancy** | Gauge animates on load, health factors pulse |
| **Zodiac** | Symbol rotates on hover, traits float up |
| **Numerology** | Number pulses, stops on hover |
| **Birthstone** | Gems sparkle in rotation |
| **Planetary Age** | Planets cycle with highlight effect |
| **Today's Birthdays** | Celebrity names slide in/out |
| **Articles** | Blog previews on hover |

#### 4. Admin Dashboard Backend APIs (NEW)
Full backend implementation for content management:

| Endpoint | Function |
|----------|----------|
| `POST /api/admin/blog/generate` | AI-powered blog generation using Claude |
| `GET /api/admin/blog/drafts` | List all blog drafts with filtering |
| `GET /api/admin/blog/drafts/{id}` | Get specific draft |
| `PUT /api/admin/blog/drafts/{id}` | Update draft |
| `POST /api/admin/blog/drafts/{id}/publish` | Publish draft |
| `DELETE /api/admin/blog/drafts/{id}` | Delete draft |
| `GET /api/admin/analytics` | Dashboard analytics |
| `GET /api/admin/users` | User management |
| `GET /api/admin/email-templates` | Email template list |

#### 5. Email Templates (NEW)
- `/app/backend/templates/welcome_email.html` - Beautiful welcome email for new users
- `/app/backend/templates/premium_email.html` - Premium upgrade confirmation with receipt

---

## Testing Status ✅
- **Backend:** 100% (14/14 tests passed)
- **Frontend:** 100% (all features working)
- **Test Report:** `/app/test_reports/iteration_1.json`

---

## Prioritized Backlog

### P0 (Critical) - COMPLETE ✅
- [x] Combined hero section with age calculator + celebrity match
- [x] New /results page with live counters
- [x] Animated Bento Grid with micro-interactions
- [x] Admin backend APIs for blog generation
- [x] Shareable birthday card (Spotify Wrapped style)

### P1 (High)
- [ ] Integrate Resend API for sending emails (waiting for API key)
- [ ] Build Admin Dashboard frontend UI
- [ ] Add user authentication to admin routes

### P2 (Medium)
- [ ] Payment integration (Stripe) for premium subscriptions
- [ ] Analytics dashboard with charts
- [ ] User location tracking

### P3 (Future/Backlog)
- [ ] Mobile app conversion (React Native/Flutter)
- [ ] More What-If scenarios
- [ ] Social media auto-posting

---

## Key Files Reference

### New This Session
- `/app/src/pages/Index.tsx` - Combined hero section
- `/app/src/pages/BirthdayResults.tsx` - New results page with live counters
- `/app/src/components/BentoGrid.tsx` - Animated Bento Grid
- `/app/backend/server.py` - Complete admin API implementation
- `/app/backend/templates/welcome_email.html` - Welcome email template
- `/app/backend/templates/premium_email.html` - Premium email template

### Core Files
- `/app/src/context/BirthDateContext.tsx` - Global birth date state
- `/app/src/App.tsx` - Routes including new /results route
- `/app/src/components/WikiBirthdayMatches.tsx` - Celebrity matching
- `/app/src/components/ZodiacAndFacts.tsx` - Zodiac details

---

## API Credentials
- **EMERGENT_LLM_KEY:** Configured in `/app/backend/.env` for Claude integration
- **Resend API Key:** Placeholder in `.env`, waiting for user to provide real key

---

## Design System
- **Primary Color:** Deep Blue (hsl 214 84% 36%)
- **Accent Color:** Teal (hsl 174 44% 47%)
- **Background:** Light gradient cosmic theme
- **Cards:** Glass-morphism with party border effect
- **Animations:** CSS transitions + React state-driven micro-interactions
