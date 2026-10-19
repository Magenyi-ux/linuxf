type ApiRequest = { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown };
type ApiResponse = { status(code: number): ApiResponse; json(value: unknown): ApiResponse; setHeader(name: string, value: string): void };

/**
 * Analytics is now sent directly through the privacy-minimised PostHog client.
 * This route intentionally performs no storage and accepts no event payload.
 */
export default function handler(_req: ApiRequest, res: ApiResponse) {
  return res.status(410).json({ error: "This analytics endpoint has been retired." });
}
