# Team Contribution Plan - Feri Nepal

Companion to `PRD.md` and `IMPLEMENTATION_PLAN.md`. The project is named **Feri Nepal**. The lead has built the foundation (see `IMPLEMENTATION_PLAN.md`) and writes all the code.

**Team:** 4 people. The lead plus 3 teammates, each with one clear area:

| Person       | Area                    | What they own                                                                   |
| ------------ | ----------------------- | ------------------------------------------------------------------------------- |
| **Lead**     | All code                | Architecture, database, backend, UI, deployment, code review                    |
| **Member A** | QA and testing          | Testing the running app, bug reports and test notes in GitHub Issues            |
| **Member B** | Test data and resources | Product details, photos and copy used to fill the app with real-looking content |
| **Member C** | Brand and logo          | The logo set and a short brand usage guide                                      |

Nobody except the lead touches Next.js, Prisma or Supabase. Teammates' commits are small text or image files added through the GitHub website, so no Git installation or terminal is needed.

---

## 1. Ground rules

1. **Lead = all code.** Teammates never edit files under `apps/` or `packages/`.
2. **Most work is not commits.** Testing, bug reports, gathering resources and design work live in GitHub Issues, shared folders and design tools. Only the finished results are committed.
3. **Few, real commits.** Each teammate makes about 3 to 5 small commits of real work. No padding.
4. **Add files on github.com.** Open the folder, use "Add file", then "Upload files" (or "Create new file"), choose "Create a new branch and start a pull request", and commit. The lead reviews and merges.
5. **Understand your own work.** Everyone should be able to explain their commits and documents to the professor.
6. **Separate folders per person** so nobody overwrites anyone else (see section 6).

---

## 2. Member A: QA and testing

Goal: find problems before the professor or a user does, and record them clearly in GitHub Issues.

| #   | Task                                                                                                                                                                                                                | Commit? | Where                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------ |
| A1  | Onboarding: add your name, role and one-line interest to `TEAM.md`.                                                                                                                                                 | Yes     | `TEAM.md`                                        |
| A2  | Follow the README on a computer that has never run the project. Report every step that is missing or wrong as an Issue.                                                                                             | No      | GitHub Issues                                    |
| A3  | Write the **test plan**: one test case per flow in `PRD.md` section 3 (sign up, log in, browse, search, category switch, apply to sell, admin review, approve, reject). Each case has steps and an expected result. | Yes     | `docs/qa/test-plan.md`                           |
| A4  | **Run the test plan** after every release and note pass or fail with screenshots. Test on a phone-sized window as well as a laptop.                                                                                 | No      | Shared sheet                                     |
| A5  | **File bugs as GitHub Issues** using the template below. One problem per issue, with screenshots.                                                                                                                   | No      | GitHub Issues                                    |
| A6  | After each test round, commit a short **results summary**: what passed, what failed, links to the issues. Three rounds means three small commits.                                                                   | Yes     | `docs/qa/round-1.md`, `round-2.md`, `round-3.md` |
| A7  | Write the **user guide** for buyers, sellers and admins with screenshots taken during testing.                                                                                                                      | Yes     | `docs/user-guide.md`                             |
| A8  | Re-test every issue the lead marks as fixed, then close it or reopen it with a comment.                                                                                                                             | No      | GitHub Issues                                    |

**Bug report template** (the lead will add this as a GitHub issue template):

```
Title: short description of what is wrong

Where: page address (for example /sell/apply) and which account (buyer, seller, admin)
Steps to reproduce:
1.
2.
3.
Expected:
Actual:
Screenshot or short video:
Device and browser:
How bad is it: blocks use / annoying / cosmetic
```

Labels the lead will create: `bug`, `ui`, `accessibility`, `content`, `question`, plus `blocks-use`, `annoying`, `cosmetic` for severity.

Things worth testing on purpose: empty fields, wrong phone numbers, very long text, the browser back button, opening admin pages as a buyer, refreshing in the middle of a flow, slow connection, small screens, keyboard-only use.

---

## 3. Member B: test data and resource gathering

Goal: make the app look like a real thrift store with believable, consistent content.

| #   | Task                                                                                                                                                                                               | Commit?    | Where                             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------- |
| B1  | Onboarding: add your name, role and one-line interest to `TEAM.md`.                                                                                                                                | Yes        | `TEAM.md`                         |
| B2  | Collect **30 realistic products** across the five categories (Clothes, Watches, Bags, Tech, Other) using the data format below. Prices in Nepali rupees, honest descriptions, a mix of conditions. | Yes        | `docs/test-data/products.json`    |
| B3  | Gather **2 to 4 photos per product**. Use your own photos or free-licence images only. Note where each one came from.                                                                              | No         | Shared drive folder               |
| B4  | Commit the **photo credits**: file name, source link and licence for every photo.                                                                                                                  | Yes        | `docs/test-data/photo-credits.md` |
| B5  | Write **five seller profiles** (shop name, city, a short description, main category) that sound like real small sellers, to use for seller applications while testing.                             | Yes        | `docs/test-data/sellers.md`       |
| B6  | Write the **category descriptions** (one or two friendly sentences each) and **three banner texts** (headline, one line, button label) for the home page.                                          | Yes        | `docs/test-data/copy.md`          |
| B7  | Research **price ranges** for typical second-hand items in Nepal (for example a used keyboard, a denim jacket) so the demo prices feel right. Share the sources.                                   | No         | Notes in the shared folder        |
| B8  | Keep short **meeting notes** and a weekly list of who did what. Commit one combined summary at the end.                                                                                            | Yes (once) | `docs/sprints.md`                 |

**Product data format** (copy this shape for every product):

```json
{
  "title": "Vintage denim jacket",
  "description": "Classic 90s cut, softly worn in. No stains or tears. Smoke-free home.",
  "priceRupees": 1450,
  "condition": "LIKE_NEW",
  "categorySlug": "clothes",
  "brand": "Levi's",
  "size": "M",
  "photos": ["denim-jacket-1.jpg", "denim-jacket-2.jpg"]
}
```

- `condition` is one of `NEW`, `LIKE_NEW`, `GOOD`, `FAIR`.
- `categorySlug` is one of `clothes`, `watches`, `bags`, `tech`, `other`.
- `brand` and `size` can be left out when they do not apply.
- Titles are short and specific. Descriptions mention flaws honestly. No emoji, no ALL CAPS.
- Photo rules: square or 4:3, bright and in focus, plain background, at least 800 pixels wide, under 2 MB each. Never use photos of people's faces or other people's brand-new product shots.

---

## 4. Member C: brand and logo

Goal: a simple, recognisable logo set the lead can drop straight into the website.

| #   | Task                                                                                                             | Commit? | Where                  |
| --- | ---------------------------------------------------------------------------------------------------------------- | ------- | ---------------------- |
| C1  | Onboarding: add your name, role and one-line interest to `TEAM.md`.                                              | Yes     | `TEAM.md`              |
| C2  | Make **three rough logo ideas** and share them with the team for feedback. The lead will pick one direction.     | No      | Chat or shared folder  |
| C3  | Refine the chosen idea into a **final logo set** (files listed below).                                           | Yes     | `docs/brand/logo/`     |
| C4  | Write the **brand usage page**: colours, minimum size, clear space, what not to do, with a picture of each rule. | Yes     | `docs/brand/README.md` |
| C5  | Make a **social preview image** (1200 by 630) and a **favicon** for browser tabs.                                | Yes     | `docs/brand/logo/`     |
| C6  | Build the **final presentation slides** using the logo and colours. Collect slide content from everyone.         | No      | Shared drive           |

**Logo brief**

- Name: **Feri Nepal**, short form **Ferinep**. "Feri" means "again" in Nepali, so the idea is giving things a second life: a loop, a return, something coming back around.
- Style: simple, flat, readable at 16 pixels. **No gradients. No emoji. No drop shadows.** Solid colours only.
- Colours (use exactly these):

  | Name          | Hex       | Use                    |
  | ------------- | --------- | ---------------------- |
  | Umber (brand) | `#473536` | Main logo colour       |
  | Ink           | `#0A0708` | Text, dark backgrounds |
  | Taupe         | `#ABA79F` | Quiet details          |
  | Clay (accent) | `#D98F75` | Small highlight only   |

- Wordmark font: **Fraunces** (free on Google Fonts), matching the website headings.
- The website currently uses a plain placeholder: a rounded square with a loop icon next to the text "Feri Nepal". Your logo replaces it.

**Files to deliver** (names matter, the lead wires them into the site):

| File                  | Purpose                                   |
| --------------------- | ----------------------------------------- |
| `logo-full.svg`       | Mark plus wordmark, for light backgrounds |
| `logo-full-light.svg` | Same, for dark backgrounds                |
| `logo-mark.svg`       | Mark only, square                         |
| `favicon.svg`         | Mark only, simplified for tiny sizes      |
| `logo-512.png`        | PNG export of the mark, 512 by 512        |
| `social-preview.png`  | 1200 by 630 preview image                 |

Free tools that work well: Figma, Canva, Inkscape. Export SVG as "plain SVG" with text converted to outlines.

---

## 5. Commit budget

| Person   | Planned commits               | Count |
| -------- | ----------------------------- | ----- |
| Member A | A1, A3, A6 (three rounds), A7 | 6     |
| Member B | B1, B2, B4, B5, B6, B8        | 6     |
| Member C | C1, C3, C4, C5                | 4     |

Everything else is visible as Issues, comments and shared files. Members A and B can combine small files into one commit if they prefer fewer, larger ones.

---

## 6. Folder ownership

| Folder or file                                 | Owner                    |
| ---------------------------------------------- | ------------------------ |
| `TEAM.md`                                      | Everyone (one line each) |
| `docs/qa/`, `docs/user-guide.md`               | Member A                 |
| `docs/test-data/`, `docs/sprints.md`           | Member B                 |
| `docs/brand/`                                  | Member C                 |
| Everything else (all code, config, other docs) | Lead                     |

---

## 7. Sprint schedule

Adjust lengths to the real deadline.

| Sprint                        | Lead                                                   | A: QA                                    | B: Test data                   | C: Logo                               |
| ----------------------------- | ------------------------------------------------------ | ---------------------------------------- | ------------------------------ | ------------------------------------- |
| **0: Setup (now)**            | Foundation done; add issue template, labels, share URL | A1, A2 (README check)                    | B1, start B3 and B7            | C1, C2 (three ideas)                  |
| **1: Seller application**     | Fix reported issues; start seller listings             | A3 test plan, A4 and A5 round 1, A6      | B2 (30 products), B5, B6       | C3 final logo set                     |
| **2: Listings and images**    | Seller listings with photo upload                      | A4 and A5 round 2, A6, A8                | B3 and B4 (photos and credits) | C4 brand page, C5 favicon and preview |
| **3: Cart, checkout, orders** | Cart, checkout, COD orders                             | A4 and A5 round 3, A6                    | B8 notes                       | C6 slides draft                       |
| **4: Polish and delivery**    | Bug fixes, deploy, demo                                | A7 user guide, final regression test, A8 | Final content check            | C6 final slides                       |

---

## 8. Lead checklist

- [ ] Repository on GitHub, `main` protected (pull requests required), teammates invited
- [ ] `TEAM.md` committed
- [ ] GitHub issue template for bug reports and the labels listed above
- [ ] A 30-minute session showing how to add a file on github.com and open a pull request
- [ ] A shared running version (or a shared screen session) the tester can use
- [ ] Wire the final logo files into the site (`Logo` component, favicon, social preview)
- [ ] Turn Member B's `products.json` and photos into seed data and Storage uploads

---

## 9. Proving contribution to the professor

Commits are few by design, so show the whole picture and explain the role split with this document.

| Evidence                   | How to produce it                                                       |
| -------------------------- | ----------------------------------------------------------------------- |
| Commits and merged PRs     | `git shortlog -sn --no-merges`; GitHub, Pull Requests, filter by author |
| Bugs found and reported    | GitHub Issues filtered by author (Member A)                             |
| Issues verified and closed | Issue comments and close events (Member A)                              |
| Content and data authored  | Files in `docs/test-data/` with history (Member B)                      |
| Design work                | Files in `docs/brand/`, and the logo in the live site (Member C)        |
| Individual summary         | Each person's section in `CONTRIBUTIONS.md`                             |

`CONTRIBUTIONS.md` template (each person fills it in at the end):

```markdown
## <Name> - <QA / Test data / Brand>

- Tasks completed: (links)
- Commits and PRs: (links)
- Issues filed or files delivered: (numbers and links)
- What I learned: (2-3 sentences)
```

Ask the professor early how individual contribution is assessed (commits only, or also issues, testing and design). If commits are weighted heavily, split deliverables into a few more small commits rather than one big one.

---

## 10. Risks and fixes

| Risk                                   | Fix                                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------- |
| The tester has nothing stable to test  | The lead shares a running version after each feature and says what is new                   |
| Too many vague bug reports             | Use the template; the lead replies once with what is missing, and the report gets fixed     |
| Photos have unclear licences           | Only own photos or free-licence sources, and credits are committed with `photo-credits.md`  |
| The logo does not fit the site         | Follow the brief and file names; the lead checks it on the live site before it is final     |
| Someone goes quiet                     | 10-minute check-in twice a week; tasks are small so the lead can reassign                   |
| The professor counts only code commits | Raise it early; show Issues, content and design as evidence; add small commits where honest |
