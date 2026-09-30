import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCANNED_ROOTS = ["apps", "packages"];
const SCANNED_EXTENSIONS = new Set([".ts", ".tsx", ".css", ".mjs", ".svg"]);
const IGNORED_DIRECTORIES = new Set(["node_modules", ".next", ".turbo", "generated", "migrations"]);

const RULES = [
  {
    name: "gradient",
    pattern:
      /(?:linear|radial|conic)-gradient\s*\(|\bbg-(?:gradient|linear|radial|conic)\b|<(?:linear|radial)Gradient/i,
    message: "Gradients are not allowed. Use a solid colour from the design system.",
  },
  {
    name: "emoji",
    pattern: /[\p{Emoji_Presentation}\u{FE0F}\u{200D}]/u,
    message: "Emoji are not allowed. Use a Lucide icon instead.",
  },
];

const collectFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return IGNORED_DIRECTORIES.has(entry.name) ? [] : collectFiles(entryPath);
      }
      return SCANNED_EXTENSIONS.has(path.extname(entry.name)) ? [entryPath] : [];
    }),
  );
  return nested.flat();
};

const findViolations = async (filePath) => {
  const content = await readFile(filePath, "utf8");
  return content.split("\n").flatMap((line, index) =>
    RULES.filter((rule) => rule.pattern.test(line)).map((rule) => ({
      filePath: path.relative(repositoryRoot, filePath),
      lineNumber: index + 1,
      message: rule.message,
    })),
  );
};

const files = (
  await Promise.all(
    SCANNED_ROOTS.map((root) => collectFiles(path.join(repositoryRoot, root)).catch(() => [])),
  )
).flat();
const violations = (await Promise.all(files.map(findViolations))).flat();

if (violations.length > 0) {
  violations.forEach(({ filePath, lineNumber, message }) =>
    console.error(`${filePath}:${lineNumber}  ${message}`),
  );
  process.exit(1);
}

console.log(`Design rules check passed (${files.length} files scanned).`);
