"use client";

/**
 * HeroVideoCard — a fixed, floating "A.TIPS Advert" video card on the landing
 * page. Autoplays muted and loops; the viewer controls it fully:
 *   - mute / unmute
 *   - enlarge / shrink (corner card ↔ large centered view)
 *   - play / pause, rewind / forward, and a scrubber (playtrack) to jump to
 *     any second/scene
 *   - close (stays until the viewer removes it — no auto-dismiss)
 *
 * Media events are wired imperatively in an effect (not via JSX props) because
 * the <video> is server-rendered: the browser can fire loadedmetadata before
 * React hydrates, which would otherwise leave duration=0 and freeze the
 * scrubber. We also resolve the Infinity-duration case some MP4s report.
 */

import { useEffect, useRef, useState } from "react";

function fmt(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function HeroVideoCard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);
  const [muted, setMuted] = useState(true);
  const [enlarged, setEnlarged] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const applyDuration = () => {
      if (isFinite(v.duration) && v.duration > 0) {
        setDuration(v.duration);
      } else if (v.duration === Infinity) {
        // Force the browser to resolve a real duration, then snap back.
        const onSeeked = () => {
          v.currentTime = 0;
          v.removeEventListener("seeked", onSeeked);
        };
        v.addEventListener("seeked", onSeeked);
        v.currentTime = 1e101;
      }
    };
    const onTime = () => {
      if (isFinite(v.currentTime)) setCurrent(v.currentTime);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    // The video may already have loaded metadata before hydration.
    if (v.readyState >= 1) applyDuration();
    setPlaying(!v.paused);

    v.addEventListener("loadedmetadata", applyDuration);
    v.addEventListener("durationchange", applyDuration);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("loadedmetadata", applyDuration);
      v.removeEventListener("durationchange", applyDuration);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setClosing(true);
    setTimeout(() => setVisible(false), 400);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) {
      v.volume = 1;
      v.play().catch(() => {});
    }
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const skip = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    const d = isFinite(v.duration) ? v.duration : current + delta;
    const next = Math.min(Math.max(0, v.currentTime + delta), d);
    v.currentTime = next;
    setCurrent(next);
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const t = Number(e.target.value);
    v.currentTime = t;
    setCurrent(t);
  };

  const iconBtn =
    "flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/75";

  return (
    <>
      {enlarged && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setEnlarged(false)}
        />
      )}

      <div
        className={`${
          enlarged
            ? "fixed inset-0 z-50 flex items-center justify-center p-4"
            : "fixed bottom-4 right-4 z-40 w-60 sm:w-72"
        } transition-all duration-300 ${
          closing ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <div
          className={`relative overflow-hidden rounded-2xl border border-[#C9A34E]/40 bg-[#0A1F44] shadow-2xl shadow-black/60 animate-rise-in ${
            enlarged ? "w-full max-w-4xl" : "w-full"
          }`}
        >
          {/* CAPTION + WINDOW CONTROLS */}
          <div className="flex items-center justify-between gap-2 bg-[#0A1F44]/95 px-3 py-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A34E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D90429]" />
              A.TIPS Advert
            </span>
            <div className="flex items-center gap-1.5">
              <button onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className={iconBtn}>
                {muted ? (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setEnlarged((e) => !e)}
                aria-label={enlarged ? "Shrink video" : "Enlarge video"}
                className={iconBtn}
              >
                {enlarged ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0v4m0-4h4m6 6l5 5m0 0v-4m0 4h-4" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>
              <button onClick={dismiss} aria-label="Close video" className={iconBtn}>
                ✕
              </button>
            </div>
          </div>

          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="block h-auto w-full"
          >
            <source src="/images/background.mp4" type="video/mp4" />
          </video>

          {/* PLAYBACK CONTROLS + SCRUBBER (playtrack) */}
          <div className="flex items-center gap-2 bg-[#0A1F44]/95 px-3 py-2">
            <button onClick={() => skip(-5)} aria-label="Rewind 5 seconds" className={iconBtn}>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
              </svg>
            </button>
            <button onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} className={iconBtn}>
              {playing ? (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button onClick={() => skip(5)} aria-label="Forward 5 seconds" className={iconBtn}>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 6v12l8.5-6L13 6zm-.5 6L4 6v12l8.5-6z" />
              </svg>
            </button>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={current}
              onChange={seek}
              aria-label="Seek video"
              className="h-1 flex-1 cursor-pointer accent-[#C9A34E]"
            />
            <span className="min-w-[64px] text-right text-[10px] tabular-nums text-slate-300">
              {fmt(current)} / {fmt(duration)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
