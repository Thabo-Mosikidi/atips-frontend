"use client";

/**
 * HeroVideoCard — a fixed, floating "ATIPS Advert" video card on the landing
 * page. Autoplays muted (browser policy), and the viewer controls it:
 *   - mute / unmute (audible on demand)
 *   - enlarge / shrink (small corner card ↔ large centered view)
 *   - close (it stays put until the viewer removes it — no auto-dismiss)
 */

import { useRef, useState } from "react";

export default function HeroVideoCard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);
  const [muted, setMuted] = useState(true);
  const [enlarged, setEnlarged] = useState(false);

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

  const iconBtn =
    "flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/75";

  return (
    <>
      {/* Backdrop only in enlarged mode; click to shrink back */}
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
            : "fixed bottom-4 right-4 z-40 w-56 sm:w-64"
        } transition-all duration-300 ${
          closing ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <div
          className={`relative overflow-hidden rounded-2xl border border-[#C9A34E]/40 bg-[#0A1F44] shadow-2xl shadow-black/60 animate-rise-in ${
            enlarged ? "w-full max-w-4xl" : "w-full"
          }`}
        >
          {/* CAPTION + CONTROLS BAR */}
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
        </div>
      </div>
    </>
  );
}
