// Expert-reviewer registry (P3-8). INTENTIONALLY EMPTY.
//
// BornClock never invents a reviewer, credentials or a byline (Rule 8 / Part 4). The
// ReviewerByline component renders a named expert ONLY when a REAL person is registered
// here by the owner. Until the person provides a genuine reviewer, this stays empty and
// every byline simply doesn't render — pages keep the honest "BornClock Editorial Team"
// attribution (EEATBadges) instead.
//
// To add a real reviewer (person-only task): add an entry with their verified name,
// credentials, a short bio and optionally a public profile URL, then pass its id to
// <ReviewerByline reviewerId="..." /> (or EEATBadges reviewerId=...) on the relevant page.

export interface ExpertReviewer {
  id: string;
  name: string;
  /** e.g. "Jyotish Acharya" or "MD, Internal Medicine" — the real, verifiable credential. */
  credentials: string;
  bio?: string;
  /** A public page that substantiates the credential (LinkedIn, institution, etc.). */
  profileUrl?: string;
}

// No reviewers yet — do NOT add placeholders. Each entry must be a real, consenting person.
export const EXPERT_REVIEWERS: Record<string, ExpertReviewer> = {};

export function getReviewer(id: string | null | undefined): ExpertReviewer | undefined {
  if (!id) return undefined;
  return EXPERT_REVIEWERS[id];
}
