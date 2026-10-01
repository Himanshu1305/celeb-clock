# Part AJ — Flags for Morning Review

Open questions / decisions made under autonomy that the owner should review.

## FLAG 1 — Base branch (resolved, needs awareness) — Step 0
The spec said "create `part-aj-four-page-redesign` off `develop` HEAD" but also required the
base to contain Parts AE–AI. **`develop` only has AE–AG**; Parts AH + AI are on
`part-ai-content-depth-fix` (the checked-out branch at session start), which is a descendant of
`develop`. Branching off `develop` would have silently dropped AH (homepage redesign) and AI
(glossary/tooltip + Rashi Ratna cross-ref) — exactly the "quietly losing real functionality"
risk the spec warns against.

**Decision:** branched off current HEAD (`part-ai-content-depth-fix`) so all of AE–AI is present.
**Implication for merge:** when approving, this branch should merge into `develop` *after*
AH+AI are also on `develop` (or AH/AI get merged as part of this), otherwise develop will not
have the prerequisite work. Worth confirming the intended develop lineage before any merge.

(Additional flags appended as encountered — see Part 2 architecture and Part 4 H1/SEO below once reached.)
