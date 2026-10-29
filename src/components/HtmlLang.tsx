import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { pageLangForPath } from '@/lib/seo/pageLang.js';

/** Batch 10: <html lang> follows the route — "hi" on Hindi pages (/hi/*, *-hindi), "en"
 *  elsewhere. Declared through Helmet and also set directly, so it is already correct
 *  when the prerender snapshots the DOM (Helmet's head flush can lag — see prerender.mjs). */
export function HtmlLang() {
  const { pathname } = useLocation();
  const lang = pageLangForPath(pathname);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return <Helmet htmlAttributes={{ lang }} />;
}
