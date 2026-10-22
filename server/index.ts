import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NVIDIA_VIDEO_ENDPOINT =
  process.env.NVIDIA_VIDEO_API_URL || "https://ai.api.nvidia.com/v1/cosmos/nvidia/cosmos3-nano";

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "64kb" }));

  // Report configuration without exposing credentials or the upstream URL.
  app.get("/api/video/status", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    const apiKey = process.env.NVIDIA_NIM_API_KEY || process.env.NVIDIA_API_KEY;
    res.json({
      configured: Boolean(apiKey),
      model: "nvidia/cosmos3-nano",
      maxSeconds: 1,
      endpointConfigured: true,
    });
  });

  // Short, low-resolution test. The API key remains server-side.
  app.post("/api/video/generate", async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
    const apiKey = process.env.NVIDIA_NIM_API_KEY || process.env.NVIDIA_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: "NVIDIA_NIM_API_KEY is not configured in this deployment. No paid request was made.",
      });
    }

    if (prompt.length < 8 || prompt.length > 4000) {
      return res.status(400).json({ error: "Prompt must be between 8 and 4000 characters." });
    }

    try {
      const upstream = await fetch(NVIDIA_VIDEO_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          model_mode: "text2video",
          prompt,
          resolution: "480_16_9",
          num_frames: 25,
          num_inference_steps: 35,
          fps: 24,
          seed: 42,
        }),
        signal: AbortSignal.timeout(300_000),
      });

      const payload = await upstream.json().catch(() => null);
      if (!upstream.ok) {
        const message =
          typeof payload?.detail === "string" ? payload.detail :
          typeof payload?.title === "string" ? payload.title :
          typeof payload?.message === "string" ? payload.message :
          `NVIDIA endpoint returned HTTP ${upstream.status}. Check API access and model availability.`;
        return res.status(upstream.status >= 500 ? 502 : upstream.status).json({
          error: message.slice(0, 500),
        });
      }

      const videoBase64 = typeof payload?.b64_video === "string" ? payload.b64_video : "";
      if (!videoBase64) {
        return res.status(502).json({
          error: "NVIDIA responded without a b64_video payload; the response format was unexpected.",
        });
      }

      return res.json({ videoBase64, model: "nvidia/cosmos3-nano" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown upstream error";
      return res.status(502).json({
        error: message.toLowerCase().includes("timeout")
          ? "The video request timed out. It may still have completed upstream; no automatic retry was attempted."
          : "Could not reach NVIDIA's hosted video endpoint. Check deployment logs and API access.",
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
