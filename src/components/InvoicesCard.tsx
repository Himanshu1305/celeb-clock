import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2 } from 'lucide-react';
import type { InvoiceRecord } from '@/lib/invoice-generator';

// Prints the invoice HTML via an off-screen A4 iframe (same approach as the
// Longevity blueprint export) — a full-size iframe avoids the mobile 1px-wrap bug.
function printInvoiceHTML(html: string) {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:0;left:-9999px;width:210mm;height:297mm;opacity:0;border:none;pointer-events:none;';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) { document.body.removeChild(iframe); return; }
  doc.open(); doc.write(html); doc.close();
  iframe.onload = () => {
    setTimeout(() => {
      try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); } catch { /* noop */ }
      setTimeout(() => { try { if (document.body.contains(iframe)) document.body.removeChild(iframe); } catch { /* noop */ } }, 1000);
    }, 400);
  };
}

function fmtAmount(amount: number, currency: string): string {
  const sym = currency === 'INR' ? '₹' : '$';
  return sym + Number(amount).toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function InvoicesCard({ userId }: { userId: string }) {
  const [invoices, setInvoices] = useState<InvoiceRecord[] | null>(null);
  const [error, setError] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // `invoices` is not in the generated Database types (created directly in
      // Studio), so cast the client for this query. RLS restricts rows to the user.
      const { data, error } = await (supabase as any)
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (cancelled) return;
      if (error) { setError(true); return; }
      setInvoices((data ?? []) as unknown as InvoiceRecord[]);
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const download = async (inv: InvoiceRecord) => {
    setDownloading(inv.invoice_no);
    try {
      const { generateInvoiceHTML } = await import('@/lib/invoice-generator');
      printInvoiceHTML(generateInvoiceHTML(inv));
    } finally {
      setTimeout(() => setDownloading(null), 800);
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-background/80 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-accent" /> Invoices
        </CardTitle>
        <CardDescription>Download your GST tax invoices.</CardDescription>
      </CardHeader>
      <CardContent>
        {invoices === null && !error && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        )}
        {error && (
          <p className="text-sm text-muted-foreground py-4">Couldn't load invoices. Please refresh or email hello@bornclock.com.</p>
        )}
        {invoices && invoices.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">Your invoices will appear here after your first purchase.</p>
        )}
        {invoices && invoices.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Invoice No</th>
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 pr-3 font-medium">Amount</th>
                  <th className="py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.invoice_no} className="border-b last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{inv.invoice_no}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{inv.invoice_date}</td>
                    <td className="py-2.5 pr-3">{fmtAmount(Number(inv.gross_amount), inv.currency)}</td>
                    <td className="py-2.5">
                      <Button size="sm" variant="outline" className="gap-1.5" disabled={downloading === inv.invoice_no} onClick={() => download(inv)}>
                        {downloading === inv.invoice_no ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
