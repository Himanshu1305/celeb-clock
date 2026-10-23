-- NOTES — celebrity data corrections (audit round 2: S6, S7, S9). NOT APPLIED.
-- Needs founder approval. Run in the Supabase SQL editor for project "Bornclock".
-- Until applied, the same corrections are made in code (src/lib/celebrityFacts.ts),
-- so the site is already correct; applying this just fixes the source data.
--
-- Every value was checked on the person's English Wikipedia infobox on 23 Oct 2026.
-- Each UPDATE matches by wikidata_id where the row has one, else by exact name,
-- and only touches the row if it still has the old wrong value.

BEGIN;

-- ── S7: deaths missing from the data ─────────────────────────────────────────
UPDATE celebrity_sitelinks SET death_date = '2024-12-29' WHERE wikidata_id = 'Q23685'   AND death_date IS NULL; -- Jimmy Carter
UPDATE celebrity_sitelinks SET death_date = '2025-04-21' WHERE wikidata_id = 'Q450675'  AND death_date IS NULL; -- Pope Francis
UPDATE celebrity_sitelinks SET death_date = '2024-11-01' WHERE wikidata_id = 'Q7359759' AND death_date IS NULL; -- Rohit Bal
UPDATE celebrity_sitelinks SET death_date = '2025-11-24' WHERE wikidata_id = 'Q379157'  AND death_date IS NULL; -- Dharmendra
UPDATE celebrity_sitelinks SET death_date = '2025-10-20' WHERE wikidata_id = 'Q3595129' AND death_date IS NULL; -- Asrani
-- M. Karunanidhi: DB has 2018-01-01 (placeholder); Wikipedia: 7 August 2018
UPDATE celebrity_sitelinks SET death_date = '2018-08-07' WHERE name = 'M. Karunanidhi' AND death_date = '2018-01-01';

-- ── S6: wrong birth dates ────────────────────────────────────────────────────
-- Rohit Bal: DB already 1961-05-08 (correct). Ilaiyaraaja: infobox 3 June 1943 (DB 1943-06-02).
UPDATE celebrity_sitelinks SET birth_date = '1943-06-03', birth_month_day = '06-03'
  WHERE name = 'Ilayaraja' AND birth_date = '1943-06-02';
-- The other June people (Sunil Dutt, Shilpa Shetty, Anna Hazare, Lakshmi Mittal, Sonam Kapoor,
-- Nargis, Anil Ambani, Nutan, Kiran Bedi, Ekta Kapoor, Mahesh Bhupathi, Dimple Kapadia,
-- Nandan Nilekani, Prakash Padukone, Balakrishna, E. Sridharan, Raj Thackeray, M. Karunanidhi,
-- Kirron Kher) already have the correct June date in the DB; the January dates were only in
-- the static files src/data/indianCelebrities.ts and src/data/celebrities.json (fixed in code).

-- ── S9: BCE years stored as CE ───────────────────────────────────────────────
-- Chanakya: Wikipedia gives only an era (4th–3rd century BCE), no birth/death year.
-- The DB has birth 0371-01-01 / death 0283-01-01 (CE), which produced "died aged -88".
-- Postgres can store BCE ('0371-01-01 BC'), but there is no sourced year to store. Either leave
-- the row as-is (the code era override already hides the dates) or clear both dates (uncomment):
-- UPDATE celebrity_sitelinks SET birth_date = NULL, death_date = NULL WHERE wikidata_id = 'Q9045';
--
-- Rows where death_date < birth_date (import error; code shows no age for them):
--   Stephen I, Urban III, Soter, Felix I, Eugene III, Eutychian, John XV, John XIV,
--   Quintus Curtius Rufus, Adam of Bremen, Afanasy Nikitin, Qutuz, Suleiman ibn Qutulmish,
--   Emund the Old, Boniface VII  (query: SELECT name FROM celebrity_sitelinks WHERE death_date < birth_date;)

COMMIT;
