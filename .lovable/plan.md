

## Create 4 Marketing Email Templates

These are standalone React components (not auth emails) that render HTML email templates. They'll be ready to plug into any email-sending API later.

### Brand Colors (from app CSS)
- Primary (Deep Blue): `hsl(214, 84%, 36%)` → `#0f4c91`
- Accent (Teal): `hsl(174, 44%, 47%)` → `#44b0a1`
- Foreground: `hsl(220, 13%, 18%)` → `#282d33`
- Muted: `hsl(215, 13%, 45%)` → `#646b78`
- Background: `hsl(210, 20%, 98%)` → `#f7f8fa`
- Premium Gold: `#d4a017` (matches existing premium CTA)

### Templates to Create

**1. Welcome Email** (`src/emails/WelcomeEmail.tsx`)
- Warm greeting with user's first name
- Brief intro to Cosmic Age's 3 core features (Age Calculator, Celebrity Match, Zodiac/Birthstone)
- Link to blog articles
- Subtle mention of premium Life Expectancy feature
- CTA: "Start Exploring"

**2. Premium Thank You Email** (`src/emails/PremiumThankYouEmail.tsx`)
- Gold/amber premium branding
- Thank the user for upgrading
- List all unlocked premium features: Life Expectancy Calculator, Premium Celebrity Database, Export Reports, Birthday Twin Notifications, Priority Support
- CTA: "Explore Your Life Report"

**3. Premium Upsell Email** (`src/emails/PremiumUpsellEmail.tsx`)
- Sent to free users after some time
- Highlight what they're missing (Life Expectancy preview, premium celebrity matches)
- Social proof: "Join thousands of premium members"
- One-time $29.99 pricing emphasis
- CTA: "Unlock Premium for $29.99"

**4. Re-engagement Email** (`src/emails/ReEngagementEmail.tsx`)
- "We miss you!" tone
- Highlight recent blog articles and new features
- Remind them of Celebrity Match, Zodiac, Birthstone features
- Personalized: "Your next birthday is coming up!" hook
- CTA: "Come Back and Explore"

### Technical Approach

Each template is a **plain React component** that returns an HTML email string via a `render()` export function. They use inline styles (email-safe) matching the app's color palette. No external dependencies needed — just TSX files that export a function returning an HTML string.

A barrel export file (`src/emails/index.ts`) will re-export all templates for easy importing when the email API is integrated later.

### Files Created

| File | Purpose |
|------|---------|
| `src/emails/WelcomeEmail.tsx` | New user welcome |
| `src/emails/PremiumThankYouEmail.tsx` | Premium purchase confirmation |
| `src/emails/PremiumUpsellEmail.tsx` | Free-to-premium conversion |
| `src/emails/ReEngagementEmail.tsx` | Inactive user re-engagement |
| `src/emails/index.ts` | Barrel exports |

