// Cloudflare Workers runtime global (no @cloudflare/workers-types installed); type-only, emits nothing.
declare const HTMLRewriter: any;
import { POST as createOrder }        from '../api/create-order.js';
import { POST as createSubscription }  from '../api/create-subscription.js';
import { GET  as getCredits }          from '../api/get-credits.js';
import { GET  as reportEntitlement }   from '../api/report-entitlement.js';
import { POST as longevityCoach }      from '../api/longevity-coach.js';
import { POST as razorpayWebhook }     from '../api/razorpay-webhook.js';
import { POST as redeemCredit }        from '../api/redeem-credit.js';
import { POST as saveReport }          from '../api/save-report.js';
import { POST as sendEmail }           from '../api/send-email.js';
import { POST as contact }             from '../api/contact.js';
import { POST as verifyPayment }       from '../api/verify-payment.js';
import { POST as updateBuyerState }     from '../api/update-buyer-state.js';
import { GET  as reportBySlug }         from '../api/report.js';
import { POST as redeemPromo }          from '../api/redeem-promo.js';
import { GET  as dailyCronGet,
         POST as dailyCronPost }       from '../api/daily-email-cron.js';
import { GET  as cronDispatchGet,
         POST as cronDispatchPost }    from '../api/cron-dispatch.js';
import { POST as opsMonitor }          from '../api/ops-monitor.js';
import { GET  as geo }                 from '../api/geo.js';
import { POST as opsDigest }           from '../api/ops-digest.js';
import { POST as invoiceSweep }        from '../api/invoice-sweep.js';
import { GET  as invoicePdf }          from '../api/invoice-pdf.js';
import { POST as subscribe }           from '../api/subscribe.js';
import { POST as weeklyDigest }        from '../api/weekly-digest.js';
import { GET  as kundali }              from '../api/kundali.js';
import { GET  as vedicProfile }         from '../api/vedic-profile.js';
import { GET  as vedicReading }         from '../api/vedic-reading.js';
import { POST as vedicChat }            from '../api/vedic-chat.js';
import { GET  as kundaliMatch }         from '../api/kundali-match.js';
import { GET  as chartEvents }          from '../api/chart-events.js';
import { GET  as sadeSati }             from '../api/sade-sati.js';
import { GET  as muhurat }             from '../api/muhurat.js';
import { GET  as careerReport }        from '../api/career-report.js';
import { GET  as lifeReport }          from '../api/life-report.js';
import { GET  as gemstones }           from '../api/gemstones.js';
import { GET  as geocode }             from '../api/geocode.js';
import { GET  as bornTodayPhoto }      from '../api/born-today-photo.js';
import { GET  as unsubscribe }         from '../api/unsubscribe.js';
import { POST as reminders }           from '../api/reminders.js';
import { handleReportOg, injectReportOgTags } from './og-report.js';
import { isProductionHost, DISALLOW_ALL_ROBOTS, wwwRedirectTarget } from './host.js';
import { duplicateRedirect } from '../src/lib/seo/duplicateRedirects.js';
import { INDIA_BORNON_SLUGS } from '../src/lib/seo/indiaBornOnSlugs.js';
import { PANCHANG_CITY_SLUGS, HINDI_PANCHANG_SLUGS } from '../src/lib/seo/panchangSlugs.js';
import { MUHURAT_YEAR_SLUGS, MUHURAT_YEAR_YEARS } from '../src/lib/muhuratYearMeta.js';
import { matchDailyRoute } from '../src/lib/daily/registry.js';
import { VRAT_SLUG_SET } from '../src/lib/vedic/vrats/meta.js';
import { pageLangForPath, withHtmlLang } from '../src/lib/seo/pageLang.js';
import { applyDailyContent } from './daily.js';

type Env = {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  [key: string]: unknown;
};

// CF Worker env is a Proxy — Object.entries(env) returns [] even when secrets exist.
// Must access known keys by name explicitly.
const BRIDGE_KEYS = [
  'VITE_RAZORPAY_KEY_ID', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET',
  'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
  'CRON_SECRET', 'VITE_CRON_SECRET',
  'RESEND_API_KEY', 'ANTHROPIC_API_KEY', 'ADMIN_SECRET_KEY',
  'GEMINI_API_KEY', 'COACH_PROVIDER', 'RATE_LIMIT_SALT',
  'VITE_RAZORPAY_PLAN_INDIA_MONTHLY', 'VITE_RAZORPAY_PLAN_INDIA_ANNUAL',
  'VITE_RAZORPAY_PLAN_GLOBAL_MONTHLY', 'VITE_RAZORPAY_PLAN_GLOBAL_ANNUAL',
  'ADMIN_EMAIL', 'OPS_BASE_URL',
  'BROWSER_RENDERING_TOKEN', 'CF_ACCOUNT_ID',
  'DIGEST_LIVE',
];

function bridgeEnv(env: Env): void {
  if (typeof process === 'undefined' || !process.env) return;
  const e = env as Record<string, unknown>;
  for (const key of BRIDGE_KEYS) {
    const value = e[key];
    if (typeof value === 'string' && value !== '' && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

const apiRoutes: Record<string, (r: Request) => Promise<Response>> = {
  '/api/create-order':       createOrder,
  '/api/create-subscription': createSubscription,
  '/api/get-credits':        getCredits,
  '/api/report-entitlement': reportEntitlement,
  '/api/longevity-coach':    longevityCoach,
  '/api/razorpay-webhook':   razorpayWebhook,
  '/api/redeem-credit':      redeemCredit,
  '/api/save-report':        saveReport,
  '/api/send-email':         sendEmail,
  '/api/contact':            contact,
  '/api/verify-payment':     verifyPayment,
  '/api/update-buyer-state': updateBuyerState,
  '/api/report':             reportBySlug,
  '/api/redeem-promo':       redeemPromo,
  '/api/ops-monitor':        opsMonitor,
  '/api/geo':                geo,
  '/api/ops-digest':         opsDigest,
  '/api/invoice-sweep':      invoiceSweep,
  '/api/invoice-pdf':        invoicePdf,
  '/api/subscribe':          subscribe,
  '/api/weekly-digest':      weeklyDigest,
  '/api/unsubscribe':        unsubscribe,
  '/api/reminders':          reminders,
  '/api/kundali':            kundali,
  '/api/vedic-profile':      vedicProfile,
  '/api/vedic-reading':      vedicReading,
  '/api/vedic-chat':         vedicChat,
  '/api/kundali-match':      kundaliMatch,
  '/api/chart-events':       chartEvents,
  '/api/sade-sati':          sadeSati,
  '/api/muhurat':            muhurat,
  '/api/career-report':      careerReport,
  '/api/life-report':        lifeReport,
  '/api/gemstones':          gemstones,
  '/api/geocode':            geocode,
  '/api/born-today-photo':   bornTodayPhoto,
};

const worker = {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    bridgeEnv(env);
    // Ops self-checks (api/ops-monitor.ts) call the Worker's own routes in-process.
    // A Worker can't reach itself over HTTP: its *.workers.dev URL returns 522 and a
    // fetch to its own custom domain skips the Worker. See opsSelfFetch().
    (globalThis as any).__bcSelfFetch = (req: Request) => worker.fetch(req, env, ctx);

    const _url = new URL(request.url);
    // Batch 11 (GSC): www.bornclock.com served the whole site (200) with a canonical to the
    // apex, so Search Console listed 332 "Alternate page with proper canonical" URLs. One
    // host only: 301 every www request (any path, query kept) to https://bornclock.com.
    // Runs before anything else; staging / *.workers.dev / localhost are not affected.
    {
      const apex = wwwRedirectTarget(_url);
      // 308 for non-GET/HEAD so a POST (e.g. a webhook) keeps its method and body.
      if (apex) return Response.redirect(apex, request.method === 'GET' || request.method === 'HEAD' ? 301 : 308);
    }
    const { pathname } = _url;
    // Part AO: staging / *.workers.dev / localhost are non-production — hide from search and
    // disable tracking by HOSTNAME only (never by editing public/robots.txt or page HTML).
    const isProd = isProductionHost(_url.hostname);

    // Non-production hosts serve a disallow-all robots.txt (the static one, which allows
    // crawling, is reserved for production bornclock.com). Decided by hostname, not by
    // editing the shipped file.
    if (!isProd && (pathname === '/robots.txt')) {
      return new Response(DISALLOW_ALL_ROBOTS, {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' },
      });
    }

    // Permanent redirects for renamed routes (301). Keep old SEO equity, never 404.
    const REDIRECTS: Record<string, string> = {
      // Targets carry the trailing slash (Batch 11) so the redirect is one hop, not two.
      '/methodology': '/how-it-works/',
      '/methodology/': '/how-it-works/',
      // /rising-sign-calculator retired (a 2-hour-block ascendant is confidently wrong
      // without birth latitude/longitude). The URL was submitted to Google + IndexNow,
      // so 301 to the closest genuinely-useful page rather than waste the crawl on a 404.
      '/rising-sign-calculator': '/moon-sign/',
      '/rising-sign-calculator/': '/moon-sign/',
    };
    if (REDIRECTS[pathname]) {
      return Response.redirect(new URL(REDIRECTS[pathname], request.url).toString(), 301);
    }

    // Batch 6 (SEO): retired DUPLICATE pages → 301 to the one kept URL for the same intent
    // (same date / country), e.g. /born-on/may/13 → /born-on/may-13/,
    // /born-on/may/13/personality → /birthday/5/13/, /biological-age-calculator →
    // /biological-age/. Also normalises zero-padded / upper-case date URLs. The mapping is
    // shared with the React router (src/lib/seo/duplicateRedirects.ts) so both agree.
    // Impossible dates return null and fall through to the real-404 check below.
    {
      const target = duplicateRedirect(pathname, { indiaSlugs: INDIA_BORNON_SLUGS });
      if (target) {
        return Response.redirect(new URL(target + _url.search, request.url).toString(), 301);
      }
    }

    // Compatibility pairs are prerendered once per unordered pair in ALPHABETICAL
    // order (the canonical form). 301 the reverse order to the canonical so both
    // orderings consolidate their SEO equity onto a single indexed URL rather than
    // serving duplicate 200s. Only fires for two valid signs in non-canonical order.
    {
      const m = pathname.match(/^\/compatibility\/([a-z]+)\/([a-z]+)\/?$/);
      if (m) {
        const SIGNS = new Set(['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces']);
        const [, a, b] = m;
        if (SIGNS.has(a) && SIGNS.has(b) && a > b) {
          return Response.redirect(new URL(`/compatibility/${b}/${a}/`, request.url).toString(), 301);
        }
      }
    }

    // Part AD (SEO, Part 4): the "aries+date" Search-Console anomaly is the real query
    // "aries date(s)" — the "+" is the export-encoded space, NOT a literal string emitted
    // anywhere in the code (verified: no source/sitemap/URL contains "aries+date"). The
    // page that correctly targets it, /zodiac/aries/, exists and is healthy. BUT plausible
    // variants — /aries, /aries-dates, /zodiac/aries-dates — were SOFT-404s: the SPA
    // fallback serves HTTP 200 + homepage content that is still indexable, a genuine
    // crawl-budget/soft-404 hazard that can accrue impressions for such a query at a poor
    // position. 301 all bare-sign and [sign]-date(s) variants onto the canonical
    // /zodiac/[sign]/ so any such traffic consolidates onto the correct, real page.
    {
      const ZSIGNS = new Set(['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces']);
      const zm = pathname.match(/^\/(?:zodiac\/)?([a-z]+?)(?:-dates?)?\/?$/);
      if (zm && ZSIGNS.has(zm[1]) && pathname.replace(/\/$/, '') !== `/zodiac/${zm[1]}`) {
        return Response.redirect(new URL(`/zodiac/${zm[1]}/`, request.url).toString(), 301);
      }
    }

    // Part AD (SEO): collapse homepage query-parameter duplicate URLs onto their real
    // canonical date page. `/?day=D&month=M` and `/?birthDate=M/D` are generated by
    // "your birthday" CTAs but the homepage IGNORES those params (renders the bare
    // homepage, canonical `/`), so Google was crawling them as near-duplicates and wasting
    // crawl budget. The genuinely-matching canonical content is /birthday/[month]/[day]/
    // (the "September 4 Birthday" page). 301 there so equity + crawl budget consolidate.
    // (Source CTAs were also fixed to link straight to /birthday/ — this catches already-
    // crawled/legacy URLs.)
    if (pathname === '/') {
      const sp = new URL(request.url).searchParams;
      let mm: number | null = null, dd: number | null = null;
      if (sp.has('day') && sp.has('month')) {
        dd = parseInt(sp.get('day') || '', 10); mm = parseInt(sp.get('month') || '', 10);
      } else if (sp.has('birthDate')) {
        const parts = (sp.get('birthDate') || '').split('/');   // format is month/day
        if (parts.length === 2) { mm = parseInt(parts[0], 10); dd = parseInt(parts[1], 10); }
      }
      if (Number.isInteger(mm) && Number.isInteger(dd) && (mm as number) >= 1 && (mm as number) <= 12 && (dd as number) >= 1 && (dd as number) <= 31) {
        return Response.redirect(new URL(`/birthday/${mm}/${dd}/`, request.url).toString(), 301);
      }
    }

    // Personalised report OG card (SEO-MAGNET-3 Phase 5). Both branches are
    // cache-first and fall back to the static default card / untouched SPA shell on
    // any failure, so they can never break a report view or a share preview.
    if (pathname.startsWith('/og/report/')) {
      return handleReportOg(request, env, ctx);
    }
    if (pathname.startsWith('/report/')) {
      const injected = await injectReportOgTags(request, env);
      if (injected) return injected;
    }

    // ─── RC2 (SEO / Fix 3): real HTTP 404 for provably-invalid generated addresses ──
    // Only FINITE, immutable, fully-enumerated param spaces are judged here: impossible
    // calendar dates, the 12 zodiac signs, 12 Chinese animals, 12 Vedic rashis, the
    // numerology set and the 12 birthstone months (derived from scripts/prerender-routes.mjs,
    // i.e. the same source of truth that generates the real pages). Everything else —
    // celebrity/blog slugs, query params, /results, /report, /auth, /profile, /admin,
    // upgrade/checkout — is NEVER judged (it can't be validated at the edge with the data
    // the page uses), so a valid page can never be turned into a 404. The served body stays
    // the normal styled SPA/prerendered response; only the soft-200 status is corrected to 404.
    const force404 = (() => {
      const Z = new Set(['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces']);
      const A = new Set(['rat','ox','tiger','rabbit','dragon','snake','horse','goat','monkey','rooster','dog','pig']);
      const R = new Set(['mesh','vrishabh','mithun','kark','simha','kanya','tula','vrishchik','dhanu','makar','kumbh','meen']);
      const BM = new Set(['january','february','march','april','may','june','july','august','september','october','november','december']);
      const NUM = new Set([1,2,3,4,5,6,7,8,9,11,22,33]);
      const MONTH_DAYS = [0,31,29,31,30,31,30,31,31,30,31,30,31]; // Feb=29: reject ONLY impossible dates, never a maybe-valid one
      const MONTH_NAMES = ['','january','february','march','april','may','june','july','august','september','october','november','december'];
      const validMD = (mo: number, d: number) => mo >= 1 && mo <= 12 && d >= 1 && d <= MONTH_DAYS[mo];
      let m: RegExpMatchArray | null;
      if ((m = pathname.match(/^\/born-on\/([a-z]+)-(\d+)\/?$/)))                       return !validMD(MONTH_NAMES.indexOf(m[1]), parseInt(m[2], 10));
      if ((m = pathname.match(/^\/(?:born-on|birthday)\/(\d+)\/(\d+)(?:\/personality)?\/?$/))) return !validMD(parseInt(m[1], 10), parseInt(m[2], 10));
      if ((m = pathname.match(/^\/on-this-day\/([a-z]+)\/(\d+)\/?$/)))                     return !validMD(MONTH_NAMES.indexOf(m[1]), parseInt(m[2], 10));
      // Batch 6: retired duplicate families — valid dates were already 301'd above, so
      // anything reaching here is an impossible date (e.g. /born-on/february/30/).
      if ((m = pathname.match(/^\/born-on\/([a-z]+)\/(\d+)(?:\/personality)?\/?$/i)))   return !validMD(MONTH_NAMES.indexOf(m[1].toLowerCase()), parseInt(m[2], 10));
      if ((m = pathname.match(/^\/birthday\/([a-z]+)-(\d+)\/?$/i)))                      return !validMD(MONTH_NAMES.indexOf(m[1].toLowerCase()), parseInt(m[2], 10));
      if ((m = pathname.match(/^\/birthday\/(\d+)\/?$/)))        { const mo = parseInt(m[1], 10); return !(mo >= 1 && mo <= 12); }
      if ((m = pathname.match(/^\/compatibility\/([a-z]+)\/([a-z]+)\/?$/)))             return !(Z.has(m[1]) && Z.has(m[2]));
      if ((m = pathname.match(/^\/zodiac\/([a-z-]+)\/?$/)))          return !Z.has(m[1]);
      if ((m = pathname.match(/^\/zodiac\/([a-z-]+)\/today\/?$/)))   return !Z.has(m[1]);
      if ((m = pathname.match(/^\/zodiac\/([a-z-]+)\/tomorrow\/?$/))) return !Z.has(m[1]); // Batch 10
      if ((m = pathname.match(/^\/chinese-zodiac\/([a-z-]+)\/?$/)))  return !A.has(m[1]);
      if ((m = pathname.match(/^\/chinese-horoscope\/([a-z-]+)\/?$/)))  return !A.has(m[1]);
      if ((m = pathname.match(/^\/vedic-zodiac\/([a-z-]+)\/?$/)))    return !R.has(m[1]);
      const RP = new Set(['today','tomorrow','week','month','year']);
      if ((m = pathname.match(/^\/rashifal\/([a-z]+)\/([a-z]+)\/?$/))) return !(R.has(m[1]) && RP.has(m[2]));
      if ((m = pathname.match(/^\/rashifal\/([a-z]+)\/?$/)))          return !R.has(m[1]);
      // Batch 7 review: Hindi daily rashifal pages use the legacy slugs (= RASHI_SLUGS_HI in
      // src/lib/daily/registry.ts); anything else was a soft-404 200.
      const RH = new Set(['mesha','vrisha','mithuna','karka','simha','kanya','tula','vrischika','dhanu','makara','kumbha','meena']);
      if ((m = pathname.match(/^\/hi\/rashifal\/([a-z]+)\/?$/)))      return !RH.has(m[1]);
      // Batch 9b review: per-rashi Sade Sati pages use the same two slug sets
      // (src/lib/vedic/sadeSatiRashiText.ts SS_EN_SLUGS / SS_HI_SLUGS).
      if ((m = pathname.match(/^\/sade-sati\/([a-z]+)\/?$/)))       return !R.has(m[1]);
      if ((m = pathname.match(/^\/hi\/sade-sati\/([a-z]+)\/?$/)))   return !RH.has(m[1]);
      const NAK = new Set(['ashwini','bharani','krittika','rohini','mrigashira','ardra','punarvasu','pushya','ashlesha','magha','purva-phalguni','uttara-phalguni','hasta','chitra','swati','vishakha','anuradha','jyeshtha','mula','purva-ashadha','uttara-ashadha','shravana','dhanishtha','shatabhisha','purva-bhadrapada','uttara-bhadrapada','revati']);
      if ((m = pathname.match(/^\/nakshatra\/([a-z-]+)\/?$/)))        return !NAK.has(m[1]);
      if ((m = pathname.match(/^\/baby-names\/nakshatra\/([a-z-]+)\/?$/))) return !NAK.has(m[1]);
      // Transit-by-year: four slow planets, year window 2020–2039 (computed at request time).
      const TRP = new Set(['saturn','jupiter','rahu','ketu']);
      const validTY = (y: number) => y >= 2020 && y <= 2039;
      if ((m = pathname.match(/^\/transit\/([a-z]+)\/(\d+)\/?$/)))    return !(TRP.has(m[1]) && validTY(parseInt(m[2], 10)));
      if ((m = pathname.match(/^\/mercury-retrograde\/(\d+)\/?$/)))   return !validTY(parseInt(m[1], 10));
      if ((m = pathname.match(/^\/festivals\/(\d+)\/?$/)))            return !validTY(parseInt(m[1], 10));
      // Batch 9b: year muhurat lists exist only for the precomputed occasions and years.
      if ((m = pathname.match(/^\/muhurat\/([a-z-]+)\/(\d+)\/?$/)))  return !(Object.prototype.hasOwnProperty.call(MUHURAT_YEAR_SLUGS, m[1]) && MUHURAT_YEAR_YEARS.includes(parseInt(m[2], 10)));
      // Planet-in-sign / planet-in-house: 9 planets × 12 signs / 12 houses.
      const PLN = new Set(['sun','moon','mars','mercury','jupiter','venus','saturn','rahu','ketu']);
      const SGN = new Set(['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces']);
      if ((m = pathname.match(/^\/planet-in-sign\/([a-z]+)\/([a-z]+)\/?$/)))  return !(PLN.has(m[1]) && SGN.has(m[2]));
      if ((m = pathname.match(/^\/planet-in-house\/([a-z]+)\/(\d+)\/?$/)))    return !(PLN.has(m[1]) && parseInt(m[2], 10) >= 1 && parseInt(m[2], 10) <= 12);
      const YOG = new Set(['raja-yoga','dhana-yoga','gaja-kesari-yoga','budha-aditya-yoga','chandra-mangal-yoga','ruchaka-yoga','bhadra-yoga','hamsa-yoga','malavya-yoga','shasha-yoga','neecha-bhanga-raja-yoga','vipreet-raja-yoga','kemadruma-yoga']);
      if ((m = pathname.match(/^\/yoga\/([a-z-]+)\/?$/)))            return !YOG.has(m[1]);
      const VRG = new Set(['d1-rashi','d2-hora','d3-drekkana','d4-chaturthamsha','d7-saptamsha','d9-navamsa','d10-dasamsa','d12-dwadashamsha','d16-shodashamsha','d20-vimshamsha','d24-chaturvimshamsha','d27-bhamsha','d30-trimshamsha','d60-shashtiamsha']);
      if ((m = pathname.match(/^\/divisional-charts\/([a-z0-9-]+)\/?$/))) return !VRG.has(m[1]);
      const LEF = new Set(['smoking','exercise','diet','bmi','sleep','alcohol','hypertension','diabetes','social-connection']);
      if ((m = pathname.match(/^\/life-expectancy\/factors\/([a-z-]+)\/?$/))) return !LEF.has(m[1]);
      const BZ = new Set(['move-naturally','purpose','downshift','80-percent-rule','plant-slant','wine-at-5','belong','loved-ones-first','right-tribe']);
      if ((m = pathname.match(/^\/blue-zones\/([a-z0-9-]+)\/?$/)))    return !BZ.has(m[1]);
      // Batch 7 (W7): 50 Panchang cities (Panchang / Rahu Kaal / Choghadiya); Hindi pages for 10.
      if ((m = pathname.match(/^\/(?:panchang|rahu-kaal|choghadiya)\/([a-z-]+)\/?$/))) return !PANCHANG_CITY_SLUGS.has(m[1]);
      if ((m = pathname.match(/^\/hi\/panchang\/([a-z-]+)\/?$/)))     return !HINDI_PANCHANG_SLUGS.has(m[1]);
      // Batch 10: vrat katha pages exist only for the ten vrats (src/lib/vedic/vrats/meta.ts).
      if ((m = pathname.match(/^\/(?:hi\/)?vrat\/([a-z-]+)\/?$/)))  return !VRAT_SLUG_SET.has(m[1]);
      // Batch 7 / W5: the 78 tarot cards — 22 named trumps + "<rank>-of-<suit>" (mirrors src/data/tarotCards).
      const TAROT_MAJOR = new Set(['the-fool','the-magician','the-high-priestess','the-empress','the-emperor','the-hierophant','the-lovers','the-chariot','strength','the-hermit','wheel-of-fortune','justice','the-hanged-man','death','temperance','the-devil','the-tower','the-star','the-moon','the-sun','judgement','the-world']);
      if ((m = pathname.match(/^\/tarot\/cards\/([a-z-]+)\/?$/)))   return !(TAROT_MAJOR.has(m[1]) || /^(ace|two|three|four|five|six|seven|eight|nine|ten|page|knight|queen|king)-of-(wands|cups|swords|pentacles)$/.test(m[1]));
      if ((m = pathname.match(/^\/birthstone\/([a-z-]+)\/?$/)))      return !BM.has(m[1]);
      if ((m = pathname.match(/^\/numerology\/(\d+)\/?$/)))          return !NUM.has(parseInt(m[1], 10));
      const ANG = new Set(['000','111','222','333','444','555','666','777','888','999','1010','1111','1212','1234','2222']); // = src/data/angelNumbersSeo.json keys
      if ((m = pathname.match(/^\/angel-numbers\/([^/]+)\/?$/)))    return !ANG.has(m[1]);
      return false;
    })();

    if (!pathname.startsWith('/api/')) {
      // Daily pages change at India midnight while their shell (and its ETag) does not, so
      // never let a conditional request turn into a 304 of yesterday's injected HTML.
      let assetReq: Request = request;
      if (matchDailyRoute(pathname) && (request.headers.has('If-None-Match') || request.headers.has('If-Modified-Since'))) {
        const h = new Headers(request.headers);
        h.delete('If-None-Match');
        h.delete('If-Modified-Since');
        assetReq = new Request(request.url, { method: request.method, headers: h });
      }
      const assetRes = await env.ASSETS.fetch(assetReq as Parameters<typeof env.ASSETS.fetch>[0]);
      // Part AD (SEO): the static-asset layer normalises a missing trailing slash with a
      // 307 (TEMPORARY) redirect. A 307 does not consolidate SEO equity, which is why
      // Search Console listed /born-on/august-6/india and /born-on/august-6/india/ as TWO
      // separate rows (split clicks/impressions). Upgrade ONLY that trailing-slash
      // normalisation to a 301 (PERMANENT) so Google consolidates onto the canonical
      // (trailing-slash) form. The set of URLs that redirect is unchanged — only the code.
      if (assetRes.status === 307 || assetRes.status === 308) {
        const loc = assetRes.headers.get('Location');
        if (loc) {
          const to = new URL(loc, request.url);
          const from = new URL(request.url);
          if (to.pathname === from.pathname + '/') {
            const headers = new Headers(assetRes.headers);
            return new Response(null, { status: 301, headers });
          }
        }
      }
      // Prevent STALE HTML at the Cloudflare edge. Prerendered page shells (index.html and
      // per-route index.html) carry hashed JS/CSS references; when a deploy changes them, a
      // long-cached HTML shell would keep pinning the OLD bundle — which is exactly how the
      // homepage science-card row went missing on production (the edge served a pre-prerender
      // shell that referenced a stale bundle, so even a hard refresh never showed the row).
      // Force revalidation on HTML documents so every deploy takes effect immediately; hashed
      // assets keep their own immutable caching untouched.
      const ct = assetRes.headers.get('content-type') || '';
      if (ct.includes('text/html')) {
        const headers = new Headers(assetRes.headers);
        headers.set('Cache-Control', 'no-cache, must-revalidate');
        // Batch 7: daily-changing pages (rashifal, Western horoscope, …) — inject TODAY's
        // precomputed content (India date) into the prerendered shell. See
        // src/lib/daily/index.ts. The HTML stays no-cache (stale-bundle rule above); the
        // month JSON is memoised per isolate until India midnight.
        let htmlBody: BodyInit | null = assetRes.body;
        if (!force404 && assetRes.status === 200 && matchDailyRoute(pathname)) {
          const shell = await assetRes.text();
          const daily = await applyDailyContent(pathname, shell, env.ASSETS, _url.origin);
          htmlBody = daily ? daily.html : shell;
          headers.delete('Content-Length');
          headers.delete('ETag');
          if (daily) headers.set('X-Daily-Date', daily.date);
        }
        // Batch 10: Hindi pages (/hi/*, *-hindi) declare <html lang="hi">. Prerendered pages
        // already carry it; this also covers the SPA shell served for any Hindi URL that has
        // no prerendered file (and daily-injected shells). Same byte length → no
        // Content-Length change, but drop it anyway in case the source tag differed.
        if (htmlBody !== null && pageLangForPath(pathname) === 'hi') {
          const text = typeof htmlBody === 'string' ? htmlBody : await new Response(htmlBody).text();
          htmlBody = withHtmlLang(text, 'hi');
          headers.delete('Content-Length');
        }
        // Fix 3: a validated-invalid address returns a real 404 (noindex — a genuine
        // not-found state, allowed by Rule 6) while still serving the styled page body.
        const htmlStatus = force404 ? 404 : assetRes.status;
        if (force404) headers.set('X-Robots-Tag', 'noindex');
        // Part AO: on every non-production host (staging worker, *.workers.dev previews,
        // localhost) tell crawlers not to index, and strip any analytics / ad scripts so
        // automated testing never pollutes production analytics or generates invalid ad
        // views. Production (bornclock.com / www) is untouched — no noindex, tags intact.
        if (!isProd) {
          headers.set('X-Robots-Tag', 'noindex, nofollow');
          const stripped = new HTMLRewriter()
            .on('script', {
              element(el) {
                const src = el.getAttribute('src') || '';
                const beacon = el.getAttribute('data-cf-beacon');
                if (beacon !== null ||
                    /cloudflareinsights\.com|googlesyndication\.com|googletagmanager\.com|google-analytics\.com|adsbygoogle/i.test(src)) {
                  el.remove();
                }
              },
            })
            .transform(new Response(htmlBody, { status: htmlStatus, statusText: assetRes.statusText, headers }));
          return stripped;
        }
        // Part AD (SEO): thin blog TAG-ARCHIVE views (/blog?tag=X) are near-duplicate
        // listing pages that waste crawl budget. Mark them `noindex, follow` (NOT nofollow,
        // and NOT a robots.txt disallow) so they leave the index while link equity still
        // flows to the real articles. Sent as an HTTP header so it's crawl-reliable even
        // before client JS runs (these query-param URLs are served by the /blog/ shell);
        // the React <SEO noindexFollow> adds the matching <meta> in the rendered HTML too.
        if ((pathname === '/blog' || pathname === '/blog/') && new URL(request.url).searchParams.has('tag')) {
          headers.set('X-Robots-Tag', 'noindex, follow');
        }
        return new Response(htmlBody, { status: htmlStatus, statusText: assetRes.statusText, headers });
      }
      return assetRes;
    }

    if (pathname === '/api/daily-email-cron') {
      return request.method === 'GET' ? dailyCronGet(request) : dailyCronPost(request);
    }

    // External-scheduler entry point (GitHub Actions). CRON_SECRET-protected; the
    // GitHub token never touches Cloudflare. See .github/workflows/scheduled-tasks.yml.
    if (pathname === '/api/cron-dispatch') {
      return request.method === 'GET' ? cronDispatchGet(request) : cronDispatchPost(request);
    }


    const handler = apiRoutes[pathname];
    if (!handler) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return handler(request);
  },

  async scheduled(event: any, env: Env, ctx: any): Promise<void> {
    // Cloudflare cron triggers are intentionally disabled (wrangler.toml crons = []).
    // All scheduled work runs via GitHub Actions -> /api/cron-dispatch. If a stale
    // cron ever fires, do nothing rather than run a job twice.
    bridgeEnv(env);
    console.log(`[scheduled] ignored cron "${event?.cron}" — jobs run via /api/cron-dispatch`);
  },
};
export default worker;
