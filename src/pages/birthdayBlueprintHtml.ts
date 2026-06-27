// src/pages/birthdayBlueprintHtml.ts
// Complete <!DOCTYPE html> string for the Birthday Blueprint PDF.
// Mirrors the Longevity Blueprint pattern (LifeExpectancy.tsx ~line 620)
// but uses Birthday Blueprint design tokens — navy + gold gift aesthetic.

export interface BirthdayBlueprintHtmlData {
  recipientName: string;
  dob: Date;
  ageYears: number;
  daysLived: number;
  birthDayOfWeek: string;
  nextBirthdayMonth: string;
  nextBirthdayDay: number;

  // Section 1 — Kindred
  celebrities: Array<{
    name: string;
    birthYear: number | string;
    deceased?: boolean;
    nationality?: string;
    bio?: string;
    tier?: string;
  }>;

  // Section 2 — Astrology
  westernZodiac: {
    name: string;
    glyph: string;
    dateRange: string;
    element: string;
    modality: string;
    rulingPlanet: string;
    description: string;
    strengths: string[];
    growthAreas: string[];
    famousList: string;
    compatibility: Array<{ sign: string; glyph: string; pct: number; reason: string }>;
  };
  chineseZodiac: {
    animal: string;
    emoji: string;
    year: number;
    element: string;
    polarity: string;
    cycleYears: string;
    description: string;
    strengths: string[];
    growthAreas: string[];
    loveAndRelationships: string;
    mostCompatible: string;
    challengingMatch: string;
    careerPaths: string;
    famousList: string;
    quote: string;
  };
  vedicRashi: {
    name: string;
    english: string;
    glyph: string;
    rulingPlanet: string;
    element: string;
    symbol: string;
    paragraphs: string[];
    westernVsVedicNote: string;
    coreTraits: string[];
    career: string;
    relationships: string;
    spiritual: string;
    colors: string;
    numbers: string;
    gemstone: string;
  };
  moonSign: {
    name: string;
    glyph: string;
    element: string;
    rulingPlanet: string;
    explainer: string;
    paragraphs: string[];
  };
  nakshatra: {
    number: number;
    name: string;
    meaning: string;
    deity: string;
    paragraphs: string[];
    shakti: string;
    ruler: string;
    gemstone: string;
    career: string;
    relationships: string;
    spiritual: string;
  };

  // Section 3 — Numbers
  lifePath: {
    number: number;
    title: string;
    keywords: string;
    personality: string;
    strengths: string[];
    growthAreas: string[];
  };
  personalYear: {
    number: number;
    year: number;
    title: string;
    description: string;
    love: string;
    career: string;
    health: string;
    keyMonths: string[];
    quote: string;
  };

  // Section 4 — Name
  nameNumerology: {
    expression: { number: number; title: string; description: string };
    soulUrge: { number: number; title: string; description: string };
    personality: { number: number; title: string; description: string };
    gematriaExplainer: string;
  };
}

export function buildBirthdayBlueprintHtml(data: BirthdayBlueprintHtmlData): string {
  const generatedDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const fmt = (n: number) => n.toLocaleString('en-IN');

  const esc = (s: string | undefined | null): string => {
    if (s === undefined || s === null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${esc(data.recipientName)}'s Birthday Blueprint — BornClock</title>
  <style>
    :root {
      --ink: #0C1A2B; --ink-soft: #3A4A5A; --muted: #6B7A89;
      --hairline: #D7E1EA; --panel: #F1F6FA; --panel-2: #FAFCFE; --paper: #FFFFFF;
      --navy: #103A5C; --blue: #1E6FB8; --blue-tint: #E4EFF8;
      --gold: #B8862F; --gold-soft: #F5EAD2; --gold-tint: #FBF6EA;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box; margin: 0; padding: 0;
    }
    body {
      font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 12px; line-height: 1.6; color: var(--ink); background: var(--paper);
      font-feature-settings: "tnum" 1, "lnum" 1;
    }
    .num { font-feature-settings: "tnum" 1; letter-spacing: -.01em; }
    @page { margin: 0; size: A4; }
    .page { padding: 36px 44px; margin: 1.2cm; }
    .page-break { page-break-after: always; break-after: page; }

    .section-codeline {
      display: flex; justify-content: space-between; align-items: baseline;
      border-bottom: 1.5px solid var(--navy);
      padding-bottom: 8px; margin-bottom: 18px;
    }
    .eyebrow {
      font-size: 10.5px; color: var(--gold); font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.16em;
    }
    .section-code {
      font-size: 10px; color: var(--muted); font-weight: 600;
      letter-spacing: 0.16em;
    }
    h1 { font-size: 32px; font-weight: 900; color: var(--navy); letter-spacing: -0.5px; line-height: 1.1; }
    h2 { font-size: 22px; font-weight: 800; color: var(--navy); margin: 0 0 6px 0; letter-spacing: -0.3px; }
    h3 { font-size: 16px; font-weight: 700; color: var(--navy); margin: 0 0 8px 0; }
    h4 { font-size: 11px; font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: 0.12em; margin: 0 0 8px 0; }
    .sub { font-size: 13px; color: var(--ink-soft); margin-bottom: 16px; }
    p { margin: 0 0 10px 0; }
    p:last-child { margin-bottom: 0; }

    .card {
      background: var(--paper); border: 1px solid var(--hairline);
      border-radius: 12px; padding: 18px 22px; margin-bottom: 14px;
      page-break-inside: avoid; break-inside: avoid;
    }
    .card-gold { background: var(--gold-tint); border-color: rgba(184,134,47,0.25); }
    .card-panel { background: var(--panel); border-color: var(--hairline); }
    .card-dark { background: var(--ink); color: var(--paper); border-color: rgba(184,134,47,0.3); }
    .card-dark h2, .card-dark h3 { color: var(--paper); }
    .card-dark h4 { color: var(--gold); }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; }

    .pill {
      display: inline-block; padding: 3px 10px; border-radius: 12px;
      font-size: 10.5px; font-weight: 600; margin: 2px 4px 2px 0;
      background: var(--gold-tint); color: var(--gold); border: 1px solid rgba(184,134,47,0.25);
    }
    .pill-green { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
    .pill-amber { background: #fffbeb; color: #92400e; border-color: #fde68a; }
    .pill-blue { background: var(--blue-tint); color: var(--blue); border-color: #c3d9ef; }

    .stat {
      text-align: center; background: var(--paper); border: 1px solid var(--hairline);
      border-radius: 12px; padding: 18px 12px;
    }
    .stat-value { font-size: 26px; font-weight: 900; color: var(--gold); line-height: 1; margin-bottom: 6px; }
    .stat-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.14em; font-weight: 600; }

    .cover-page {
      min-height: 90vh; display: flex; flex-direction: column; justify-content: space-between;
    }
    .cover-brand {
      display: flex; align-items: center; justify-content: space-between;
      padding-bottom: 14px; border-bottom: 2px solid var(--navy);
    }
    .cover-brand-left { display: flex; align-items: center; gap: 10px; }
    .cover-brand-name { font-size: 18px; font-weight: 800; color: var(--navy); }
    .cover-brand-tag { font-size: 11px; color: var(--muted); margin-top: 2px; }
    .cover-meta { text-align: right; font-size: 11px; color: var(--muted); }
    .cover-main {
      flex: 1; display: flex; flex-direction: column; justify-content: center;
      padding: 40px 0;
    }
    .cover-eyebrow { font-size: 11px; color: var(--gold); font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 14px; }
    .cover-name { font-size: 56px; font-weight: 900; color: var(--navy); letter-spacing: -1.5px; line-height: 1; margin-bottom: 12px; }
    .cover-line { font-size: 14px; color: var(--ink-soft); margin-bottom: 36px; }

    .celeb {
      padding: 12px 14px; background: var(--paper); border: 1px solid var(--hairline);
      border-radius: 10px;
    }
    .celeb-tier-top { border-left: 3px solid var(--gold); }
    .celeb-name { font-size: 13px; font-weight: 700; color: var(--navy); margin-bottom: 4px; }
    .celeb-meta { font-size: 11px; color: var(--muted); margin-bottom: 4px; }
    .celeb-bio { font-size: 10.5px; color: var(--ink-soft); line-height: 1.5; }

    .triptych {
      display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
      margin-bottom: 22px;
    }
    .triptych .card { text-align: center; padding: 16px 10px; margin-bottom: 0; }
    .triptych-glyph { font-size: 28px; margin-bottom: 6px; }
    .triptych-label { font-size: 9.5px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.14em; font-weight: 600; margin-bottom: 6px; }
    .triptych-value { font-size: 17px; font-weight: 800; color: var(--navy); margin-bottom: 4px; }
    .triptych-sub { font-size: 10.5px; color: var(--ink-soft); }

    .rule-soft { height: 1px; background: var(--hairline); margin: 18px 0; }

    .num-badge {
      width: 70px; height: 70px; border-radius: 50%;
      background: var(--gold); color: var(--paper);
      display: flex; align-items: center; justify-content: center;
      font-size: 30px; font-weight: 900;
      flex-shrink: 0;
    }
    .num-badge-row {
      display: flex; align-items: center; gap: 16px; margin-bottom: 14px;
    }

    .doc-footer {
      margin-top: 30px; padding-top: 14px;
      border-top: 1px solid var(--hairline);
      font-size: 9.5px; color: var(--muted); text-align: center;
      letter-spacing: 0.3px;
    }

    .quote {
      padding: 14px 18px; background: var(--gold-tint);
      border-left: 3px solid var(--gold); border-radius: 6px;
      font-style: italic; font-size: 12px; color: var(--ink);
      margin: 14px 0;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="page cover-page">
    <div class="cover-brand">
      <div class="cover-brand-left">
        <div>
          <div class="cover-brand-name">BornClock</div>
          <div class="cover-brand-tag">Know your time. Live it well.</div>
        </div>
      </div>
      <div class="cover-meta">
        ${esc(data.dob.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))}<br>
        bornclock.com
      </div>
    </div>
    <div class="cover-main">
      <div class="cover-eyebrow">A Birthday Blueprint for</div>
      <div class="cover-name">${esc(data.recipientName)}</div>
      <div class="cover-line">Born on a ${esc(data.birthDayOfWeek)} · ${esc(data.dob.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))}</div>
      <div class="grid-4">
        <div class="stat">
          <div class="stat-value num">${fmt(data.ageYears)}</div>
          <div class="stat-label">Years Old</div>
        </div>
        <div class="stat">
          <div class="stat-value num">${fmt(data.daysLived)}</div>
          <div class="stat-label">Days Lived</div>
        </div>
        <div class="stat">
          <div class="stat-value" style="font-size:20px;">${esc(data.birthDayOfWeek)}</div>
          <div class="stat-label">Born on a</div>
        </div>
        <div class="stat">
          <div class="stat-value" style="font-size:20px;">${esc(data.nextBirthdayMonth)} ${data.nextBirthdayDay}</div>
          <div class="stat-label">Next Birthday</div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- 01 · KINDRED -->
  <div class="page">
    <div class="section-codeline">
      <div class="eyebrow">Born the Same Day</div>
      <div class="section-code">01 · KINDRED</div>
    </div>
    <h2>Celebrity Birthday Twins</h2>
    <div class="sub">Famous people born on ${esc(data.dob.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }))}, ranked by global recognition</div>
    <div class="grid-2">
      ${data.celebrities.map(c => `
        <div class="celeb ${c.tier === 'top' ? 'celeb-tier-top' : ''}">
          <div class="celeb-name">&#9733; ${esc(c.name)}</div>
          <div class="celeb-meta">b. ${esc(String(c.birthYear))}${c.deceased ? ' &#8224;' : ''}${c.nationality ? ' &middot; ' + esc(c.nationality) : ''}</div>
          ${c.bio ? `<div class="celeb-bio">${esc(c.bio)}</div>` : ''}
        </div>
      `).join('')}
    </div>
  </div>

  <div class="page-break"></div>

  <!-- 02 · ASTROLOGY -->
  <div class="page">
    <div class="section-codeline">
      <div class="eyebrow">Three Traditions</div>
      <div class="section-code">02 · ASTROLOGY</div>
    </div>
    <h2>Zodiac Profile</h2>
    <div class="sub">Western, Chinese &amp; Vedic &mdash; one person, three lenses</div>

    <div class="triptych">
      <div class="card">
        <div class="triptych-glyph">${esc(data.westernZodiac.glyph)}</div>
        <div class="triptych-label">Western Zodiac</div>
        <div class="triptych-value">${esc(data.westernZodiac.name)}</div>
        <div class="triptych-sub">${esc(data.westernZodiac.element)}</div>
      </div>
      <div class="card">
        <div class="triptych-glyph">${esc(data.chineseZodiac.emoji)}</div>
        <div class="triptych-label">Chinese Zodiac</div>
        <div class="triptych-value">${esc(data.chineseZodiac.animal)}</div>
        <div class="triptych-sub">${esc(data.chineseZodiac.element)} ${esc(data.chineseZodiac.polarity)}</div>
      </div>
      <div class="card">
        <div class="triptych-glyph">${esc(data.vedicRashi.glyph)}</div>
        <div class="triptych-label">Vedic Rashi</div>
        <div class="triptych-value">${esc(data.vedicRashi.name)}</div>
        <div class="triptych-sub">${esc(data.vedicRashi.english)}</div>
      </div>
    </div>

    <!-- Western Zodiac -->
    <div class="card">
      <h4>Western Zodiac</h4>
      <h3>${esc(data.westernZodiac.glyph)} ${esc(data.westernZodiac.name)}</h3>
      <div class="sub">${esc(data.westernZodiac.dateRange)}</div>
      <div style="margin-bottom:12px;">
        <span class="pill">${esc(data.westernZodiac.element)}</span>
        <span class="pill pill-blue">${esc(data.westernZodiac.modality)}</span>
        <span class="pill">${esc(data.westernZodiac.rulingPlanet)}</span>
      </div>
      <p>${esc(data.westernZodiac.description)}</p>
      <div class="rule-soft"></div>
      <h4>Strengths</h4>
      <div style="margin-bottom:10px;">
        ${data.westernZodiac.strengths.map(s => `<span class="pill pill-green">${esc(s)}</span>`).join('')}
      </div>
      <h4>Growth Areas</h4>
      <div style="margin-bottom:10px;">
        ${data.westernZodiac.growthAreas.map(s => `<span class="pill pill-amber">${esc(s)}</span>`).join('')}
      </div>
      <h4>Famous ${esc(data.westernZodiac.name)}s</h4>
      <p style="font-size:11.5px;">${esc(data.westernZodiac.famousList)}</p>
      <div class="rule-soft"></div>
      <h4>Top Compatible Signs</h4>
      <div class="grid-3">
        ${data.westernZodiac.compatibility.map(c => `
          <div class="card card-panel" style="text-align:center;margin-bottom:0;">
            <div style="font-size:18px;margin-bottom:4px;">${esc(c.glyph)}</div>
            <div style="font-weight:700;color:var(--navy);margin-bottom:2px;">${esc(c.sign)}</div>
            <div style="color:var(--gold);font-weight:700;margin-bottom:4px;">${c.pct}%</div>
            <div style="font-size:10px;color:var(--ink-soft);line-height:1.4;">${esc(c.reason)}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Chinese Zodiac -->
    <div class="card">
      <h4>Chinese Zodiac</h4>
      <h3>${esc(data.chineseZodiac.emoji)} ${esc(data.chineseZodiac.animal)}</h3>
      <div class="sub">Year ${data.chineseZodiac.year} &middot; Cycle: ${esc(data.chineseZodiac.cycleYears)}</div>
      <div style="margin-bottom:12px;">
        <span class="pill">${esc(data.chineseZodiac.element)}</span>
        <span class="pill">${esc(data.chineseZodiac.polarity)}</span>
      </div>
      <p>${esc(data.chineseZodiac.description)}</p>
      <div class="rule-soft"></div>
      <h4>Strengths</h4>
      <div style="margin-bottom:10px;">
        ${data.chineseZodiac.strengths.map(s => `<span class="pill pill-green">${esc(s)}</span>`).join('')}
      </div>
      <h4>Growth Areas</h4>
      <div style="margin-bottom:10px;">
        ${data.chineseZodiac.growthAreas.map(s => `<span class="pill pill-amber">${esc(s)}</span>`).join('')}
      </div>
      <div class="card card-gold" style="margin-bottom:0;">
        <h4>Love &amp; Relationships</h4>
        <p>${esc(data.chineseZodiac.loveAndRelationships)}</p>
      </div>
      <div class="grid-2" style="margin-top:10px;">
        <div class="card card-panel" style="margin-bottom:0;">
          <h4>Most Compatible</h4>
          <p>${esc(data.chineseZodiac.mostCompatible)}</p>
        </div>
        <div class="card card-panel" style="margin-bottom:0;">
          <h4>Challenging Match</h4>
          <p>${esc(data.chineseZodiac.challengingMatch)}</p>
        </div>
      </div>
      ${data.chineseZodiac.careerPaths ? `<div class="card card-panel" style="margin-top:10px;margin-bottom:0;"><h4>Career Paths</h4><p>${esc(data.chineseZodiac.careerPaths)}</p></div>` : ''}
      <h4 style="margin-top:14px;">Famous ${esc(data.chineseZodiac.animal)}s</h4>
      <p style="font-size:11.5px;">${esc(data.chineseZodiac.famousList)}</p>
      ${data.chineseZodiac.quote ? `<div class="quote">${esc(data.chineseZodiac.quote)}</div>` : ''}
    </div>

    <!-- Vedic Rashi -->
    <div class="card">
      <h4>Vedic Rashi</h4>
      <h3>${esc(data.vedicRashi.glyph)} ${esc(data.vedicRashi.name)}</h3>
      <div class="sub">${esc(data.vedicRashi.english)} &middot; Ruled by ${esc(data.vedicRashi.rulingPlanet)}</div>
      <div style="margin-bottom:12px;">
        <span class="pill">${esc(data.vedicRashi.element)}</span>
        <span class="pill">${esc(data.vedicRashi.rulingPlanet)}</span>
      </div>
      ${data.vedicRashi.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}
      ${data.vedicRashi.westernVsVedicNote ? `<div class="card card-gold" style="margin-top:12px;margin-bottom:0;"><strong style="color:var(--gold);">Western vs Vedic:</strong> ${esc(data.vedicRashi.westernVsVedicNote)}</div>` : ''}
      ${data.vedicRashi.coreTraits.length > 0 ? `<h4 style="margin-top:14px;">Core Traits</h4><div style="margin-bottom:12px;">${data.vedicRashi.coreTraits.map(t => `<span class="pill">${esc(t)}</span>`).join('')}</div>` : ''}
      <div class="grid-3">
        ${data.vedicRashi.career ? `<div class="card card-panel" style="margin-bottom:0;"><h4>Career</h4><p>${esc(data.vedicRashi.career)}</p></div>` : ''}
        ${data.vedicRashi.relationships ? `<div class="card card-panel" style="margin-bottom:0;"><h4>Relationships</h4><p>${esc(data.vedicRashi.relationships)}</p></div>` : ''}
        ${data.vedicRashi.spiritual ? `<div class="card card-panel" style="margin-bottom:0;"><h4>Spiritual</h4><p>${esc(data.vedicRashi.spiritual)}</p></div>` : ''}
      </div>
      <div style="margin-top:12px;font-size:11px;color:var(--ink-soft);">
        ${data.vedicRashi.colors ? `<strong>Colors:</strong> ${esc(data.vedicRashi.colors)}` : ''}
        ${data.vedicRashi.numbers ? ` &nbsp;&middot;&nbsp; <strong>Numbers:</strong> ${esc(data.vedicRashi.numbers)}` : ''}
        ${data.vedicRashi.gemstone ? ` &nbsp;&middot;&nbsp; <strong>Gemstone:</strong> ${esc(data.vedicRashi.gemstone)}` : ''}
      </div>
    </div>

    <!-- Moon Sign + Nakshatra -->
    <div class="card">
      <h4>Vedic Astrology</h4>
      <h3>Moon Sign &amp; Nakshatra</h3>
      <div class="sub">Where the Moon resided at the moment of birth</div>

      <div class="card card-panel" style="margin-bottom:14px;">
        <p style="font-size:11px;">${esc(data.moonSign.explainer)}</p>
      </div>

      <div class="card card-gold" style="margin-bottom:14px;">
        <h3>${esc(data.moonSign.glyph)} ${esc(data.moonSign.name)} Moon</h3>
        <div class="sub">${esc(data.moonSign.element)} &middot; Ruled by ${esc(data.moonSign.rulingPlanet)}</div>
        ${data.moonSign.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}
      </div>

      <div class="card card-gold" style="margin-bottom:0;">
        <h4>Birth Nakshatra #${data.nakshatra.number}</h4>
        <h3>${esc(data.nakshatra.name)}</h3>
        <div class="sub">${esc(data.nakshatra.meaning)} &middot; ${esc(data.nakshatra.deity)}</div>
        ${data.nakshatra.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}
        <div class="rule-soft"></div>
        <div style="font-size:11px;color:var(--ink-soft);">
          ${data.nakshatra.shakti ? `<strong>Shakti:</strong> ${esc(data.nakshatra.shakti)}<br>` : ''}
          ${data.nakshatra.ruler ? `<strong>Ruler:</strong> ${esc(data.nakshatra.ruler)}` : ''}
          ${data.nakshatra.gemstone ? ` &nbsp;&middot;&nbsp; <strong>Gemstone:</strong> ${esc(data.nakshatra.gemstone)}` : ''}
        </div>
        <div class="grid-3" style="margin-top:12px;">
          ${data.nakshatra.career ? `<div class="card card-panel" style="margin-bottom:0;"><h4>Career</h4><p>${esc(data.nakshatra.career)}</p></div>` : ''}
          ${data.nakshatra.relationships ? `<div class="card card-panel" style="margin-bottom:0;"><h4>Relationships</h4><p>${esc(data.nakshatra.relationships)}</p></div>` : ''}
          ${data.nakshatra.spiritual ? `<div class="card card-panel" style="margin-bottom:0;"><h4>Spiritual</h4><p>${esc(data.nakshatra.spiritual)}</p></div>` : ''}
        </div>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- 03 · NUMBERS -->
  <div class="page">
    <div class="section-codeline">
      <div class="eyebrow">Your Numerology Blueprint</div>
      <div class="section-code">03 · NUMBERS</div>
    </div>
    <h2>Numbers &amp; Life Path</h2>
    <div class="sub">Calculated from the exact date of birth</div>

    <div class="card card-panel">
      <h4>What is Numerology?</h4>
      <p>Numerology is the ancient study of the relationship between numbers and life events. Its modern form &mdash; Pythagorean numerology &mdash; reduces names and birth dates to single digits (or the master numbers 11, 22, 33) and reads the vibrational meaning of each. Every number in your chart reveals a different dimension of who you are.</p>
      <p style="font-size:11px;color:var(--ink-soft);margin-top:8px;"><strong>Life Path</strong> &mdash; your core life purpose. Reduce the full birth date to one digit.</p>
      <p style="font-size:11px;color:var(--ink-soft);"><strong>Soul Urge</strong> &mdash; your heart's deepest desire. Built from the vowels of your full birth name.</p>
      <p style="font-size:11px;color:var(--ink-soft);"><strong>Personality</strong> &mdash; how others perceive you. Built from the consonants of your birth name.</p>
      <p style="font-size:11px;color:var(--ink-soft);"><strong>Personal Year</strong> &mdash; your current annual cycle. Resets each birthday.</p>
    </div>

    <div class="card card-gold">
      <div class="num-badge-row">
        <div class="num-badge">${data.lifePath.number}</div>
        <div>
          <h3>${esc(data.lifePath.title)}</h3>
          <div class="sub" style="margin-bottom:0;">${esc(data.lifePath.keywords)}</div>
        </div>
      </div>
      <div class="grid-2">
        <div class="card card-panel" style="margin-bottom:0;text-align:center;">
          <div class="stat-value num" style="color:var(--gold);">${data.lifePath.number}</div>
          <div class="stat-label">Life Path</div>
          <div style="font-size:10.5px;color:var(--muted);margin-top:4px;">Your core life purpose</div>
        </div>
        <div class="card card-panel" style="margin-bottom:0;text-align:center;">
          <div class="stat-value num" style="color:var(--gold);">${data.personalYear.number}</div>
          <div class="stat-label">Personal Year</div>
          <div style="font-size:10.5px;color:var(--muted);margin-top:4px;">Your ${data.personalYear.year} energy</div>
        </div>
      </div>
      <h4 style="margin-top:14px;">Personality</h4>
      ${data.lifePath.personality.split('\n\n').map(p => `<p>${esc(p)}</p>`).join('')}
      <div class="grid-2" style="margin-top:14px;">
        <div>
          <h4>Strengths</h4>
          ${data.lifePath.strengths.map(s => `<div style="font-size:11px;margin-bottom:4px;">&#10003; ${esc(s)}</div>`).join('')}
        </div>
        <div>
          <h4>Growth Areas</h4>
          ${data.lifePath.growthAreas.map(s => `<div style="font-size:11px;margin-bottom:4px;">&rarr; ${esc(s)}</div>`).join('')}
        </div>
      </div>
    </div>

    <div class="card card-gold">
      <div class="num-badge-row">
        <div class="num-badge">${data.personalYear.number}</div>
        <div>
          <h3>Personal Year ${data.personalYear.number} in ${data.personalYear.year}</h3>
          ${data.personalYear.title ? `<div class="sub" style="margin-bottom:0;">${esc(data.personalYear.title)}</div>` : ''}
        </div>
      </div>
      <p>${esc(data.personalYear.description)}</p>
      <div class="grid-2" style="margin-top:12px;">
        <div class="card card-panel" style="margin-bottom:0;">
          <h4>Love &amp; Relationships</h4>
          <p>${esc(data.personalYear.love)}</p>
        </div>
        <div class="card card-panel" style="margin-bottom:0;">
          <h4>Career &amp; Money</h4>
          <p>${esc(data.personalYear.career)}</p>
        </div>
        <div class="card card-panel" style="margin-bottom:0;">
          <h4>Health &amp; Energy</h4>
          <p>${esc(data.personalYear.health)}</p>
        </div>
        <div class="card card-panel" style="margin-bottom:0;">
          <h4>Key Months</h4>
          ${data.personalYear.keyMonths.map(m => `<div style="font-size:11px;">&middot; ${esc(m)}</div>`).join('')}
        </div>
      </div>
      ${data.personalYear.quote ? `<div class="quote">${esc(data.personalYear.quote)}</div>` : ''}
    </div>
  </div>

  <div class="page-break"></div>

  <!-- 04 · NAME -->
  <div class="page">
    <div class="section-codeline">
      <div class="eyebrow">Gematria</div>
      <div class="section-code">04 · NAME</div>
    </div>
    <h2>Name Numerology</h2>
    <div class="sub">The numbers encoded in ${esc(data.recipientName)}'s name</div>

    <div class="card card-panel">
      ${data.nameNumerology.gematriaExplainer.split('\n\n').map(p => `<p style="font-size:11px;">${esc(p)}</p>`).join('')}
    </div>

    <div class="grid-3">
      <div class="card card-gold" style="text-align:center;">
        <div class="stat-value num" style="color:var(--gold);">${data.nameNumerology.expression.number}</div>
        <div class="stat-label">Expression</div>
        <div style="font-size:10.5px;color:var(--muted);margin-top:4px;">Who you are destined to be</div>
      </div>
      <div class="card card-gold" style="text-align:center;">
        <div class="stat-value num" style="color:var(--gold);">${data.nameNumerology.soulUrge.number}</div>
        <div class="stat-label">Soul Urge</div>
        <div style="font-size:10.5px;color:var(--muted);margin-top:4px;">What your heart desires</div>
      </div>
      <div class="card card-gold" style="text-align:center;">
        <div class="stat-value num" style="color:var(--gold);">${data.nameNumerology.personality.number}</div>
        <div class="stat-label">Personality</div>
        <div style="font-size:10.5px;color:var(--muted);margin-top:4px;">How others perceive you</div>
      </div>
    </div>

    <div class="card">
      <h3>Expression ${data.nameNumerology.expression.number} &mdash; ${esc(data.nameNumerology.expression.title)}</h3>
      <p>${esc(data.nameNumerology.expression.description)}</p>
    </div>
    <div class="card">
      <h3>Soul Urge ${data.nameNumerology.soulUrge.number} &mdash; ${esc(data.nameNumerology.soulUrge.title)}</h3>
      ${data.nameNumerology.soulUrge.description.split('\n\n').map(p => `<p>${esc(p)}</p>`).join('')}
    </div>
    <div class="card">
      <h3>Personality ${data.nameNumerology.personality.number} &mdash; ${esc(data.nameNumerology.personality.title)}</h3>
      <p>${esc(data.nameNumerology.personality.description)}</p>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- 05–09: STUB — populated in session 10c -->
  <div class="page">
    <div class="section-codeline">
      <div class="eyebrow">Coming in 10c</div>
      <div class="section-code">05 &mdash; 09</div>
    </div>
    <h2>Remaining Sections</h2>
    <p style="color:var(--muted);">Tarot, Talisman, Cosmos, Era, and Cycles will land in the next session. Sections 1&ndash;4 above are the architectural test of the new PDF pipeline.</p>
  </div>

  <div class="doc-footer">
    Generated by BornClock &middot; ${esc(generatedDate)} &middot; bornclock.com
  </div>

</body>
</html>`;
}
