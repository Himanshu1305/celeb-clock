// @vitest-environment jsdom
// Batch 10 — FAQ visibility: every page that emits FAQPage JSON-LD must show each question
// on the page and keep each answer in the HTML (Google's FAQ structured-data rule). Uses the
// same checker as validate-dist V10 (scripts/lib/faqVisible.mjs) on the rendered document.
import { afterEach, describe, it, expect } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import type { ComponentType } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { faqVisibilityProblems, faqEntries } from '../../../scripts/lib/faqVisible.mjs';
import { BIRTHSTONE_DATA } from '@/data/birthstoneData';
import { BirthDateProvider } from '@/context/BirthDateContext';
import Generation from '../Generation';
import PlanetaryAgePage from '../PlanetaryAgePage';
import ManglikPage from '../ManglikPage';
import KaalSarpDoshaPage from '../KaalSarpDoshaPage';
import DashaCalculatorPage from '../DashaCalculatorPage';
import PersonalYearNumberPage from '../PersonalYearNumberPage';
import AngelNumbersPage from '../AngelNumbersPage';
import BirthstonePage from '../BirthstonePage';
import HowDoesStressAffectLifeExpectancy from '../answers/HowDoesStressAffectLifeExpectancy';
import HowLongWillILive from '../answers/HowLongWillILive';
import HowManyDaysUntilMyBirthday from '../answers/HowManyDaysUntilMyBirthday';
import HowOldAmIOnMars from '../answers/HowOldAmIOnMars';
import HowToCalculateAge from '../answers/HowToCalculateAge';
import HowToLiveLonger from '../answers/HowToLiveLonger';
import WhatAffectsLifeExpectancyMost from '../answers/WhatAffectsLifeExpectancyMost';
import WhatGenerationAmI from '../answers/WhatGenerationAmI';
import WhatIsBMI from '../answers/WhatIsBMI';
import WhatIsEpigeneticAge from '../answers/WhatIsEpigeneticAge';
import WhatIsLifeExpectancy from '../answers/WhatIsLifeExpectancy';
import WhatIsMyBiologicalAge from '../answers/WhatIsMyBiologicalAge';
import WhatIsMyLifePathNumber from '../answers/WhatIsMyLifePathNumber';
import WhatIsMyMoonSign from '../answers/WhatIsMyMoonSign';
import WhatIsMyZodiacSign from '../answers/WhatIsMyZodiacSign';
import WhatIsVedicAstrology from '../answers/WhatIsVedicAstrology';
import WhoSharesMyBirthday from '../answers/WhoSharesMyBirthday';

afterEach(cleanup);

const doc = () => `<html><head>${document.head.innerHTML}</head><body>${document.body.innerHTML}</body></html>`;

async function check(el: JSX.Element, path = '/', pattern = '/') {
  render(<HelmetProvider><BirthDateProvider><MemoryRouter initialEntries={[path]}><Routes><Route path={pattern} element={el} /></Routes></MemoryRouter></BirthDateProvider></HelmetProvider>);
  await waitFor(() => expect(faqEntries(doc()).length).toBeGreaterThan(0));
  expect(faqVisibilityProblems(doc())).toEqual([]);
  // exactly one FAQPage block (validate-dist V9)
  const blocks = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .map(s => { try { return JSON.parse(s.textContent || ''); } catch { return null; } })
    .filter(d => d && d['@type'] === 'FAQPage');
  expect(blocks).toHaveLength(1);
}

const PAGES: Array<[string, ComponentType]> = [
  ['Generation', Generation],
  ['PlanetaryAgePage', PlanetaryAgePage],
  ['ManglikPage', ManglikPage],
  ['KaalSarpDoshaPage', KaalSarpDoshaPage],
  ['DashaCalculatorPage', DashaCalculatorPage],
  ['PersonalYearNumberPage', PersonalYearNumberPage],
  ['AngelNumbersPage', AngelNumbersPage],
  ['HowDoesStressAffectLifeExpectancy', HowDoesStressAffectLifeExpectancy],
  ['HowLongWillILive', HowLongWillILive],
  ['HowManyDaysUntilMyBirthday', HowManyDaysUntilMyBirthday],
  ['HowOldAmIOnMars', HowOldAmIOnMars],
  ['HowToCalculateAge', HowToCalculateAge],
  ['HowToLiveLonger', HowToLiveLonger],
  ['WhatAffectsLifeExpectancyMost', WhatAffectsLifeExpectancyMost],
  ['WhatGenerationAmI', WhatGenerationAmI],
  ['WhatIsBMI', WhatIsBMI],
  ['WhatIsEpigeneticAge', WhatIsEpigeneticAge],
  ['WhatIsLifeExpectancy', WhatIsLifeExpectancy],
  ['WhatIsMyBiologicalAge', WhatIsMyBiologicalAge],
  ['WhatIsMyLifePathNumber', WhatIsMyLifePathNumber],
  ['WhatIsMyMoonSign', WhatIsMyMoonSign],
  ['WhatIsMyZodiacSign', WhatIsMyZodiacSign],
  ['WhatIsVedicAstrology', WhatIsVedicAstrology],
  ['WhoSharesMyBirthday', WhoSharesMyBirthday],
];

describe('FAQPage Q&As are visible on the page', () => {
  for (const [name, C] of PAGES) it(name, () => check(<C />));
  for (const b of BIRTHSTONE_DATA) it(`/birthstone/${b.slug}`, () => check(<BirthstonePage />, `/birthstone/${b.slug}`, '/birthstone/:month'));
});
