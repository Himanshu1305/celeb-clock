function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(request: Request, envObj?: Record<string, string>): Promise<Response> {
  const secret = request.headers.get('X-Debug');
  const expected = envObj?.CRON_SECRET ?? process.env.CRON_SECRET;
  if (!secret || secret !== expected) {
    return new Response('Not Found', { status: 404 });
  }

  const processEnvKeys = typeof process !== 'undefined' && process.env
    ? Object.keys(process.env).sort()
    : [];
  const envObjKeys = envObj ? Object.keys(envObj).sort() : [];
  const allKeys = Array.from(new Set([...processEnvKeys, ...envObjKeys])).sort();

  return json({
    keys: allKeys,
    hasRazorpayId: allKeys.includes('VITE_RAZORPAY_KEY_ID') || allKeys.includes('RAZORPAY_KEY_ID'),
    hasRazorpayIdVite: allKeys.includes('VITE_RAZORPAY_KEY_ID'),
    hasRazorpayIdPlain: allKeys.includes('RAZORPAY_KEY_ID'),
    hasRazorpaySecret: allKeys.includes('RAZORPAY_KEY_SECRET'),
    hasSupabaseUrl: allKeys.includes('SUPABASE_URL'),
    fromProcessEnv: processEnvKeys.includes('VITE_RAZORPAY_KEY_ID') || processEnvKeys.includes('RAZORPAY_KEY_ID'),
    fromEnvObject: envObjKeys.includes('VITE_RAZORPAY_KEY_ID') || envObjKeys.includes('RAZORPAY_KEY_ID'),
    processEnvKeyCount: processEnvKeys.length,
    envObjKeyCount: envObjKeys.length,
  });
}
