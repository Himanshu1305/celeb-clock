import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function serviceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reportData, isPremium, gender } = req.body ?? {};
  if (!reportData) {
    return res.status(400).json({ error: 'Missing reportData' });
  }

  const db = serviceClient();

  let userId: string | null = null;
  const authHeader = Array.isArray(req.headers['authorization'])
    ? req.headers['authorization'][0]
    : req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
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

    if (!error) return res.status(200).json({ slug });
    if (!String(error.message).includes('unique')) break;
  }

  return res.status(500).json({ error: 'Failed to save report' });
}
