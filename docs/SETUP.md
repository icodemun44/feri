# Setting up Feri Nepal on a new computer

These steps take a fresh Windows computer from nothing to a running website. Mac and Linux notes are at the end. Plan for about 30 to 45 minutes, most of it downloads.

You only need this guide if you want to **run the project on your own computer**. If your role is QA, test data or logo, you can do all your work in the browser (see `GETTING_STARTED.md`) and ask the lead for a link to the running site.

---

## 1. Install the tools (once)

| Tool                          | Why                                       | Download                                       |
| ----------------------------- | ----------------------------------------- | ---------------------------------------------- |
| Git                           | Gets the code from GitHub                 | https://git-scm.com/downloads                  |
| Node.js 24 (LTS)              | Runs the website                          | https://nodejs.org                             |
| Docker Desktop                | Runs the local database and login service | https://www.docker.com/products/docker-desktop |
| Visual Studio Code (optional) | A comfortable place to read the code      | https://code.visualstudio.com                  |

Tips:

- Install Docker Desktop, open it once and wait until it says it is running (a green status in the bottom left). Accept the defaults when it asks about WSL.
- Docker needs memory. If your computer has 8 GB of RAM, close other heavy programs while it runs. In Docker Desktop, Settings, Resources, you can limit it to 3 or 4 GB.
- After installing Node.js, open a **new** terminal window so the new commands are found.

Open a terminal: press the Windows key, type `PowerShell` and press Enter. (Git Bash also works.)

Check everything is installed:

```bash
git --version
node --version
docker --version
```

`node --version` should start with `v24`. If it shows an older number, install Node 24 and open a new terminal.

Install the package manager `pnpm`:

```bash
npm install --global pnpm@11.9.0
pnpm --version
```

If PowerShell says scripts are disabled, run this once and try again:

```bash
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

---

## 2. Get the code

Pick a folder where you keep projects, then:

```bash
git clone https://github.com/icodemun44/feri.git
cd feri
```

The first time you use Git it may open a browser window asking you to sign in to GitHub. Do that. You need to have been added to the repository by the lead.

---

## 3. Install the project

```bash
pnpm install
```

This downloads everything the project needs and takes a few minutes the first time.

---

## 4. Create your settings file

The project reads its settings from a file called `.env` in the main folder.

PowerShell:

```bash
copy .env.example .env
```

Mac, Linux or Git Bash:

```bash
cp .env.example .env
```

You will fill in two values in step 6.

---

## 5. Start the local database and login service

Make sure Docker Desktop is running, then:

```bash
pnpm supabase:start
```

- **The first time this downloads a few gigabytes** and can take 5 to 15 minutes. Later starts take under a minute.
- It is finished when it prints a block of addresses and keys.
- If it says the Docker daemon is not running, start Docker Desktop and wait for it to say it is running, then run the command again.

---

## 6. Copy two keys into `.env`

```bash
pnpm supabase:status
```

Find these two lines in the output:

- **Publishable key** (starts with `sb_publishable_`)
- **Secret key** (starts with `sb_secret_`)

Open `.env` in any text editor (VS Code, or Notepad) and paste them in:

```
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

Leave the other lines as they are. These keys are for your own computer only. Never share real keys from a live project.

---

## 7. Create the tables and add sample data

```bash
pnpm db:deploy
pnpm db:seed
pnpm demo:seed
```

- `db:deploy` creates the database tables.
- `db:seed` adds the six categories and the home page banners.
- `demo:seed` adds sample accounts and 77 sample products with photos.

---

## 8. Start the website

```bash
pnpm dev
```

Open http://localhost:3000 in your browser. You should see the home page with banners and products.

If something else on your computer already uses port 3000, use another port:

```bash
set PORT=3100 && pnpm dev
```

(On Mac, Linux or Git Bash: `PORT=3100 pnpm dev`.) Then open http://localhost:3100.

Log in with a sample account (password `Password123!`):

| Account            | Role   | What to try                               |
| ------------------ | ------ | ----------------------------------------- |
| `buyer@feri.test`  | Buyer  | Browse, then Sell to apply as a seller    |
| `seller@feri.test` | Seller | Seller dashboard and Listings             |
| `admin@feri.test`  | Admin  | Seller applications and Listings to check |

Emails the site sends (for example sign-up confirmation) show up at http://127.0.0.1:54324. The database viewer is at http://127.0.0.1:54323.

---

## Every day after that

1. Open Docker Desktop and wait until it is running.
2. In the project folder: `pnpm supabase:start`
3. Then: `pnpm dev`
4. When you are done: press `Ctrl+C` to stop the website, and `pnpm supabase:stop` to stop the database.

## Getting the latest changes

```bash
git switch main
git pull
pnpm install
pnpm db:deploy
```

`pnpm db:deploy` applies any new database changes. Restart `pnpm dev` afterwards.

---

## If something goes wrong

| Problem                                                     | Fix                                                                                             |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `pnpm` is not recognised                                    | Open a new terminal. If it still fails, run `npm install --global pnpm@11.9.0` again.           |
| "Docker daemon is not running" or the pipe error            | Start Docker Desktop and wait for it to say it is running.                                      |
| `pnpm supabase:start` stops with "not ready" or "unhealthy" | Run `pnpm supabase:stop`, wait a minute and start again. Close heavy programs if memory is low. |
| Page shows "Something went wrong"                           | The database is probably not running. Run `pnpm supabase:start`, then refresh.                  |
| "Invalid environment configuration"                         | `.env` is missing or the two keys from step 6 are not filled in.                                |
| "Port 3000 is already in use"                               | Use another port as shown in step 8.                                                            |
| `@prisma/client` or "no exported member" errors             | Run `pnpm db:generate` and restart `pnpm dev`.                                                  |
| Sample data is missing after a reset                        | Run `pnpm db:seed` and `pnpm demo:seed` again.                                                  |
| Login says wrong password for a sample account              | Run `pnpm demo:seed` again. The password is `Password123!`.                                     |
| Photo upload fails                                          | The secret key in `.env` is missing or wrong (step 6).                                          |
| Start from a completely clean database                      | `pnpm db:reset`, then `pnpm db:seed` and `pnpm demo:seed`. This deletes all local data.         |

Still stuck? Copy the exact error message and send it to the lead.

---

## Mac and Linux notes

- Install Git, Node 24 and Docker Desktop (or Docker Engine) the usual way for your system. Homebrew works well on Mac: `brew install git node@24`.
- Use `cp .env.example .env` instead of `copy`.
- Everything else is the same.
