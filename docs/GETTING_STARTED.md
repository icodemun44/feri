# Getting started for teammates

This guide is for people who have never used GitHub before. You do **not** need to install anything or use a terminal. Everything below happens in your web browser.

Repository: https://github.com/icodemun44/feri

---

## 1. Get access

1. Create a free GitHub account at https://github.com if you do not have one. Use a username you are happy to show your professor.
2. Send your GitHub username to the team lead. They will add you to the repository.
3. Open the invitation email from GitHub (or go to https://github.com/icodemun44/feri/invitations) and click **Accept invitation**.
4. Open https://github.com/icodemun44/feri. If you can see the files, you are in.

## 2. Find your way around

On the repository page you will use these tabs:

| Tab               | What it is for                                                            |
| ----------------- | ------------------------------------------------------------------------- |
| **Code**          | All the files. Your work goes in the `docs` folder (see your role below). |
| **Issues**        | Bug reports and tasks. The QA person lives here.                          |
| **Pull requests** | Proposed changes waiting for the lead to approve.                         |

Start by reading **`docs/CONTRIBUTION_PLAN.md`**. It lists your role, your tasks and which folder is yours. Click the file, then read it on the page.

**Please do not edit** anything inside the `apps` or `packages` folders, or any file that is not in your own folder. The lead looks after those.

## 3. Your first contribution: add yourself to TEAM.md

1. On the repository page, click the file **`TEAM.md`**.
2. Click the **pencil icon** (Edit this file) at the top right of the file.
3. Fill in your row in the table: your name, your role and your GitHub username.
4. Click the green **Commit changes...** button.
5. In the box that opens:
   - In the first field, write a short message, for example `docs: add Sita to the team`.
   - Choose **Create a new branch for this commit and start a pull request**.
   - Name the branch `onboarding/your-name` (lowercase, no spaces).
6. Click **Propose changes**, then **Create pull request** on the next page.
7. Tell the lead. They will review and click **Merge**. Your first commit is now part of the project.

> A **branch** is your own copy of the project where you work without breaking anything. A **pull request** is how you ask the lead to add your work to the main project.

## 4. Adding a new file or a document

Use this for your plan, notes, product data, logo files and so on.

1. Open the folder where the file should go (for example `docs/qa`).
2. Click **Add file**, then:
   - **Create new file** to type text directly (give it a name ending in `.md` for notes or `.json` for data), or
   - **Upload files** to drag in images, PDFs or documents.
3. Scroll down to **Commit changes**. Write a short message, for example `docs: add test plan`.
4. Choose **Create a new branch for this commit and start a pull request**. Name the branch like `qa/test-plan` or `brand/logo-files`.
5. Click **Propose changes**, then **Create pull request**.

If the folder does not exist yet, choose **Create new file** and type the folder name followed by a slash and the file name, for example `docs/qa/test-plan.md`. GitHub creates the folder for you.

### Changing a file you already added

1. Open the file, click the pencil icon, make your change.
2. Commit it to a **new branch** the same way as above.

### Message style

Start the message with a short word and a colon, then say what you did in plain English:

| Start with | Use it for                     |
| ---------- | ------------------------------ |
| `docs:`    | Documents, notes, guides       |
| `test:`    | Test plans and test results    |
| `chore:`   | Data files, small housekeeping |
| `style:`   | Logo and visual design files   |

Examples: `docs: add user guide draft`, `test: record results for round 1`, `style: add final logo set`.

## 5. Reporting a bug (QA)

1. Click the **Issues** tab, then **New issue**.
2. Choose **Bug report** and fill in the form. One problem per issue.
3. Drag a screenshot straight into the "What happened" box to attach it.
4. Click **Submit new issue**.
5. When the lead says a bug is fixed, test it again. If it is fixed, write a comment and click **Close with comment**. If not, comment what is still wrong.

## 6. Commenting and reviewing

- Open a pull request and click **Files changed** to read someone's work. You can leave a comment on any line by clicking the blue **+** next to it.
- Comments on issues and pull requests count as contribution too.

## 7. Seeing the running website

The lead will share a link or a time to look at the running site. If you want to run it on your own computer, follow the steps in the main `README.md` (it needs a few programs installed, so ask the lead first).

Demo accounts for testing (password `Password123!`):

| Account            | Role   |
| ------------------ | ------ |
| `buyer@feri.test`  | Buyer  |
| `seller@feri.test` | Seller |
| `admin@feri.test`  | Admin  |

## 8. Rules of thumb

- Never put passwords, API keys or personal phone numbers in any file or issue.
- Only use photos you took yourself or ones with a free licence, and write down where each one came from.
- One change per pull request keeps reviews quick.
- If you are not sure, ask in the group chat before you commit. Nothing is lost: everything on GitHub can be undone.

## 9. Common problems

| Problem                                  | What to do                                                                             |
| ---------------------------------------- | -------------------------------------------------------------------------------------- |
| I cannot see the repository              | You have not accepted the invitation yet. Check your email or the invitations link.    |
| There is no pencil icon                  | You may be on a protected page or not signed in. Sign in, or ask the lead.             |
| It says "you must fork this repository"  | You do not have access yet. Ask the lead to check your invitation.                     |
| My pull request says there are conflicts | Tell the lead. It means two people changed the same file. They will sort it out.       |
| I committed to the wrong place           | Tell the lead. Nothing is lost and it can be moved.                                    |
| I uploaded the wrong file                | Open the pull request and tell the lead, or upload the correct one to the same branch. |

## 10. Words you will hear

| Word              | Meaning                                                 |
| ----------------- | ------------------------------------------------------- |
| Repository (repo) | The project folder on GitHub                            |
| Commit            | A saved change with a short message                     |
| Branch            | A separate copy where you work safely                   |
| Pull request (PR) | A request to add your branch's work to the main project |
| Merge             | The lead approving and adding your work                 |
| Issue             | A bug report or a task                                  |
