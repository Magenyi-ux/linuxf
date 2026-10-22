import { timingSafeEqual } from "node:crypto";

type Request = { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown };
type Response = { status(code: number): Response; json(value: unknown): Response; setHeader(name: string, value: string): void };

function sameSecret(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const config = { maxDuration: 300 };

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const expectedToken = process.env.VIDEO_GENERATOR_TOKEN;
  const suppliedHeader = req.headers["x-video-access-token"];
  const suppliedToken = Array.isArray(suppliedHeader) ? suppliedHeader[0] : suppliedHeader;
  if (!expectedToken) {
    console.error("VIDEO_GENERATOR_TOKEN is not configured");
    return res.status(503).json({ error: "Private video access is not configured yet." });
  }
  if (!suppliedToken || !sameSecret(suppliedToken, expectedToken)) {
    return res.status(401).json({ error: "Invalid or expired private link. Ask the owner for a valid link." });
  }

  const apiUrl = process.env.NVIDIA_VIDEO_API_URL;
  const apiKey = process.env.NVIDIA_VIDEO_API_KEY || process.env.NVIDIA_NIM_API_KEY;
  if (!apiUrl || !apiKey) {
    return res.status(503).json({ error: "The NVIDIA video endpoint is not configured yet." });
  }

  const body = req.body as { prompt?: unknown; seconds?: unknown; size?: unknown; input_reference?: unknown } | null;
  if (!body || typeof body !== "object" || typeof body.prompt !== "string") {
    return res.status(400).json({ error: "A video prompt is required." });
  }
  const prompt = body.prompt.trim();
  if (prompt.length < 8 || prompt.length > 1800) {
    return res.status(400).json({ error: "Prompt must be between 8 and 1,800 characters." });
  }

  const seconds = Number(body.seconds ?? 4);
  if (![4, 5, 8].includes(seconds)) {
    return res.status(400).json({ error: "Choose a supported duration." });
  }
  const size = body.size === "480x832" ? "480x832" : "832x480";
  const payload: Record<string, unknown> = {
    model: process.env.NVIDIA_VIDEO_MODEL || "wan-ai/wan2.2",
    prompt,
    size,
    seconds,
  };

  if (typeof body.input_reference === "string" && body.input_reference) {
    if (body.input_reference.length > 7_000_000 || !/^data:image\/(jpeg|png|webp);base64,/.test(body.input_reference)) {
      return res.status(400).json({ error: "Reference image must be a JPG, PNG, or WebP image up to 5 MB." });
    }
    payload.input_reference = body.input_reference;
  }

  try {
    const upstream = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(285_000),
    });
    const text = await upstream.text();
    let result: any;
    try { result = JSON.parse(text); } catch { result = null; }
    if (!upstream.ok) {
      console.error("NVIDIA video request failed", upstream.status, text.slice(0, 1200));
      const safeMessage = typeof result?.error?.message === "string" ? result.error.message.slice(0, 300) : "The NVIDIA video service rejected the request.";
      return res.status(upstream.status >= 500 ? 502 : upstream.status).json({ error: safeMessage });
    }

    // NVIDIA's documented WAN 2.2 response uses data.b64_json (an object),
    // while some compatible wrappers return data as an array. Accept both.
    const dataItem = Array.isArray(result?.data) ? result.data[0] : result?.data;
    const b64 = dataItem?.b64_json || dataItem?.b64_video || result?.b64_video || result?.artifacts?.[0]?.base64;
    const url = dataItem?.url || result?.video_url || result?.url;
    if (typeof b64 === "string" && b64.length > 0) return res.status(200).json({ b64_json: b64 });
    if (typeof url === "string" && /^https:\/\//i.test(url)) return res.status(200).json({ videoUrl: url });
    console.error("NVIDIA video response had no recognized video payload", JSON.stringify(result).slice(0, 1000));
    return res.status(502).json({ error: "The configured endpoint returned an unexpected response format." });
  } catch (error) {
    console.error("NVIDIA video generation request failed", error);
    return res.status(504).json({ error: "Video generation timed out or the NVIDIA endpoint could not be reached. Try a shorter clip." });
  }
}
