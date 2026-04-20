import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { event, userId, email, data } = req.body;

  if (!event) {
    return res.status(400).json({ error: 'Missing event name' });
  }

  const timestamp = Date.now();
  const eventLog = {
    event,
    userId,
    email,
    data,
    timestamp,
    readableTime: new Date(timestamp).toISOString()
  };

  try {
    // Store in a list for chronological view
    await kv.lpush('examply_events', JSON.stringify(eventLog));

    // Trim to last 1000 events to manage storage
    await kv.ltrim('examply_events', 0, 999);

    // Also track aggregate usage for features
    if (event === 'feature_used' && data?.name) {
      await kv.hincrby('examply_feature_usage', data.name, 1);
    }

    if (event === 'question_asked') {
       await kv.hincrby('examply_stats', 'total_questions', 1);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ error: 'Failed to store event' });
  }
}
