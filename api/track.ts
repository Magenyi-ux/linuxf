import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Analytics is now sent directly through the privacy-minimised PostHog client.
 * This route intentionally performs no storage and accepts no event payload.
 */
export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(410).json({ error: 'This analytics endpoint has been retired.' });
}
