/**
 * Access setting for the "What's Ahead" feature (Backlog-1 Item G).
 *
 * This is the SINGLE, clearly-named switch for whether "What's Ahead" (life-area +
 * time-horizon views) is free or paid. It ships FREE by default. Flipping it to
 * `false` is a business decision for the owner — see "Needs the person" in
 * docs/backlog1-report.md. Nothing else about pricing or entitlements changes.
 *
 * When false, the component shows a short locked teaser instead of the full views;
 * no existing paid content is altered either way.
 */
export const WHATS_AHEAD_IS_FREE = true;
