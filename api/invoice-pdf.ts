// api/invoice-pdf.ts — GET /api/invoice-pdf?invoice_no=BC/26-27/1001
//
// Returns a real PDF of the caller's OWN invoice. Auth + ownership are enforced
// server-side (invoices.user_id must equal the authenticated user). On a rendering
// outage it returns the invoice HTML (the user can still print) — never a 500 for
// a rendering failure. Uses the same generateInvoiceHTML + Browser Rendering path
// as the email attachment.
import { createClient } from '@supabase/supabase-js';
import { generateInvoiceHTML } from '../src/lib/invoice-generator.js';
import { renderPdfFromHtml } from './_pdf.js';

function serviceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const invoiceNo = new URL(request.url).searchParams.get('invoice_no');
  if (!invoiceNo) {
    return json({ error: 'Missing invoice_no' }, 400);
  }

  const db = serviceClient();

  // Authenticate the caller (same pattern as save-report.ts).
  const authHeader = request.headers.get('authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return json({ error: 'Unauthorized' }, 401);
  }
  const { data: userData } = await db.auth.getUser(authHeader.slice(7));
  const userId = userData?.user?.id;
  if (!userId) {
    return json({ error: 'Unauthorized' }, 401);
  }

  // Load the invoice and verify OWNERSHIP (service client bypasses RLS, so the
  // ownership check is enforced here explicitly).
  const { data: row, error } = await db
    .from('invoices')
    .select('*')
    .eq('invoice_no', invoiceNo)
    .single();
  if (error || !row) {
    return json({ error: 'Invoice not found' }, 404);
  }
  if ((row as any).user_id !== userId) {
    return json({ error: 'Forbidden' }, 403);
  }

  const html = generateInvoiceHTML(row as any);
  const safeNo = invoiceNo.replace(/\//g, '-');

  const pdf = await renderPdfFromHtml(html, invoiceNo);
  if (pdf) {
    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeNo}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  }

  // Rendering outage → return the HTML so the user can still print. Not a 500.
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="${safeNo}.html"`,
      'Cache-Control': 'private, no-store',
    },
  });
}

export const GET = handler;
