// @vitest-environment jsdom
// Batch 10: <html lang> follows the route on the client (Hindi pages → "hi").
import { afterEach, describe, it, expect } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { HtmlLang } from '../HtmlLang';

afterEach(cleanup);
const at = (path: string) => render(<HelmetProvider><MemoryRouter initialEntries={[path]}><HtmlLang /></MemoryRouter></HelmetProvider>);

describe('HtmlLang', () => {
  it.each([['/hi/rashifal/mesh', 'hi'], ['/hi/kundli-milan', 'hi'], ['/biological-age-hindi', 'hi'], ['/kundali', 'en'], ['/', 'en']])('%s → %s', async (path, lang) => {
    document.documentElement.lang = lang === 'hi' ? 'en' : 'hi';
    at(path);
    await waitFor(() => expect(document.documentElement.lang).toBe(lang));
  });
});
