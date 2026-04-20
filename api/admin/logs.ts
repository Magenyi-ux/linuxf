import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Simple Basic Auth check
  const authHeader = req.headers.authorization;

  // We expect "Basic " + base64(admin@magenyi:magenyi123)
  // admin@magenyi:magenyi123 in base64 is YWRtaW5AbWFnZW55aTptYWdlbnlpMTIz
  const expectedAuth = 'Basic YWRtaW5AbWFnZW55aTptYWdlbnlpMTIz';

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
