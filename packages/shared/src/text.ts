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

export const toPublicReviewerName = (fullName: string): string => {
  const [firstName, ...otherNames] = fullName.split(/\s+/).filter(Boolean);
  const lastName = otherNames.at(-1);
  if (!firstName) {
    return "A buyer";
  }
  return lastName ? `${firstName} ${lastName.charAt(0).toUpperCase()}.` : firstName;
};
