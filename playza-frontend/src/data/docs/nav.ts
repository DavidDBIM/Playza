// Mirrors the section/page ordering and titles from the original
// playza-docs repo's _meta.json files, so the sidebar reads exactly the
// same as before — just rendered natively in this app instead of a
// separate Next.js/Nextra deployment.
export interface DocPage {
  slug: string;
  title: string;
}

export interface DocSection {
  slug: string;
  title: string;
  pages: DocPage[];
}

export const DOCS_NAV: DocSection[] = [
  {
    slug: "introduction",
    title: "Introduction",
    pages: [
      { slug: "key-summary", title: "Key Summary" },
      { slug: "inspiration", title: "Inspiration" },
      { slug: "market", title: "Market" },
      { slug: "completed-milestones", title: "Completed Milestones" },
      { slug: "investors-and-partners", title: "Investors & Partners" },
    ],
  },
  {
    slug: "playza-gaming",
    title: "Playza Gaming",
    pages: [
      { slug: "core-gameplay", title: "Core Gameplay" },
      { slug: "the-gaming-platform", title: "The Gaming Platform" },
      { slug: "our-games", title: "Our Games" },
      { slug: "our-approach", title: "Our Approach" },
      { slug: "playza-app", title: "Playza App" },
      { slug: "roadmap", title: "Roadmap" },
    ],
  },
  {
    slug: "za-currency",
    title: "$ZA Currency",
    pages: [
      { slug: "what-is-za", title: "What is $ZA?" },
      { slug: "deposits", title: "Deposits & Top-ups" },
      { slug: "utility", title: "Utility & Value" },
      { slug: "withdrawals", title: "Withdrawals" },
      { slug: "future", title: "The Future of $ZA" },
    ],
  },
  {
    slug: "loyalty",
    title: "PZA Points & Loyalty",
    pages: [
      { slug: "overview", title: "Overview" },
      { slug: "tiers", title: "Loyalty Tiers" },
      { slug: "earning-points", title: "How to Earn PZA Points" },
      { slug: "daily-spin", title: "Daily Spin" },
      { slug: "rewards-hub", title: "Rewards Hub" },
      { slug: "ambassador", title: "Ambassador Program" },
    ],
  },
  {
    slug: "build-with-playza",
    title: "Build with Playza",
    pages: [
      { slug: "developer-program", title: "Developer Program" },
      { slug: "grants-and-investments", title: "Grants & Investments" },
      { slug: "technical-documentation", title: "Technical Documentation" },
      { slug: "submit-your-game", title: "Submit Your Game" },
    ],
  },
  {
    slug: "help",
    title: "Help & FAQs",
    pages: [
      { slug: "knowledge-base", title: "Knowledge Base" },
      { slug: "rules-and-scoring", title: "Rules & Scoring" },
      { slug: "faqs", title: "FAQs" },
      { slug: "responsible-gaming", title: "Responsible Gaming" },
      { slug: "legal", title: "Legal" },
    ],
  },
];

// Flat list, handy for "prev/next page" navigation at the bottom of each doc.
export const DOCS_FLAT: { section: DocSection; page: DocPage }[] = DOCS_NAV.flatMap((section) =>
  section.pages.map((page) => ({ section, page })),
);