type RetiredRouteResponse = { status(code: number): RetiredRouteResponse; json(body: unknown): RetiredRouteResponse };

/** This legacy logs endpoint is retired; use the authenticated admin interface. */
export default function handler(_req: unknown, res: RetiredRouteResponse) {
  return res.status(410).json({ error: 'This admin logs endpoint has been retired.' });
}
