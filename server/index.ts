import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "64kb" }));

  // Report configuration without exposing credentials or the upstream URL.
  app.get("/api/video/status", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json({
      configured: Boolean(process.env.NVIDIA_VIDEO_API_URL && process.env.NVIDIA_API_KEY),
      model: "wan-ai/wan2.2",
      maxSeconds: 4,
    });
  });

  // A deliberately small, single-clip test endpoint. The API key remains server-side.
  app.post("/api/video/generate", async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
    const endpoint = process.env.NVIDIA_VIDEO_API_URL;
    const apiKey = process.env.NVIDIA_API_KEY;

    if (!endpoint || !apiKey) {
      return res.status(503).json({
        error: "Video generation is not configured yet. Add NVIDIA_VIDEO_API_URL and NVIDIA_API_KEY to the server environment first. No paid request was made.",
      });
    }

    if (prompt.length < 8 || prompt.length > 4000) {
      return res.status(400).json({ error: "Prompt must be between 8 and 4000 characters." });
    }

    try {
      const upstream = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          model: "wan-ai/wan2.2",
          prompt,
          size: "832x480",
          seconds: 4,
        }),
        signal: AbortSignal.timeout(300_000),
      });

      const payload = await upstream.json().catch(() => null);
      if (!upstream.ok) {
        const message =
          typeof payload?.detail === "string" ? payload.detail :
          typeof payload?.message === "string" ? payload.message :
          `NVIDIA endpoint returned HTTP ${upstream.status}.`;
        return res.status(upstream.status >= 500 ? 502 : upstream.status).json({
          error: message.slice(0, 500),
        });
      }

      const first = Array.isArray(payload?.data) ? payload.data[0] : payload?.data;
      const videoBase64 =
        typeof first?.b64_json === "string" ? first.b64_json :
        typeof payload?.b64_json === "string" ? payload.b64_json : "";

      if (!videoBase64) {
        return res.status(502).json({
          error: "The endpoint responded but did not return an MP4 base64 payload. Check the selected NVIDIA model's response format.",
        });
      }

      return res.json({ videoBase64 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown upstream error";
      return res.status(502).json({
        error: message.includes("timeout")
          ? "The video request timed out. No automatic retry was attempted."
          : "Could not reach the configured video endpoint. Check its URL and server logs.",
      });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
