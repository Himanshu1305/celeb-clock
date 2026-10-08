/**
 * Shared off-screen-iframe print helper (Growth P2). Mirrors the proven
 * LifeExpectancy blueprint mechanism: a real A4-sized off-screen iframe (so
 * mobile Safari/Chrome lay content out correctly, not into a 1px column),
 * write the HTML, print on load, clean up. Browser-side PDF via the print
 * dialog — no server call, no new dependency.
 */
export function printHtmlViaIframe(html: string): void {
  try {
    (window as unknown as { __LAST_PDF_HTML__?: string }).__LAST_PDF_HTML__ = html;
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:0;left:-9999px;width:210mm;height:297mm;opacity:0;border:none;pointer-events:none;';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) { document.body.removeChild(iframe); return; }
    doc.open('text/html', 'replace');
    doc.write(html);
    doc.close();
    const printAndCleanup = () => {
      try { iframe.contentWindow?.print(); } catch (e) { console.error('Print failed:', e); }
      setTimeout(() => { try { if (document.body.contains(iframe)) document.body.removeChild(iframe); } catch { /* noop */ } }, 5000);
    };
    iframe.onload = () => setTimeout(printAndCleanup, 800);
  } catch (e) {
    console.error('printHtmlViaIframe failed:', e);
  }
}
