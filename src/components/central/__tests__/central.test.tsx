// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import {
  ToolLayout, ReportLayout, CollectionLayout, ArticleLayout, MoneyLayout, UtilityLayout, HubLayout,
  PajPage,
} from '../index';
import { THEMES, THEME_TOKENS } from '../themes';

afterEach(cleanup);

const wrap = (ui: React.ReactElement) =>
  render(<HelmetProvider><MemoryRouter>{ui}</MemoryRouter></HelmetProvider>);

describe('central/themes — theme selection', () => {
  it('TC-CENTRAL-THEME-01: all five themes defined with full token sets', () => {
    expect([...THEMES]).toEqual(['vedic', 'birthday', 'mystic', 'science', 'neutral']);
    for (const t of THEMES) {
      const k = THEME_TOKENS[t];
      for (const key of ['accent', 'accentText', 'green', 'bg', 'line'] as const) {
        expect(k[key]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });

  it('TC-CENTRAL-THEME-02: themes.css has a [data-theme] rule for every theme (stays in sync)', () => {
    const css = readFileSync('src/styles/central/themes.css', 'utf8');
    for (const t of THEMES) {
      expect(css).toContain(`.paj[data-theme="${t}"]`);
    }
    // science must switch to a white background (no ivory) per the spec
    expect(css).toMatch(/data-theme="science"[^}]*--bg:#FFFFFF/);
  });

  it('TC-CENTRAL-THEME-03: PajPage sets both data-theme (canonical) and data-category (back-compat)', () => {
    wrap(<PajPage theme="vedic" breadcrumb={{ current: 'X' }}><p>body</p></PajPage>);
    const root = document.querySelector('.paj');
    expect(root?.getAttribute('data-theme')).toBe('vedic');
    expect(root?.getAttribute('data-category')).toBe('vedic');
  });
});

const HEADER_LAYOUTS: Array<[string, React.FC<any>, string]> = [
  ['ToolLayout', ToolLayout, 'workbench'],
  ['ReportLayout', ReportLayout, 'editorial'],
  ['CollectionLayout', CollectionLayout, 'atlas'],
  ['ArticleLayout', ArticleLayout, 'editorial'],
  ['MoneyLayout', MoneyLayout, 'editorial'],
  ['UtilityLayout', UtilityLayout, ''],
];

describe('central/layouts — each layout owns the header block', () => {
  for (const [name, Layout, variant] of HEADER_LAYOUTS) {
    it(`TC-CENTRAL-LAYOUT ${name}: themed root, single H1, breadcrumb + eyebrow + lead`, () => {
      wrap(
        <Layout
          theme="vedic"
          breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Demo Page', edition: 'Sidereal' }}
          eyebrow="The Eyebrow"
          h1="The Heading"
          lead="The lead paragraph."
          trust="A trust claim."
        >
          <section className="section"><p>child content</p></section>
        </Layout>,
      );
      const root = document.querySelector('.paj');
      expect(root).toBeTruthy();
      expect(root?.getAttribute('data-theme')).toBe('vedic');
      if (variant) expect(root?.className).toContain(variant);
      // exactly one h1, with the given text
      const h1s = document.querySelectorAll('h1');
      expect(h1s.length).toBe(1);
      expect(h1s[0].textContent).toBe('The Heading');
      // header block pieces present
      expect(document.querySelector('.eyebrow')?.textContent).toBe('The Eyebrow');
      expect((document.body.textContent || '')).toContain('The lead paragraph.');
      expect((document.body.textContent || '')).toContain('A trust claim.');
      // breadcrumb from the shell
      expect(document.querySelector('.breadcrumb .crumb-name')?.textContent).toBe('Demo Page');
      // single <main> landmark
      expect(document.querySelectorAll('main#main').length).toBe(1);
    });
  }

  it('TC-CENTRAL-LAYOUT HubLayout: hero slot + themed root + single H1 + breadcrumb', () => {
    wrap(
      <HubLayout
        theme="vedic"
        breadcrumb={{ current: 'Vedic Astrology', edition: 'Sidereal' }}
        hero={<section className="hero"><h1>Hub Heading</h1><p className="lead">Hub lead.</p></section>}
      >
        <section className="section"><p>hub body</p></section>
      </HubLayout>,
    );
    const root = document.querySelector('.paj');
    expect(root?.getAttribute('data-theme')).toBe('vedic');
    expect(document.querySelectorAll('h1').length).toBe(1);
    expect(document.querySelector('h1')?.textContent).toBe('Hub Heading');
    expect(document.querySelector('.breadcrumb .crumb-name')?.textContent).toBe('Vedic Astrology');
  });
});
