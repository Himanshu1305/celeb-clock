

## Add Sign Up / Join Now CTAs Across Pages

### Problem
1. The only way to sign up is the small "Sign In" button in the AuthNav dropdown — no prominent "Sign Up" or "Join Now" CTA exists anywhere
2. The sign-up form already captures first name, last name, and country (verified in Auth.tsx) — this requirement is already met

### Changes

**1. Update AuthNav** (`src/components/AuthNav.tsx`)
- When user is not logged in, show **two** buttons: "Sign In" (outline) and "Join Free" (primary/accent CTA) — both link to `/auth` but "Join Free" links with `?signup=true` query param

**2. Update Auth page** (`src/pages/Auth.tsx`)
- Read `?signup=true` from URL search params to default to sign-up mode when arriving from a CTA

**3. Add Sign Up CTA to Blog listing page** (`src/pages/Blog.tsx`)
- Add a CTA banner between blog posts (after the first few cards): "Join free to get weekly health insights delivered to your inbox" with a "Sign Up Free" button

**4. Add Sign Up CTA to BlogPost page** (`src/pages/BlogPost.tsx`)
- Add an inline CTA card at the end of each article (before related posts): "Enjoyed this article? Sign up for free to get personalized birthday insights and weekly health tips"

**5. Add Sign Up CTA to Homepage** (`src/pages/Index.tsx`)
- Below the hero section (when user is NOT logged in), add a small banner: "Create a free account to save your results and unlock celebrity matches" with "Join Free" button

**6. Add Sign Up CTA to Footer** (`src/components/Footer.tsx`)
- Add a "Join the Community" section with email teaser and "Sign Up Free" link

### Files Modified

| File | Change |
|------|--------|
| `src/components/AuthNav.tsx` | Add "Join Free" CTA button for unauthenticated users |
| `src/pages/Auth.tsx` | Read `?signup=true` query param to default to sign-up mode |
| `src/pages/Blog.tsx` | Add inline sign-up CTA banner between blog cards |
| `src/pages/BlogPost.tsx` | Add sign-up CTA card at end of article |
| `src/pages/Index.tsx` | Add sign-up banner below hero for non-authenticated users |
| `src/components/Footer.tsx` | Add "Join the Community" section with sign-up link |

All CTAs will only render when the user is **not** logged in (using `useAuth` hook). They link to `/auth?signup=true` so users land directly on the sign-up form.

