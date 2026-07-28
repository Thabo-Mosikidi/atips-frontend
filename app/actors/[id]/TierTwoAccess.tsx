"use client";

/**
 * TierTwoAccess — Tier 2 Access (#1) + booking flow (#6) on the actor profile.
 *
 * Lists an actor's premium offerings (video call / mentorship / advice) and
 * runs a frictionless book-and-pay flow that mirrors the Tier 1 tip flow:
 * pick a service → choose a time → leave contact → pay in full via PayPal.
 * Slots come from the actor's availability; if none are published, the fan
 * proposes a time. Copy is routed through i18n keys where a booking-specific
 * string exists.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Service = {
  id: string;
  type: "VIDEO_CALL" | "MENTORSHIP" | "INDUSTRY_ADVICE" | string;
  title: string;
  description: string | null;
  price: number; // ZAR
  durationMin: number;
};

type Slot = { id: string; startTime: string; endTime: string };

const TYPE_LABEL: Record<string, string> = {
  VIDEO_CALL: "Private Video Call",
  MENTORSHIP: "Mentorship Session",
  INDUSTRY_ADVICE: "Industry Advice",
};

const TYPE_ICON: Record<string, string> = {
  VIDEO_CALL: "🎬",
  MENTORSHIP: "🎓",
  INDUSTRY_ADVICE: "💡",
};

function getSessionToken(): string {
  let token = localStorage.getItem("atips_session");
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem("atips_session", token);
  }
  return token;
}

export default function TierTwoAccess({
  actorId,
  actorName,
}: {
  actorId: string;
  actorName: string;
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [active, setActive] = useState<Service | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [customTime, setCustomTime] = useState<string>("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/actors/${actorId}/services`)
      .then((r) => r.json())
      .then((d) => setServices(Array.isArray(d.services) ? d.services : []))
      .catch(() => setServices([]))
      .finally(() => setLoaded(true));
  }, [actorId]);

  const openBooking = async (service: Service) => {
    setActive(service);
    setError("");
    setSelectedSlot("");
    setCustomTime("");
    try {
      const res = await fetch(
        `/api/actors/${actorId}/availability?serviceId=${service.id}`
      );
      const data = await res.json();
      setSlots(Array.isArray(data.slots) ? data.slots : []);
    } catch {
      setSlots([]);
    }
  };

  const closeBooking = () => {
    setActive(null);
    setSubmitting(false);
  };

  const submitBooking = async () => {
    if (!active) return;
    setError("");

    if (!contactEmail.trim()) {
      setError("Please enter an email so the actor can reach you.");
      return;
    }
    if (!selectedSlot && !customTime) {
      setError("Please choose a time for your session.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: active.id,
          slotId: selectedSlot || undefined,
          scheduledAt: selectedSlot ? undefined : new Date(customTime).toISOString(),
          sessionToken: getSessionToken(),
          contactName: contactName.trim() || undefined,
          contactEmail: contactEmail.trim(),
          source: window.location.pathname + window.location.search,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not start the booking.");
        setSubmitting(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  // Nothing published yet → render nothing (keeps the profile clean).
  if (!loaded || services.length === 0) return null;

  return (
    <div id="tier2-access" className="relative max-w-4xl w-full mx-auto mt-6 scroll-mt-6">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-[0_24px_80px_rgba(2,6,23,0.7)] backdrop-blur-xl border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9A34E]">
              Tier 2 · Private Access
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Book time with {actorName}
            </h2>
          </div>
          <span className="text-2xl">✨</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((s) => (
            <div
              key={s.id}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0b2046]/70 p-5 shadow-inner hover:border-[#C9A34E]/40 transition-all duration-300"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{TYPE_ICON[s.type] || "⭐"}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A34E]">
                    {TYPE_LABEL[s.type] || s.type}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{s.title}</h3>
                {s.description && (
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {s.description}
                  </p>
                )}
                <p className="text-[11px] text-slate-500">
                  {s.durationMin} min session
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-extrabold text-white">
                  R{s.price.toFixed(0)}
                </span>
                <button
                  onClick={() => openBooking(s)}
                  className="rounded-xl bg-gradient-to-r from-[#C9A34E] to-[#E6C878] px-4 py-2 text-xs font-bold text-[#0A1F44] hover:brightness-110 active:scale-[0.98] transition shadow-md"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOOKING MODAL */}
      {active &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeBooking} />
            <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#071329] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A34E]">
                  {TYPE_LABEL[active.type] || active.type} · {active.durationMin} min
                </span>
                <h3 className="text-lg font-bold text-white">{active.title}</h3>
                <p className="text-sm text-slate-300">
                  with {actorName} · <span className="font-bold text-white">R{active.price.toFixed(0)}</span>
                </p>
              </div>

              {/* TIME SELECTION */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  Choose a time
                </span>
                {slots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {slots.map((slot) => {
                      const dt = new Date(slot.startTime);
                      const selected = selectedSlot === slot.id;
                      return (
                        <button
                          key={slot.id}
                          onClick={() => {
                            setSelectedSlot(slot.id);
                            setCustomTime("");
                          }}
                          className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                            selected
                              ? "border-[#C9A34E] bg-[#C9A34E]/10 text-white"
                              : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          <span className="block font-semibold">
                            {dt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            {dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    type="datetime-local"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0A1F44] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#C9A34E]/50"
                  />
                )}
              </div>

              {/* CONTACT */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full rounded-xl border border-white/10 bg-[#0A1F44] px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C9A34E]/50"
                />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Your email (required)"
                  className="w-full rounded-xl border border-white/10 bg-[#0A1F44] px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C9A34E]/50"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-950/20 border border-red-500/10 px-3 py-2 rounded-xl">
                  {error}
                </p>
              )}

              <p className="text-[10px] text-slate-500 leading-relaxed">
                🔒 You pay securely via PayPal now. {actorName} will confirm your session and send the meeting link to your email.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={closeBooking}
                  disabled={submitting}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitBooking}
                  disabled={submitting}
                  className="flex-[2] rounded-xl bg-gradient-to-r from-[#D90429] to-[#A60321] px-4 py-3 text-sm font-bold text-white hover:from-[#ff1a3c] hover:to-[#b30026] shadow-lg shadow-red-950/30 transition disabled:cursor-wait disabled:opacity-75"
                >
                  {submitting ? "Redirecting…" : `Confirm & Pay R${active.price.toFixed(0)}`}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
