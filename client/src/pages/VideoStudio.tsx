import { useEffect, useState } from "react";
import { ArrowLeft, Film, LoaderCircle, LockKeyhole, Play, ShieldCheck, WandSparkles } from "lucide-react";
import { Link } from "wouter";

type VideoStatus = { configured: boolean; model: string; maxSeconds: number };

export default function VideoStudio() {
  const [prompt, setPrompt] = useState(
    "A photorealistic cinematic wide shot of Lagos, Nigeria, at golden hour after rainfall. Yellow danfo buses move through a busy street, pedestrians cross naturally, warm sunlight reflects on wet asphalt, realistic architecture, subtle handheld camera movement, natural skin tones, 35mm film cinematography, physically realistic motion, no text or logos."
  );
  const [status, setStatus] = useState<VideoStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    fetch("/api/video/status")
      .then((response) => response.json())
      .then((data: VideoStatus) => setStatus(data))
      .catch(() => setStatus({ configured: false, model: "wan-ai/wan2.2", maxSeconds: 4 }));
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  async function generateVideo() {
    setError("");
    setLoading(true);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl("");
    try {
      const response = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, seconds: 4 }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Video generation failed.");
      const binary = atob(result.videoBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      setVideoUrl(URL.createObjectURL(new Blob([bytes], { type: "video/mp4" })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to generate the video.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0d10] text-[#f5f5f4]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
            <ArrowLeft size={16} /> Back to Examply
          </Link>
          <div className="flex items-center gap-2 text-xs text-white/60"><LockKeyhole size={14} /> Private test studio</div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1fr_0.9fr]">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/65">
            <Film size={14} /> EXPERIMENTAL VIDEO GENERATION
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">Turn a scene into a cinematic clip.</h1>
          <p className="max-w-xl leading-7 text-white/60">A small, controlled test of NVIDIA's Wan2.2 video API. This prototype generates one short clip; longer films are assembled from multiple shots.</p>
          <label htmlFor="video-prompt" className="block text-sm font-medium text-white/80">Describe your scene</label>
          <textarea id="video-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={4000} rows={8} className="w-full resize-y rounded-2xl border border-white/15 bg-white/[0.04] p-4 text-sm leading-6 outline-none transition focus:border-white/40" />
          <div className="flex items-center justify-between text-xs text-white/45"><span>{prompt.length}/4000 characters</span><span>4 seconds · 832 × 480 target</span></div>
          {error && <div role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</div>}
          <button onClick={generateVideo} disabled={loading || prompt.trim().length < 8} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? <LoaderCircle size={17} className="animate-spin" /> : <WandSparkles size={17} />}
            {loading ? "Generating clip…" : "Generate test clip"}
          </button>
          <p className="text-xs leading-5 text-white/45">One short request per click. Generation stays disabled at the API level until the server-side NVIDIA endpoint and key are configured.</p>
        </section>
        <aside className="space-y-4">
          <div className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
            {videoUrl ? <video src={videoUrl} controls playsInline className="h-full w-full object-contain" /> : <div className="flex flex-col items-center gap-3 px-6 text-center text-white/35"><Play size={30} strokeWidth={1.4} /><span className="text-sm">Your generated video will appear here</span></div>}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck size={17} /> Test configuration</div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><span className="text-white/50">Model</span><span className="font-mono text-xs">wan-ai/wan2.2</span></div>
              <div className="flex justify-between gap-3"><span className="text-white/50">API configuration</span><span className={status?.configured ? "text-emerald-300" : "text-amber-200"}>{status ? (status.configured ? "Configured" : "Not configured") : "Checking…"}</span></div>
              <div className="flex justify-between gap-3"><span className="text-white/50">Initial clip length</span><span>4 seconds</span></div>
            </div>
            {!status?.configured && <p className="mt-4 rounded-xl bg-amber-300/10 p-3 text-xs leading-5 text-amber-100/80">No API call will be made until NVIDIA_VIDEO_API_URL and NVIDIA_API_KEY are added to the server environment. Do not put the key in browser code.</p>}
          </div>
        </aside>
      </div>
    </main>
  );
}
