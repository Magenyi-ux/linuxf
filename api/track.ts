type RetiredRouteResponse = { status(code: number): RetiredRouteResponse; json(body: unknown): RetiredRouteResponse };

/**
 * Analytics is now sent directly through the privacy-minimised PostHog client.
 * This route intentionally performs no storage and accepts no event payload.
 */
export default function handler(_req: unknown, res: RetiredRouteResponse) {
  return res.status(410).json({ error: 'This analytics endpoint has been retired.' });
}
