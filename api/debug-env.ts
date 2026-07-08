function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const CHECK_KEYS = [
  'VITE_RAZORPAY_KEY_ID', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET',
  'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
  'CRON_SECRET', 'RESEND_API_KEY', 'ANTHROPIC_API_KEY',
];

export async function GET(request: Request, envObj?: Record<string, string>): Promise<Response> {
  // Access keys directly by name (CF Proxy — enumeration returns [])
  const cronFromEnv = envObj?.CRON_SECRET;
  const cronFromProcess = typeof process !== 'undefined' ? process.env.CRON_SECRET : undefined;
  const expected = cronFromEnv ?? cronFromProcess;

  const secret = request.headers.get('X-Debug');

  // Return diagnostic even without auth so we can see what the Proxy has
  const envHas: Record<string, boolean> = {};
  const processHas: Record<string, boolean> = {};
  for (const k of CHECK_KEYS) {
    envHas[k] = !!(envObj && envObj[k]);
    processHas[k] = typeof process !== 'undefined' ? !!process.env[k] : false;
  }

  const authed = secret !== null && expected !== undefined && secret === expected;

  if (!authed) {
    return json({
      authed: false,
      reason: expected === undefined ? 'CRON_SECRET_not_accessible' : 'wrong_header_value',
      // Direct property access on Proxy (not Object.entries):
      envHas,
      processHas,
      envEnumerableKeyCount: envObj ? Object.keys(envObj).length : -1,
    }, 403);
  }

  const envKeys = envObj ? Object.keys(envObj) : [];
  const processKeys = typeof process !== 'undefined'
    ? Object.keys(process.env).filter(k => !/^(npm_|NODE_|PATH|HOME|USER|SHELL|TERM|PWD|LANG|LC_)/.test(k)).sort()
    : [];

  return json({
    authed: true,
    envHas,
    processHas,
    envEnumerableKeys: envKeys.sort(),
    processEnvKeys: processKeys,
  });
}
