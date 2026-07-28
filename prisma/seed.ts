/**
 * prisma/seed.ts
 * Seeds authentic South African actor profiles into database.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const REAL_ACTORS = [
  {
    name: "Zolisa Xaluva",
    role: "South African actor",
    bio: "Zolisa Xaluva (born 13 June 1981) is a prominent South African actor and television personality best known for his versatile roles in major soap operas and drama series. He has sustained a career spanning over 20 years, earning a reputation for his intense and professional approach to his craft.\n\nKey Highlights:\n- Breakout role as Jason Malinga in Generations (2005–2006)\n- Starred as principal Melusi Dlamini in Gomora (2020–2022)\n- Plays Mogomotsi 'Mo' Masire in Netflix's Kings of Jo'burg\n- Portrayed Caesar in Smoke & Mirrors\n- Won SAFTA Best Supporting Actor (2019) for Sew the Winter to My Skin and Royalty Soapie Award (2014).",
    imageUrl: "/images/actor1.jpg",
    number: 1
  },
  {
    name: "Lunathi Mampofu",
    role: "South African actress and filmmaker",
    bio: "Lunathi Mampofu (born 7 March 1987) is a celebrated South African actress and filmmaker, best known for her roles as Emma on The River and Zoleka in Inimba. A graduate of AFDA and the New York Film Academy, she has also starred in Ingozi and The Queen.\n\nKey Highlights:\n- Graduated from AFDA (2010) & New York Film Academy (2013)\n- Starred as Emma on The River (2020–2023)\n- Roles in Isikizi, The Queen, 1802: Love Defies Time, Fatal Seduction, and Inimba\n- Worked as casting director in Los Angeles & Cape Town; founder of My Defense safety initiative.",
    imageUrl: "/images/actor2.jpg",
    number: 2
  },
  {
    name: "Jack Devnarain",
    role: "South African actor and advocate",
    bio: "Jack Devnarain is a highly respected South African actor and advocate, most famous for his role as Rajesh Kumar in the long-running soap opera Isidingo. Born on 9 February 1971 in Tongaat, he had a unique dual career as both a police officer and an actor before transitioning fully into entertainment.\n\nKey Highlights:\n- Served 9 years in Durban Metropolitan Police Service\n- Portrayed Rajesh Kumar in Isidingo for nearly two decades\n- Nominated for Royalty Soapie Award as Sunil Maharaj in Imbewu: The Seed\n- Chairman of the South African Guild of Actors (SAGA) since 2013 lobbying for performers' legal rights.",
    imageUrl: "/images/actor3.jpg",
    number: 3
  },
  {
    name: "Thembinkosi Mthembu",
    role: "South African actor and style icon",
    bio: "Thembinkosi Mthembu (born 31 July 1994) is a multi-award-winning South African actor and style icon, best known for his breakthrough roles in major television dramas like Shaka iLembe, The River, and Adulting.\n\nKey Highlights:\n- Earned a diploma in Drama & Production from DUT (2017)\n- Starred as Junior in The Republic (2019) and Mabutho in The River\n- Lead role as Bonga in Showmax original Adulting\n- Won SAFTA Best Actor for his portrayal of King Dingiswayo in Shaka iLembe.",
    imageUrl: "/images/actor4.jpg",
    number: 4
  },
  {
    name: "Bevan Viljoen",
    role: "South African actor and entrepreneur",
    bio: "Bevan Viljoen is an accomplished South African actor, model, and entrepreneur known for his compelling performances across local and international film, television, and commercial productions.\n\nKey Highlights:\n- Featured in prominent South African television series and feature films\n- Active entrepreneur and fitness model in the South African creative ecosystem\n- Known for high-energy character roles and action performances.",
    imageUrl: "/images/actor5.jpg",
    number: 5
  },
  {
    name: "Lorcia Cooper",
    role: "South African actress, dancer, and choreographer",
    bio: "Lorcia Cooper Khumalo is a renowned South African actress, dancer, and choreographer. Best known for her iconic role as Charmaine Jacob in Backstage and Tyson in Lockdown, she is a SAFTA award-winner and celebrated dance tutor.\n\nKey Highlights:\n- Breakout role as Charmaine in Backstage\n- SAFTA Award winner for Best Supporting Actress in TV Drama (Lockdown)\n- Experienced choreographer and judge on major dance and talent platforms.",
    imageUrl: "/images/actor6.jpg",
    number: 6
  },
  {
    name: "Connie Ferguson",
    role: "South African actress, filmmaker, producer, and businesswoman",
    bio: "Connie Ferguson is a legendary South African actress, filmmaker, producer, and businesswoman. Famous for starring as Karabo Moroka in Generations for over 16 years, she co-founded Ferguson Films, producing hit shows like The Queen, Rockville, and Kings of Jo'burg.\n\nKey Highlights:\n- Iconic lead role as Karabo Moroka in Generations\n- Co-founder & Executive Producer at Ferguson Films\n- Co-created & produced Netflix global hit Kings of Jo'burg and Mzansi Magic's The Queen.",
    imageUrl: "/images/actor7.jpg",
    number: 7
  },
  {
    name: "Nomzamo Mbatha",
    role: "South African actress, human rights activist, and businesswoman",
    bio: "Nomzamo Mbatha is an internationally acclaimed South African actress, television personality, UNHCR Goodwill Ambassador, and businesswoman. She achieved widespread acclaim starring in Isibaya, Coming 2 America, and executive producing Shaka iLembe.\n\nKey Highlights:\n- Breakthrough lead role as Thandeka Zungu in Isibaya\n- Co-starred alongside Eddie Murphy in Hollywood blockbuster Coming 2 America (2021)\n- Executive producer and title lead in epic historical drama Shaka iLembe\n- UNHCR Goodwill Ambassador advocating for refugees globally.",
    imageUrl: "/images/actor8.jpg",
    number: 8
  },
  {
    name: "Nambitha Ben-Mazwi",
    role: "South African actress, entrepreneur, and global activist",
    bio: "Nambitha Ben-Mazwi, affectionately known as 'Lady Nam', is a celebrated South African actress, presenter, speaker, and activist. She has starred in high-profile international and local productions across Netflix, Showmax, and SABC.\n\nKey Highlights:\n- Featured in Netflix originals Savage Beauty, Black Mirror, and Dead Places\n- Roles in Scandal!, The Queen, and Broken Vows\n- Founder of 'She is King' empowerment initiative for young women.",
    imageUrl: "/images/actor9.jpg",
    number: 9
  },
  {
    name: "Tyrone Keogh",
    role: "South African actor and director",
    bio: "Tyrone Keogh is a prominent South African actor, director, and model. Known for his starring roles as Jack van Reenen in The Wild and Tom in Still Breathing, he has worked extensively in domestic and international television.\n\nKey Highlights:\n- Starred as Jack van Reenen in M-Net drama series The Wild\n- Lead roles in Still Breathing, Black Sails, and Dominion\n- Accomplished director and commercial model.",
    imageUrl: "/images/actor10.jpg",
    number: 10
  },
  {
    name: "Louise Barnes",
    role: "South African actress and voice artist",
    bio: "Louise Barnes is an award-winning South African actress best known for her performance as Miranda Barlow in the STARZ historical adventure series Black Sails and key roles in Jozi-H and Suburban Bliss.\n\nKey Highlights:\n- SAFTA Award winner for Best Actress in a TV Drama (Jozi-H)\n- Starred as Miranda Barlow in global hit series Black Sails\n- Featured in NCIS: Los Angeles, Outsiders, and Reprisal.",
    imageUrl: "/images/actor11.jpg",
    number: 11
  },
  {
    name: "Sindiswa Dlathu",
    role: "South African actress, musician, and producer",
    bio: "Sindi Dlathu is a legendary South African actress and musician. Famous for her 20-year portrayal of Thandaza Mokoena in Muvhango and her starring role as Lindiwe Dlamini-Dikana in The River, she is one of the most decorated performers in SA television.\n\nKey Highlights:\n- Played Thandaza in Muvhango (1997–2018)\n- Co-executive producer & lead actress (Lindiwe) in The River\n- Multiple SAFTA and Royalty Soapie Awards for Lead Actress in a Drama/Soapie.",
    imageUrl: "/images/actor12.jpg",
    number: 12
  },
  {
    name: "Zikhona Sodlaka",
    role: "South African actress, media personality, and businesswoman",
    bio: "Zikhona Sodlaka is a multi-award-winning South African actress and media personality. Best known for her powerful roles in Rhythm City, Montana, The Wife, and Blood Psalms, she is acclaimed for her intense screen presence.\n\nKey Highlights:\n- Breakthrough roles in Shooting Stars, Montana, and Tsha Tsha\n- Starred as Mandisa in Showmax hit series The Wife\n- Lead roles in Igazi, Blood Psalms, and Generations.",
    imageUrl: "/images/actor13.jpg",
    number: 13
  },
  {
    name: "Clint Brink",
    role: "South African actor, musician, and producer",
    bio: "Clint Brink is a SAFTA-winning South African actor, musician, and producer. Famous for his long-standing role as Dr. Steve Abrahams in Binnelanders and Shawn Jacobs in Backstage, he is a cornerstone of SA television.\n\nKey Highlights:\n- Starred in Backstage, Generations, and Binnelanders\n- SAFTA Award winner for Best Actor\n- Accomplished musician, composer, and film producer.",
    imageUrl: "/images/actor14.jpg",
    number: 14
  },
  {
    name: "Kim Engelbrecht",
    role: "South African actress",
    bio: "Kim Engelbrecht is an internationally acclaimed South African actress. Famous for her starring role as Reyka Gama in crime thriller Reyka and Marlize DeVoe in The Flash (CW), she earned an International Emmy nomination for Best Actress.\n\nKey Highlights:\n- International Emmy Award nomination for Best Actress in Reyka (2022)\n- Starred as Marlize DeVoe in CW superhero series The Flash\n- Major roles in Isidingo, Dominion, and Raised by Wolves.",
    imageUrl: "/images/actor15.jpg",
    number: 15
  }
];

async function main() {
  await prisma.actor.deleteMany();

  const data = REAL_ACTORS.map((actor) => ({
    id: crypto.randomUUID(),
    ...actor,
  }));

  await prisma.actor.createMany({
    data,
  });

  console.log("✅ Seeded 15 real South African actors successfully");

  // ---- Tier 2 Access + booking sample data (first 3 actors) ----
  const featured = await prisma.actor.findMany({
    orderBy: { number: "asc" },
    take: 3,
  });

  const now = Date.now();
  const hour = 60 * 60 * 1000;

  for (let i = 0; i < featured.length; i++) {
    const actor = featured[i];

    const services = await Promise.all([
      prisma.service.create({
        data: {
          actorId: actor.id,
          type: "VIDEO_CALL",
          title: "15-min Private Video Call",
          description: `A one-on-one video call with ${actor.name}. Say hi, ask a question, get a shout-out.`,
          price: 50000, // R500
          durationMin: 15,
        },
      }),
      prisma.service.create({
        data: {
          actorId: actor.id,
          type: "MENTORSHIP",
          title: "45-min Acting Mentorship",
          description: `Career and craft mentorship session with ${actor.name}.`,
          price: 120000, // R1200
          durationMin: 45,
        },
      }),
      prisma.service.create({
        data: {
          actorId: actor.id,
          type: "INDUSTRY_ADVICE",
          title: "30-min Industry Advice",
          description: `Breaking into the SA screen industry — practical advice from ${actor.name}.`,
          price: 80000, // R800
          durationMin: 30,
        },
      }),
    ]);

    // A few future availability slots (next few days) for the video call.
    for (let d = 1; d <= 3; d++) {
      const start = new Date(now + d * 24 * hour + 18 * hour); // ~18:00 each day
      await prisma.availabilitySlot.create({
        data: {
          actorId: actor.id,
          serviceId: services[0].id,
          startTime: start,
          endTime: new Date(start.getTime() + services[0].durationMin * 60 * 1000),
        },
      });
    }
  }

  // Make the first actor "premium" so prioritized placement is visible.
  if (featured[0]) {
    await prisma.actor.update({
      where: { id: featured[0].id },
      data: {
        isPremium: true,
        premiumUntil: new Date(now + 30 * 24 * hour),
        priorityRank: 10,
      },
    });
  }

  console.log("✅ Seeded Tier 2 services, availability slots, and 1 premium actor");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });