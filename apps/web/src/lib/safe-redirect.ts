const ALLOWED_PATH_START = "/";
const PROTOCOL_RELATIVE_START = "//";
const BACKSLASH = "\\";

export const toSafeRedirectPath = (candidate: unknown, fallbackPath = "/"): string => {
  if (typeof candidate !== "string") {
    return fallbackPath;
  }
  const isSameSitePath =
    candidate.startsWith(ALLOWED_PATH_START) &&
    !candidate.startsWith(PROTOCOL_RELATIVE_START) &&
    !candidate.includes(BACKSLASH);
  return isSameSitePath ? candidate : fallbackPath;
};

export const buildLoginPath = (nextPath?: string): string => {
  const safeNextPath = toSafeRedirectPath(nextPath, "");
  return safeNextPath ? `/login?next=${encodeURIComponent(safeNextPath)}` : "/login";
};
