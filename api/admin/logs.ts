import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Simple Basic Auth check
  const authHeader = req.headers.authorization;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('Admin credentials not configured');
    return res.status(500).json({ error: 'Internal Server Error: Admin credentials not configured' });
  }

  const expectedAuth = `Basic ${Buffer.from(`${adminEmail}:${adminPassword}`).toString('base64')}`;

  if (!authHeader || authHeader !== expectedAuth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const events = await kv.lrange('examply_events', 0, 100);
    const featureUsage = await kv.hgetall('examply_feature_usage');
    const stats = await kv.hgetall('examply_stats');

    res.status(200).json({
      events: events.map(e => typeof e === 'string' ? JSON.parse(e) : e),
      featureUsage,
      stats
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
}
