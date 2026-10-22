-- fix-timezone-accuracy — PAST DATA CHECK (READ-ONLY). Run in the Supabase SQL editor.
-- One SELECT statement. It writes nothing, changes nothing, emails nobody.
--
-- Lists every stored record whose birth chart may have been computed with the wrong
-- UTC offset before the fix:
--   A. profiles.birth_profile    — saved birth profiles synced to an account
--   B. profiles.reading_history  — past Kundali result snapshots (joined to A's place)
--   C. birthday_reports          — paid / premium reports (orders)
--   D. vedic_chart_cache         — shared chart / reading cache rows (no user link)
-- Kundali MATCHES are never stored server-side, so there is nothing to list for them.
--
-- A row is flagged when the birthplace is outside India (bounding box 6.5–37.1 N,
-- 68.1–97.4 E — rows near the border are flagged "check"), or a stored offset is not
-- +5.5, or it is an Indian birth in the historical wartime period (1941-10-01 →
-- 1945-10-15, +6:30), whose offset the fix also changes.
-- `to_jsonb(p)` is used so the query still runs if the reading_history column is absent.
-- Numbers are only cast when they look numeric, so odd JSON never aborts the query.
-- Paste the full result back and the affected charts will be recomputed and compared.

WITH prof AS (
  SELECT
    p.user_id,
    to_jsonb(p) -> 'birth_profile'   AS bp,
    to_jsonb(p) -> 'reading_history' AS rh
  FROM public.profiles p
),
a AS (
  SELECT
    'A. saved profile'::text                      AS source,
    user_id::text                                 AS record_id,
    bp ->> 'dob'                                  AS birth_date,
    bp ->> 'time'                                 AS birth_time,
    bp -> 'city' ->> 'name'                       AS place,
    CASE WHEN (bp -> 'city' ->> 'lat') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (bp -> 'city' ->> 'lat')::numeric END AS lat,
    CASE WHEN (bp -> 'city' ->> 'lon') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (bp -> 'city' ->> 'lon')::numeric END AS lon,
    CASE WHEN (bp -> 'city' ->> 'tz')  ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (bp -> 'city' ->> 'tz')::numeric  END AS stored_utc_offset,
    bp -> 'city' ->> 'timezone'                   AS stored_timezone,
    NULL::text                                    AS stored_result,
    NULL::timestamptz                             AS created_at
  FROM prof
  WHERE jsonb_typeof(bp) = 'object' AND bp ? 'city'
),
b AS (
  SELECT
    'B. reading history'::text,
    a.record_id,
    h ->> 'dob',
    a.birth_time,
    a.place, a.lat, a.lon, a.stored_utc_offset, a.stored_timezone,
    concat_ws(' / ', 'rashi=' || (h ->> 'rashi'), 'lagna=' || (h ->> 'lagna'),
              'nakshatra=' || (h ->> 'nakshatra'), 'dasha=' || (h ->> 'dasha')),
    CASE WHEN (h ->> 'generatedAt') ~ '^[0-9]{4}-' THEN (h ->> 'generatedAt')::timestamptz END
  FROM a
  JOIN prof ON prof.user_id::text = a.record_id
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(prof.rh) = 'array' THEN prof.rh ELSE '[]'::jsonb END) AS h
),
c AS (
  SELECT
    'C. birthday report (order)'::text,
    r.id::text,
    r.recipient_dob::text,
    jsonb_path_query_first(r.report_data, 'lax $.**.time') #>> '{}',
    coalesce(jsonb_path_query_first(r.report_data, 'lax $.**.city.name') #>> '{}', r.country),
    CASE WHEN (jsonb_path_query_first(r.report_data, 'lax $.**.lat') #>> '{}') ~ '^-?[0-9]+(\.[0-9]+)?$'
         THEN (jsonb_path_query_first(r.report_data, 'lax $.**.lat') #>> '{}')::numeric END,
    CASE WHEN (jsonb_path_query_first(r.report_data, 'lax $.**.lon') #>> '{}') ~ '^-?[0-9]+(\.[0-9]+)?$'
         THEN (jsonb_path_query_first(r.report_data, 'lax $.**.lon') #>> '{}')::numeric END,
    CASE WHEN (jsonb_path_query_first(r.report_data, 'lax $.**.tz') #>> '{}') ~ '^-?[0-9]+(\.[0-9]+)?$'
         THEN (jsonb_path_query_first(r.report_data, 'lax $.**.tz') #>> '{}')::numeric END,
    NULL::text,
    'premium=' || r.is_premium_report::text || ' / country=' || coalesce(r.country, ''),
    r.created_at
  FROM public.birthday_reports r
  WHERE coalesce(r.country, 'India') <> 'India'
     OR jsonb_path_exists(r.report_data, 'lax $.**.lat')
),
d AS (
  SELECT
    'D. chart cache row'::text,
    v.cache_key,
    concat_ws('-', x.m_date[1], lpad(x.m_date[2], 2, '0'), lpad(x.m_date[3], 2, '0')),
    NULL::text,
    NULL::text,
    x.m_loc[1]::numeric, x.m_loc[2]::numeric, x.m_loc[3]::numeric,
    NULL::text,
    left(coalesce(v.chart_data ->> 'rashi', '') || ' / ' || coalesce(v.chart_data -> 'lagna' ->> 'sign', ''), 80),
    v.last_accessed_at
  FROM public.vedic_chart_cache v
  CROSS JOIN LATERAL (
    SELECT regexp_match(v.cache_key, '(?:^|-)([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})-') AS m_date,
           regexp_match(v.cache_key, '-(-?[0-9]{1,3}\.[0-9]{4})-(-?[0-9]{1,3}\.[0-9]{4})-(-?[0-9]+(\.[0-9]+)?)') AS m_loc
  ) x
  -- rows written AFTER the fix carry a 'tz2' version tag; only pre-fix rows are listed
  WHERE v.cache_key NOT LIKE 'tz2-%'
    AND v.cache_key NOT LIKE 'vp-tz2-%'
    AND v.cache_key NOT LIKE 'reading-%-tz2-%'
),
allrows AS (
  SELECT * FROM a UNION ALL SELECT * FROM b UNION ALL SELECT * FROM c UNION ALL SELECT * FROM d
)
SELECT
  source, record_id, birth_date, birth_time, place, lat, lon, stored_utc_offset, stored_timezone,
  stored_result, created_at,
  CASE
    WHEN lat IS NULL OR lon IS NULL THEN 'no coordinates stored (date-only)'
    WHEN lat NOT BETWEEN 6.5 AND 37.1 OR lon NOT BETWEEN 68.1 AND 97.4 THEN 'NON-INDIAN birthplace'
    WHEN lat > 34.5 OR lon < 70 OR lon > 88.5 THEN 'check: near India border'
    WHEN stored_utc_offset IS NOT NULL AND stored_utc_offset <> 5.5 THEN 'stored offset not +5.5'
    WHEN birth_date >= '1941-10-01' AND birth_date < '1945-10-15' THEN 'India wartime (+6:30) period'
    ELSE 'ok'
  END AS flag
FROM allrows
WHERE
  lat IS NULL OR lon IS NULL
  OR lat NOT BETWEEN 6.5 AND 37.1 OR lon NOT BETWEEN 68.1 AND 97.4
  OR lat > 34.5 OR lon < 70 OR lon > 88.5
  OR (stored_utc_offset IS NOT NULL AND stored_utc_offset <> 5.5)
  OR (birth_date >= '1941-10-01' AND birth_date < '1945-10-15')
ORDER BY flag, source, created_at DESC NULLS LAST;
