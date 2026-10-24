// @vitest-environment jsdom
import { afterEach, describe, it, expect } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Remedies, RemediesForFindings } from '../Remedies';
import RemediesPage from '@/pages/RemediesPage';
import { REMEDIES } from '@/lib/vedic/remedies';

afterEach(cleanup);

const inRouter = (ui: React.ReactNode, path = '/') => render(
  <HelmetProvider>
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={ui} />
        <Route path="/remedies" element={<RemediesPage />} />
        <Route path="/remedies/:slug" element={<RemediesPage />} />
        <Route path="/hi/upay" element={<RemediesPage lang="hi" />} />
        <Route path="/hi/upay/:slug" element={<RemediesPage lang="hi" />} />
      </Routes>
    </MemoryRouter>
  </HelmetProvider>,
);

describe('Remedies block', () => {
  it('shows the meaning and all six "what you can do" sections in order', () => {
    inRouter(<Remedies remedyKey="manglik" open />);
    expect(screen.getByTestId('remedy-meaning')).toBeTruthy();
    const ids = ['remedy-free', 'remedy-daan', 'remedy-puja', 'remedy-temples', 'remedy-gem', 'remedy-consult'];
    const nodes = ids.map(id => screen.getByTestId(id));
    for (let i = 1; i < nodes.length; i++) {
      // DOCUMENT_POSITION_FOLLOWING = 4 → free remedies come first, consult last.
      expect(nodes[i - 1].compareDocumentPosition(nodes[i]) & 4).toBe(4);
    }
    expect(screen.getAllByTestId('remedy-mantra')[0].textContent).toContain('ॐ क्रां क्रीं क्रौं सः भौमाय नमः');
    expect(screen.getByTestId('remedy-gem-caution').textContent).toMatch(/under 18/);
    expect(screen.getAllByTestId('remedy-temple')[0].textContent).toContain('Ujjain');
  });
  it('renders nothing for an unknown key and nothing for no findings', () => {
    const { container } = inRouter(<><Remedies remedyKey="nope" /><RemediesForFindings findings={[]} /></>);
    expect(container.textContent).toBe('');
  });
  it('renders in Hindi', () => {
    inRouter(<Remedies remedyKey="sadeSati" lang="hi" open />);
    expect(document.body.textContent).toContain('आपके लिए इसका अर्थ');
    expect(document.body.textContent).toContain('ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः');
  });
});

describe('/remedies pages', () => {
  it('hub lists every entry', () => {
    inRouter(null, '/remedies');
    for (const r of REMEDIES) expect(screen.getByTestId(`remedies-hub-${r.slug}`)).toBeTruthy();
  });
  it.each(REMEDIES.map(r => r.slug))('/remedies/%s and /hi/upay/%s render the full page', (slug) => {
    inRouter(null, `/remedies/${slug}`);
    expect(screen.getByTestId('remedy-page')).toBeTruthy();
    expect(screen.getByTestId('remedy-consult')).toBeTruthy();
    cleanup();
    inRouter(null, `/hi/upay/${slug}`);
    expect(screen.getByTestId('remedy-page')).toBeTruthy();
    expect(document.body.textContent).toContain('आप क्या कर सकते हैं');
  });
});
