"use client";

/**
 * HeroVideoCard — a small intro video that plays once in a floating side card
 * on the landing page, then fades out and unmounts (with a manual close too).
 * Keeps the landing background clean navy; the video is a one-time flourish.
 */

import { useState } from "react";

export default function HeroVideoCard() {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);

  if (!visible) return null;

  const dismiss = () => {
    setClosing(true);
    // let the fade-out play before unmounting
    setTimeout(() => setVisible(false), 500);
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-40 w-52 sm:w-64 transition-all duration-500 ${
        closing ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-[#C9A34E]/30 bg-[#0A1F44] shadow-2xl shadow-black/50 animate-rise-in">
        <button
          onClick={dismiss}
          aria-label="Close video"
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
        >
          ✕
        </button>
        <video
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={dismiss}
          className="block h-auto w-full"
        >
          <source src="/images/background.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
