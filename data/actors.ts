// ======================================================
// FILE: data/actors.ts
// PURPOSE:
// - Temporary actor dataset (15 actors) for the MVP UI.
// - Used by both the homepage (directory) and profile pages.
// - Later replaced by database fetch (Supabase).
// ======================================================

export type Actor = {
  slug: string;      // Used for the profile URL: /actors/[slug]
  name: string;      // Display name shown on cards + profile
  imageUrl: string;  // Image shown on cards + profile banner
  bio: string;       // Short bio shown on the profile page
};

// ======================================================
// TEMP DATA (15 ACTORS)
// NOTE:
// - Edit names/images anytime.
// - Slugs must be unique and match the URL.
// ======================================================
export const actors: Actor[] = [
  { slug: "actor-1",  name: "Actor 1",  imageUrl: "https://picsum.photos/seed/a1/600/400",  bio: "Professional actor bio placeholder. Replace on onboarding." },
  { slug: "actor-2",  name: "Actor 2",  imageUrl: "https://picsum.photos/seed/a2/600/400",  bio: "Professional actor bio placeholder. Replace on onboarding." },
  { slug: "actor-3",  name: "Actor 3",  imageUrl: "https://picsum.photos/seed/a3/600/400",  bio: "Professional actor bio placeholder. Replace on onboarding." },
  { slug: "actor-4",  name: "Actor 4",  imageUrl: "https://picsum.photos/seed/a4/600/400",  bio: "Professional actor bio placeholder. Replace on onboarding." },
  { slug: "actor-5",  name: "Actor 5",  imageUrl: "https://picsum.photos/seed/a5/600/400",  bio: "Professional actor bio placeholder. Replace on onboarding." },
  { slug: "actor-6",  name: "Actor 6",  imageUrl: "https://picsum.photos/seed/a6/600/400",  bio: "Professional actor bio placeholder. Replace on onboarding." },
  { slug: "actor-7",  name: "Actor 7",  imageUrl: "https://picsum.photos/seed/a7/600/400",  bio: "Professional actor bio placeholder. Replace on onboarding." },
  { slug: "actor-8",  name: "Actor 8",  imageUrl: "https://picsum.photos/seed/a8/600/400",  bio: "Professional actor bio placeholder. Replace on onboarding." },
  { slug: "actor-9",  name: "Actor 9",  imageUrl: "https://picsum.photos/seed/a9/600/400",  bio: "Professional actor bio placeholder. Replace on onboarding." },
  { slug: "actor-10", name: "Actor 10", imageUrl: "https://picsum.photos/seed/a10/600/400", bio: "Professional actor bio placeholder. Replace on onboarding." },
  { slug: "actor-11", name: "Actor 11", imageUrl: "https://picsum.photos/seed/a11/600/400", bio: "Professional actor bio placeholder. Replace on onboarding." },
  { slug: "actor-12", name: "Actor 12", imageUrl: "https://picsum.photos/seed/a12/600/400", bio: "Professional actor bio placeholder. Replace on onboarding." },
  { slug: "actor-13", name: "Actor 13", imageUrl: "https://picsum.photos/seed/a13/600/400", bio: "Professional actor bio placeholder. Replace on onboarding." },
  { slug: "actor-14", name: "Actor 14", imageUrl: "https://picsum.photos/seed/a14/600/400", bio: "Professional actor bio placeholder. Replace on onboarding." },
  { slug: "actor-15", name: "Actor 15", imageUrl: "https://picsum.photos/seed/a15/600/400", bio: "Professional actor bio placeholder. Replace on onboarding." },
];