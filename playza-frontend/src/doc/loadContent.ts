// Eagerly pulls in every .md file under this folder as a raw string at
// build time — one bundle chunk, no runtime fetching, no server needed.
// Keys look like "./za-currency/what-is-za.md".
const rawFiles = import.meta.glob("./content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function normalizeKey(path: string) {
  return path.replace(/^\.\/content\//, "").replace(/\.md$/, "");
}

const contentByPath: Record<string, string> = {};
for (const [path, content] of Object.entries(rawFiles)) {
  contentByPath[normalizeKey(path)] = content;
}

export function getWelcomeContent(): string {
  return contentByPath["welcome"] || "";
}

export function getDocContent(section: string, slug: string): string | null {
  return contentByPath[`${section}/${slug}`] ?? null;
}
