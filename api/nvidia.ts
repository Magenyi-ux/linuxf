import type { VercelRequest, VercelResponse } from "@vercel/node";

const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

async function authenticateUser(req: VercelRequest) {
  const authorization = req.headers.authorization;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!authorization?.startsWith("Bearer ")) {
    return { ok: false as const, status: 401, error: "Authentication required" };
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase authentication environment variables are not configured");
    return { ok: false as const, status: 500, error: "Authentication service is not configured" };
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: "GET",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: authorization,
      },
    });

    if (!response.ok) {
      return { ok: false as const, status: 401, error: "Invalid or expired session" };
    }

    const user = await response.json();

    if (!user?.id) {
      return { ok: false as const, status: 401, error: "Invalid session" };
    }

    return { ok: true as const, userId: user.id };
  } catch (error) {
    console.error("Supabase authentication failed:", error);
    return { ok: false as const, status: 503, error: "Authentication service unavailable" };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await authenticateUser(req);

  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const apiKey = process.env.NVIDIA_NIM_API_KEY;

  if (!apiKey) {
    console.error("NVIDIA_NIM_API_KEY environment variable is not configured");
    return res.status(500).json({ error: "AI service is not configured" });
  }

  const body = req.body;

  if (!body || typeof body !== "object" || !Array.isArray(body.messages) || body.messages.length === 0) {
    return res.status(400).json({ error: "A non-empty messages array is required" });
  }

  try {
    const response = await fetch(NVIDIA_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: typeof body.model === "string" ? body.model : "meta/llama-3.1-8b-instruct",
        messages: body.messages,
        max_tokens:
          typeof body.max_tokens === "number"
            ? Math.min(Math.max(body.max_tokens, 1), 2048)
            : 1024,
        temperature:
          typeof body.temperature === "number"
            ? Math.min(Math.max(body.temperature, 0), 1)
            : 0.2,
        stream: false,
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("NVIDIA NIM request failed:", response.status, text.slice(0, 500));
      return res.status(response.status).json({
        error: "AI provider request failed",
        providerStatus: response.status,
      });
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: "AI provider returned an invalid response" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("NVIDIA NIM request error:", error);
    return res.status(502).json({ error: "Unable to reach AI provider" });
  }
}
