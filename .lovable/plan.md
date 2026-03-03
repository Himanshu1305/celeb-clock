

## Add Disclaimers to Life Expectancy Calculator

### What Changes

**1. Privacy & Data Disclaimer** — Add an `Alert` component at the top of the calculator (visible on Step 1) and on the Life Expectancy page, clearly stating:
- All health data is processed entirely in your browser and never stored on servers
- Only name and email are stored for login purposes
- No personal or sensitive health information is transmitted or saved

**2. Entertainment/Medical Disclaimer** — Add a prominent disclaimer at the bottom of the calculator (all steps) and before the results, stating:
- This tool is for informational and entertainment purposes only
- Results are based on simplified statistical models and should not be taken as medical advice
- Users should consult a qualified healthcare professional for actual health assessments and medical decisions

**3. Page-level Disclaimer** — Add a disclaimer section on the `LifeExpectancy.tsx` page in the hero/about area reinforcing both points.

### Files Modified

| File | Change |
|------|--------|
| `src/components/LifeExpectancyCalculator.tsx` | Add privacy disclaimer on Step 1, medical disclaimer on all steps (bottom), and before results on Step 5 |
| `src/pages/LifeExpectancy.tsx` | Add a disclaimer notice in the hero section below the CTA button |

### Implementation Details

- Use the existing `Alert` component (`src/components/ui/alert.tsx`) with `ShieldCheck` and `AlertTriangle` icons from lucide-react
- Privacy disclaimer: teal/info styling, placed above Step 1 form fields
- Medical disclaimer: subtle muted styling, placed as a persistent footer inside the card across all steps
- Both disclaimers use concise, reassuring language

