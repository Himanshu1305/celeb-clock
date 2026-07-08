import { createClient } from '@supabase/supabase-js';

function serviceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { reportData, isPremium, gender } = body ?? {};
  if (!reportData) {
    return json({ error: 'Missing reportData' }, 400);
  }

  const db = serviceClient();

  let userId: string | null = null;
  const authHeader = request.headers.get('authorization') ?? '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const { data } = await db.auth.getUser(token);
    userId = data?.user?.id ?? null;
  }

  const expiryDays = isPremium ? 30 : 7;
  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();

  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = generateSlug();
    const { error } = await db.from('birthday_reports').insert({
      user_id: userId,
      slug,
      recipient_name: reportData.recipientName,
      recipient_dob: reportData.recipientDob,
      gifter_name: reportData.gifterName || null,
      personal_message: reportData.personalMessage || null,
      country: reportData.country,
      gender: gender ?? '',
      report_data: reportData,
      is_premium_report: isPremium ?? false,
      expires_at: expiresAt,
    });

    if (!error) return json({ slug });
    if (!String(error.message).includes('unique')) break;
  }

  return json({ error: 'Failed to save report' }, 500);
}

export const POST = handler;
