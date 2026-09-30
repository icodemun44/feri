const FORBIDDEN_FOOTPRINTS = /co-authored-by|generated with/i;

const commitlintConfig = {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "no-tool-attribution": ({ raw }) => [
          !FORBIDDEN_FOOTPRINTS.test(raw),
          "Commit messages must not contain co-author trailers or generated-with lines",
        ],
      },
    },
  ],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "refactor",
        "test",
        "chore",
        "build",
        "ci",
        "perf",
        "style",
        "revert",
      ],
    ],
    "scope-enum": [
      1,
      "always",
      [
        "web",
        "ui",
        "shared",
        "validation",
        "database",
        "auth",
        "seller",
        "admin",
        "catalog",
        "infra",
        "docs",
        "deps",
      ],
    ],
    "subject-case": [0],
    "body-max-line-length": [0],
    "no-tool-attribution": [2, "always"],
  },
};

export default commitlintConfig;
