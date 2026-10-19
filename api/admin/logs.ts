import { timingSafeEqual } from "node:crypto";

type ApiRequest = { method?: string; headers: Record<string, string | string[] | undefined> };
type ApiResponse = { status(code: number): ApiResponse; json(value: unknown): ApiResponse; setHeader(name: string, value: string): void };

function isAuthorized(header: string | string[] | undefined, configuredToken: string | undefined): boolean {
  if (!configuredToken || !header || Array.isArray(header)) return false;
  const prefix = "Bearer ";
  if (!header.startsWith(prefix)) return false;
  const supplied = Buffer.from(header.slice(prefix.length));
  const expected = Buffer.from(configuredToken);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

async function redisCommand<T>(url: string, token: string, command: (string | number)[]): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`KV request failed with status ${response.status}`);
  const payload = await response.json() as { result?: T; error?: string };
  if (payload.error) throw new Error(payload.error);
  return payload.result as T;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const configuredToken = process.env.ADMIN_LOGS_TOKEN;
  if (!configuredToken) {
    console.error("ADMIN_LOGS_TOKEN is not configured");
    return res.status(503).json({ error: "Admin logs are not configured" });
  }
  if (!isAuthorized(req.headers.authorization, configuredToken)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (!kvUrl || !kvToken) {
    console.error("KV_REST_API_URL or KV_REST_API_TOKEN is not configured");
    return res.status(503).json({ error: "Admin logs storage is not configured" });
  }

  try {
    const [events, featureUsageRaw, statsRaw] = await Promise.all([
      redisCommand<unknown[]>(kvUrl, kvToken, ["LRANGE", "examply_events", 0, 100]),
      redisCommand<unknown>(kvUrl, kvToken, ["HGETALL", "examply_feature_usage"]),
      redisCommand<unknown>(kvUrl, kvToken, ["HGETALL", "examply_stats"]),
    ]);
    const toHash = (value: unknown): Record<string, string> => {
      if (Array.isArray(value)) {
        const result: Record<string, string> = {};
        for (let index = 0; index + 1 < value.length; index += 2) {
          result[String(value[index])] = String(value[index + 1]);
        }
        return result;
      }
      return value && typeof value === "object" ? value as Record<string, string> : {};
    };
    return res.status(200).json({
      events: (events ?? []).map((event) => {
        if (typeof event !== "string") return event;
        try { return JSON.parse(event); } catch { return event; }
      }),
      featureUsage: toHash(featureUsageRaw),
      stats: toHash(statsRaw),
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return res.status(500).json({ error: "Failed to fetch logs" });
  }
}
