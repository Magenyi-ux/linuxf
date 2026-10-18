import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';
import { kv } from '@vercel/kv';

function isAuthorized(header: string | string[] | undefined, configuredToken: string | undefined): boolean {
  if (!configuredToken || !header || Array.isArray(header)) return false;
  const prefix = 'Bearer ';
  if (!header.startsWith(prefix)) return false;
  const supplied = Buffer.from(header.slice(prefix.length));
  const expected = Buffer.from(configuredToken);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const configuredToken = process.env.ADMIN_LOGS_TOKEN;
  if (!configuredToken) {
    console.error('ADMIN_LOGS_TOKEN is not configured');
    return res.status(503).json({ error: 'Admin logs are not configured' });
  }

  if (!isAuthorized(req.headers.authorization, configuredToken)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const events = await kv.lrange('examply_events', 0, 100);
    const featureUsage = await kv.hgetall('examply_feature_usage');
    const stats = await kv.hgetall('examply_stats');

    return res.status(200).json({
      events: events.map((e: unknown) => typeof e === 'string' ? JSON.parse(e) : e),
      featureUsage,
      stats
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({ error: 'Failed to fetch logs' });
  }
}
