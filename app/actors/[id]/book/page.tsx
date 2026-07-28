import Link from "next/link";
import TierTwoAccess from "../TierTwoAccess";
import { getActorById } from "@/lib/actors";

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actor = await getActorById(id);
  const firstName = actor.name.split(" ")[0];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A1F44] text-white py-10">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[8%] right-[12%] w-[500px] h-[500px] bg-[#C9A34E]/10 rounded-full blur-[130px] animate-soft-pulse-1" />
        <div className="absolute bottom-[8%] left-[12%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[130px] animate-soft-pulse-2" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 animate-rise-in">
        <Link
          href={`/actors/${actor.id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition mb-6"
        >
          <span aria-hidden>←</span> Back to {firstName}&apos;s profile
        </Link>

        <div className="mb-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9A34E]">
            Tier 2 · Private Access
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Choose your experience with {actor.name}
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-light">
            Book a private, one-on-one session. Secure payment now via PayPal; {firstName} confirms and sends your meeting link.
          </p>
        </div>
      </div>

      <TierTwoAccess actorId={actor.id} actorName={actor.name} standalone />
    </main>
  );
}
