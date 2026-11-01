import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, Film, ImagePlus, LoaderCircle, LockKeyhole, Sparkles, Video, X } from "lucide-react";

type GeneratedVideo = { url: string; name: string };

const ACCESS_KEY = "examply_video_access_token";

export default function PrivateVideoGenerator() {
  const [token, setToken] = useState("");
  const [prompt, setPrompt] = useState("");
  const [seconds, setSeconds] = useState("4");
  const [size, setSize] = useState("832x480");
  const [imageData, setImageData] = useState("");
  const [imageName, setImageName] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [video, setVideo] = useState<GeneratedVideo | null>(null);

  useEffect(() => {
    const fromLink = new URLSearchParams(window.location.hash.slice(1)).get("key") || "";
    const stored = sessionStorage.getItem(ACCESS_KEY) || "";
    const supplied = fromLink || stored;
    if (supplied) {
      setToken(supplied);
      sessionStorage.setItem(ACCESS_KEY, supplied);
      if (fromLink) history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => () => {
    if (video?.url.startsWith("blob:")) URL.revokeObjectURL(video.url);
  }, [video]);

  const canGenerate = useMemo(() => prompt.trim().length >= 8 && !busy && !!token, [prompt, busy, token]);

  async function handleImage(file?: File) {
    setError("");
    setImageData("");
    setImageName("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Use a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("The reference image must be 5 MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageData(String(reader.result || ""));
      setImageName(file.name);
    };
    reader.onerror = () => setError("Could not read that image.");
    reader.readAsDataURL(file);
  }

  async function generate() {
    if (!canGenerate) return;
    setBusy(true);
    setError("");
    setStatus("Submitting your request…");
    setVideo((old) => {
      if (old?.url.startsWith("blob:")) URL.revokeObjectURL(old.url);
      return null;
    });
    try {
      setStatus("Generating video. This can take several minutes; keep this tab open.");
      const response = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-video-access-token": token },
        body: JSON.stringify({
          prompt: prompt.trim(),
          seconds: Number(seconds),
          size,
          ...(imageData ? { input_reference: imageData } : {}),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Generation failed (${response.status}).`);
      if (payload.videoUrl) {
        setVideo({ url: payload.videoUrl, name: "examply-generated-video.mp4" });
      } else if (payload.b64_json) {
        const raw = atob(payload.b64_json);
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        setVideo({ url: URL.createObjectURL(new Blob([bytes], { type: "video/mp4" })), name: "examply-generated-video.mp4" });
      } else {
        throw new Error("The video service returned no playable video. Check the configured NVIDIA endpoint.");
      }
      setStatus("Video ready.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Video generation failed. Try again.");
      setStatus("");
    } finally {
      setBusy(false);
    }
  }

  function clearAccess() {
    sessionStorage.removeItem(ACCESS_KEY);
    setToken("");
    setError("");
    setStatus("");
    history.replaceState(null, "", window.location.pathname);
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-5">
        <section className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300"><LockKeyhole /></div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Examply · Private workspace</p>
          <h1 className="mt-3 text-2xl font-bold">Video Generator</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">This page requires a private access link. Open the complete link you were given.</p>
          <a href="/" className="mt-6 inline-flex items-center gap-2 text-sm text-blue-300 hover:text-white"><ArrowLeft size={16} /> Back to Examply</a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080d18] text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white"><ArrowLeft size={17} /> Examply</a>
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300"><LockKeyhole size={13} /> Private workspace</div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-9 lg:grid-cols-[0.9fr_1.1fr] lg:py-14">
        <section>
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300"><Sparkles /></div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">NVIDIA-powered · Video studio</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Turn a prompt into a video.</h1>
          <p className="mt-4 max-w-xl leading-7 text-slate-400">Describe a scene, optionally add a reference image, and generate a short video clip. Generation availability depends on the configured NVIDIA video endpoint.</p>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
            <label htmlFor="video-prompt" className="mb-2 block text-sm font-semibold">Describe your video</label>
            <textarea id="video-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={1800} rows={6} placeholder="A cinematic close-up of a robotic arm assembling a small engine in a clean engineering workshop, smooth camera movement…" className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-blue-400" />
            <div className="mt-2 flex justify-between text-xs text-slate-500"><span>Be specific about subject, action, lighting, and camera movement.</span><span>{prompt.length}/1800</span></div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="duration" className="mb-2 block text-sm font-semibold">Duration</label>
                <select id="duration" value={seconds} onChange={(e) => setSeconds(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-blue-400">
                  <option value="4">4 seconds</option><option value="5">5 seconds</option><option value="8">8 seconds</option>
                </select>
              </div>
              <div>
                <label htmlFor="resolution" className="mb-2 block text-sm font-semibold">Resolution</label>
                <select id="resolution" value={size} onChange={(e) => setSize(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-blue-400">
                  <option value="832x480">832 × 480 · Landscape</option><option value="480x832">480 × 832 · Portrait</option>
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold">Reference image <span className="font-normal text-slate-500">(optional)</span></label>
              {imageData ? (
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950 p-3">
                  <ImagePlus size={18} className="shrink-0 text-blue-300" /><span className="min-w-0 flex-1 truncate text-sm text-slate-300">{imageName}</span>
                  <button type="button" onClick={() => { setImageData(""); setImageName(""); }} aria-label="Remove reference image" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X size={16} /></button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-4 text-sm text-slate-400 hover:border-blue-400 hover:text-white">
                  <ImagePlus size={18} /> Upload JPG, PNG or WebP (max 5 MB)
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => handleImage(e.target.files?.[0])} />
                </label>
              )}
            </div>

            {error && <div role="alert" className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</div>}
            {status && <p role="status" className="mt-4 text-sm text-slate-300">{status}</p>}
            <button type="button" disabled={!canGenerate} onClick={generate} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40">
              {busy ? <><LoaderCircle size={18} className="animate-spin" /> Generating…</> : <><Video size={18} /> Generate video</>}
            </button>
            <p className="mt-3 text-center text-xs leading-5 text-slate-500">Video generation may take several minutes and may incur NVIDIA API costs.</p>
          </div>
          <button onClick={clearAccess} className="mt-5 text-xs text-slate-500 underline underline-offset-4 hover:text-slate-300">End private session</button>
        </section>

        <section className="min-w-0">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300"><Film size={17} /> Preview</div>
          <div className="flex aspect-video items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
            {video ? <video key={video.url} src={video.url} controls playsInline className="h-full w-full bg-black object-contain" /> : (
              <div className="px-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-500"><Video size={28} /></div>
                <p className="mt-4 font-semibold text-slate-300">Your video will appear here</p>
                <p className="mt-2 text-sm text-slate-500">Enter a prompt to get started.</p>
              </div>
            )}
          </div>
          {video && <a href={video.url} download={video.name} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold hover:bg-white/10"><Download size={17} /> Download MP4</a>}
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm leading-6 text-slate-400"><strong className="text-slate-200">Note:</strong> Generated footage can contain visual errors. Review it before using it for educational or public content.</div>
        </section>
      </div>
    </main>
  );
}
