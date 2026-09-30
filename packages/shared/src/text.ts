const NON_SLUG_CHARACTERS = /[^a-z0-9]+/g;
const EDGE_HYPHENS = /^-+|-+$/g;
const MAX_SLUG_LENGTH = 60;
const FALLBACK_SLUG = "shop";

export const slugify = (text: string): string => {
  const slug = text
    .normalize("NFKD")
    .toLowerCase()
    .replace(NON_SLUG_CHARACTERS, "-")
    .replace(EDGE_HYPHENS, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(EDGE_HYPHENS, "");
  return slug.length > 0 ? slug : FALLBACK_SLUG;
};

export const getInitials = (fullName: string): string =>
  fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((namePart) => namePart.charAt(0).toUpperCase())
    .join("");
