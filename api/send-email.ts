import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendEmailDirect } from './_email.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const body = req.body ?? {};
  const { type, to, name } = body;
  if (!type || !to || !name) {
    return res.status(400).json({ error: 'Missing required fields: type, to, name' });
  }

  const ok = await sendEmailDirect(body);
  return ok
    ? res.status(200).json({ success: true })
    : res.status(500).json({ error: 'Failed to send email' });
}
