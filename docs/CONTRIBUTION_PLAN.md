# Team Contribution Plan — Feri Nepal

Companion to `PRD.md` and `IMPLEMENTATION_PLAN.md`.

**Team:** 4 people — 1 lead + 3 teammates (Members A, B, C).

**Approach:** the lead writes all the application code. Teammates don't touch Next.js, Prisma, or Supabase. Instead each teammate owns a non-coding area (content and data, QA, documentation and presentation) and makes **a handful of small commits** — all of them plain text files (Markdown or JSON) that can be edited directly on github.com, no Git installation or terminal needed.

---

## 1. Ground Rules

1. **Lead = all code.** Schema, backend, components, pages, payments — lead only.
2. **Teammates = content, QA, docs.** Most of their work lives in GitHub Issues, test sessions, meeting notes, and slides, not in commits.
3. **Few, real commits.** Each teammate makes roughly 4–5 small commits of real work (a test plan, a README, sample data). No padding.
4. **Edit on GitHub.** Open the file on github.com → pencil icon → edit → "Create a new branch and start a pull request" → Commit. The lead reviews and merges. (Terminal Git is optional.)
5. **Understand your own work.** Each teammate should be able to explain their commits and documents to the professor.
6. **Different files per person.** No merge conflicts (see §5).

---

## 2. Roles

| Person | Area | Main work | Commits |
|---|---|---|---|
| **Lead** | Everything technical | Setup, database, auth, roles, backend, UI, payments, integration, deployment, code review | Many |
| **Member A** | Content & Data | Sample products, category/banner copy, data dictionary, demo accounts and photos | ~4 |
| **Member B** | QA & Testing | Test plan, running tests each sprint, bug reports, test summaries | ~5 |
| **Member C** | Docs & Presentation | README, user guide with screenshots, meeting notes, sprint reports, final slides and demo script | ~4 |

---

## 3. Task Cards

**Commit?** = Yes means a small file commit through a PR. No means the work is tracked elsewhere (GitHub Issues, board, shared folder, Google Docs).

### Member A — Content & Data

| # | Task | Commit? | Where |
|---|---|---|---|
| A1 | Onboarding: add your name, role, and one-line interest to `TEAM.md`. | Yes | `TEAM.md` |
| A2 | Write **20 realistic sample products** (name, description, NPR price, condition, category) into the JSON template the lead provides. | Yes | `prisma/seed-data/products.json` |
| A3 | Write the **marketing copy**: 5 category descriptions and 3–4 hero banner headlines/subtext/button labels. Lead uses it for seed data and banners. | Yes | `docs/content/copy.md` |
| A4 | Fill in the **data dictionary**: for each table and field, a plain-English meaning and an example (template table provided). | Yes | `docs/data-dictionary.md` |
| A5 | Collect product photos for the sample products (free/own photos only) and note the source/licence. | No | Shared drive folder |
| A6 | Create demo accounts (buyer, vendor, admin) and sample orders in the running app so the demo has believable data. | No | Notes in shared doc |

### Member B — QA & Testing

| # | Task | Commit? | Where |
|---|---|---|---|
| B1 | Onboarding: add your name, role, and one-line interest to `TEAM.md`. | Yes | `TEAM.md` |
| B2 | Write the **test plan**: test cases for each flow in `PRD.md` §3 (buyer purchase, vendor application, admin review, banner management), each with steps and expected result. | Yes | `docs/test-plan.md` |
| B3 | **Run the test plan** at the end of each sprint on the deployed preview; record pass/fail and screenshots. | No | Shared sheet |
| B4 | **File bugs** as GitHub Issues: title, steps to reproduce, expected vs. actual, screenshot. | No | GitHub Issues |
| B5 | After each test round, commit a short **results summary** (what passed, what failed, issue links). Three rounds = three small commits. | Yes | `docs/test-results/round-1.md`, `round-2.md`, `round-3.md` |

### Member C — Docs & Presentation

| # | Task | Commit? | Where |
|---|---|---|---|
| C1 | Onboarding: add your name, role, and one-line interest to `TEAM.md`. | Yes | `TEAM.md` |
| C2 | Write `README.md` (what the project is, how to install, env vars, run, seed) and **test the steps on your own machine**; report gaps to the lead. | Yes | `README.md` |
| C3 | Write the **user guide** for buyer, vendor, and admin with screenshots. | Yes | `docs/user-guide.md` |
| C4 | Keep **meeting notes and weekly sprint reports** (who did what, blockers). Commit one final consolidated summary at the end. | Notes: No. Summary: Yes | Shared doc; `docs/sprints.md` |
| C5 | Build the **final presentation slides and demo script**. Each member sends their own slide content; C assembles. | No | Shared drive |
| C6 | Review the UI on a phone and laptop; file visual/usability problems as GitHub Issues. | No | GitHub Issues |

### Optional extras (only if someone wants more)

| Task | Commit? |
|---|---|
| Translate UI copy to Nepali into a JSON file the lead provides | Yes |
| Redraw the ER diagram for the final schema and export a PNG | Yes |
| Review each other's docs PRs (comments count as GitHub activity) | No |

### Lead (for reference)

All code: repo and Supabase setup, Prisma schema and seed script, authentication and role guards, server actions, React components and pages (ported from `vinted.html`), hero banner carousel, checkout and payments, admin tools, deployment, and code review. The lead uses Member A's data and copy, and fixes the bugs Member B reports.

---

## 4. Commit Budget (per teammate)

| Person | Planned commits |
|---|---|
| Member A | A1, A2, A3, A4 → 4 |
| Member B | B1, B2, B5 ×3 → 5 |
| Member C | C1, C2, C3, C4 summary → 4 |

Every other contribution is visible through Issues, PR reviews, the project board, and documents (see §8).

---

## 5. File Ownership

| Path | Owner |
|---|---|
| `TEAM.md` | Everyone (one line each) |
| `prisma/seed-data/products.json`, `docs/content/copy.md`, `docs/data-dictionary.md` | Member A |
| `docs/test-plan.md`, `docs/test-results/` | Member B |
| `README.md`, `docs/user-guide.md`, `docs/sprints.md` | Member C |
| All source code, schema, config | Lead |

---

## 6. Sprint Schedule

Adjust sprint lengths to the real deadline.

| Sprint | Lead | A (Content & Data) | B (QA) | C (Docs) |
|---|---|---|---|---|
| **0 — Setup** | Repo, GitHub project board, templates, 30-min Git-on-GitHub walkthrough | A1 | B1 | C1 |
| **1 — Auth & Catalog** | Auth, roles, product pages | A2 sample products, A3 copy | B2 test plan | C2 README |
| **2 — Vendor flow** | Vendor application, admin approval, dashboard | A4 data dictionary, A5 photos | B3 test round 1, B4 bugs, B5 summary | C4 notes |
| **3 — Cart, Checkout, Banners** | Cart, checkout, banners | A6 demo accounts | B3 test round 2, B4, B5 | C3 user guide (start), C4 notes |
| **4 — Payments, Reviews, Admin** | Payments, reviews, moderation | — (support testing) | B3 test round 3, B4, B5 | C3 user guide (finish), C6 UI review |
| **5 — Polish & Delivery** | Bug fixes, deploy, demo prep | Final data check | Final regression test | C5 slides + demo script, C4 summary |

---

## 7. Lead Prep Checklist

- [ ] Repo on GitHub, `main` protected (PRs required), teammates invited
- [ ] `TEAM.md`, `CONTRIBUTIONS.md` committed
- [ ] Templates committed: `products.json` (shape only), `data-dictionary.md` (table skeleton), `test-plan.md` (case format), `README.md` (skeleton)
- [ ] GitHub Project board with labels (`bug`, `ui`, `docs`, `data`)
- [ ] 30-minute session showing teammates how to edit a file on github.com and open a PR
- [ ] Issues created for each task above, assigned to the right person
- [ ] Preview deployment URL shared with the team for testing

---

## 8. Proving Contribution to the Professor

Commits will be few by design. Show the whole picture, and explain the role split up front (this document).

| Evidence | How to produce |
|---|---|
| Commits / merged PRs per person | `git shortlog -sn --no-merges`; GitHub → Pull Requests → filter by author |
| Bugs found and reported | GitHub Issues filtered by author |
| Reviews and comments | GitHub PR review activity |
| Task ownership | Project board with assignees |
| Documents authored | Files in `docs/` and `README.md` with history (`git log -- docs/test-plan.md`) |
| Meeting notes and sprint reports | `docs/sprints.md` and the shared notes doc |
| Individual summary | Each member's section in `CONTRIBUTIONS.md` |

`CONTRIBUTIONS.md` template (each member fills in at the end):

```markdown
## <Name> — <Content & Data / QA / Docs>
- Tasks completed: (issue links)
- Commits / PRs: (links)
- Bugs reported / tests run / docs written: (numbers + links)
- What I learned: (2–3 sentences)
```

**Before the demo:** each teammate should be able to open their own PRs or documents and explain in a minute what they did and why.

**Suggestion:** ask the professor early how individual contribution will be assessed (commits only, or also issues, documentation, testing). If commits are weighted heavily, the optional extras in §3 add a few more without adding code.

---

## 9. Risks and Fixes

| Risk | Fix |
|---|---|
| Teammate goes quiet | 10-minute standup twice a week; tasks are small and independent so the lead can reassign |
| GitHub editing confuses someone | Do it together once in the Sprint 0 session; lead can also walk through the first PR by screen share |
| Testing blocked because the app isn't ready | B writes the test plan first (Sprint 1) and tests whatever is deployed each sprint |
| Uneven workload | Check the board weekly; move optional extras to whoever has spare time |
| Professor counts only code commits | Raise it early (§8); add optional extras; document the role split in the report |
