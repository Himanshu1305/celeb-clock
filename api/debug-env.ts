function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(request: Request, envObj?: Record<string, string>): Promise<Response> {
  const processEnvKeys = typeof process !== 'undefined' && process.env
    ? Object.keys(process.env).filter(k => !/^(npm_|NODE_|PATH|HOME|USER|SHELL|TERM|PWD|LANG|LC_)/.test(k)).sort()
    : [];
  const envObjStringKeys = envObj
    ? Object.entries(envObj).filter(([, v]) => typeof v === 'string').map(([k]) => k).sort()
    : [];

  const cronFromEnv = envObj?.CRON_SECRET;
  const cronFromProcess = typeof process !== 'undefined' ? process.env.CRON_SECRET : undefined;
  const expected = cronFromEnv ?? cronFromProcess;

  const secret = request.headers.get('X-Debug');
  const authed = secret !== null && secret === expected;

  if (!authed) {
    // Return diagnostic without values — tells us if secrets are reaching the Worker at all
    return json({
      authed: false,
      reason: expected === undefined ? 'CRON_SECRET_not_in_env' : 'wrong_header_value',
      envObjKeyCount: envObjStringKeys.length,
      processEnvKeyCount: processEnvKeys.length,
      hasCronInEnvObj: cronFromEnv !== undefined,
      hasCronInProcessEnv: cronFromProcess !== undefined,
      hasRazorpayInEnvObj: envObj ? ('VITE_RAZORPAY_KEY_ID' in envObj || 'RAZORPAY_KEY_ID' in envObj) : false,
      hasRazorpayInProcessEnv: typeof process !== 'undefined' ? (!!process.env.VITE_RAZORPAY_KEY_ID || !!process.env.RAZORPAY_KEY_ID) : false,
      hasSupabaseInEnvObj: envObj ? 'SUPABASE_URL' in envObj : false,
      hasSupabaseInProcessEnv: typeof process !== 'undefined' ? !!process.env.SUPABASE_URL : false,
    }, 403);
  }

  const allKeys = Array.from(new Set([...processEnvKeys, ...envObjStringKeys])).sort();

  return json({
    authed: true,
    keys: allKeys,
    hasRazorpayId: allKeys.some(k => k === 'VITE_RAZORPAY_KEY_ID' || k === 'RAZORPAY_KEY_ID'),
    hasRazorpayIdVite: allKeys.includes('VITE_RAZORPAY_KEY_ID'),
    hasRazorpayIdPlain: allKeys.includes('RAZORPAY_KEY_ID'),
    hasRazorpaySecret: allKeys.includes('RAZORPAY_KEY_SECRET'),
    hasSupabaseUrl: allKeys.includes('SUPABASE_URL'),
    fromProcessEnv: processEnvKeys.some(k => k === 'VITE_RAZORPAY_KEY_ID' || k === 'RAZORPAY_KEY_ID'),
    fromEnvObject: envObjStringKeys.some(k => k === 'VITE_RAZORPAY_KEY_ID' || k === 'RAZORPAY_KEY_ID'),
    processEnvKeyCount: processEnvKeys.length,
    envObjKeyCount: envObjStringKeys.length,
  });
}
