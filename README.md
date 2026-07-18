# Worship na Marafiki

A community song library of African worship music — lyrics, **ChordBora** chords, live transposition, and translations across the continent. Built on Next.js + Postgres (Neon), deployed on Vercel.

> *"…present your bodies as a living sacrifice, holy and acceptable to God, which is your spiritual worship."* — Romans 12:1

---

## What's in here

```
app/
  page.js                     Landing page
  library/page.js             Song library with search + filters
  songs/[id]/page.js          Song detail: view toggle, transpose, translations, videos
  panel/upload/page.js        Panel-only upload form (song → versions → tags → publish)
  signin/page.js              Sign in / register
  api/
    songs/route.js            GET list (public) · POST create song + tags
    songs/[id]/route.js       GET one song with all versions + media
    versions/route.js         POST add version + media · PATCH verify/publish
components/Chrome.js          Shared nav + footer
lib/
  db.js                       Neon database client
  chordbora.js                ChordBora parse + transpose engine
db/
  schema.sql                  Full database schema + seed languages/tags
  seed-examples.sql           Optional public-domain starter songs
  setup.mjs                   Script to run the schema
```

**ChordBora** is our chord format. Chords go in brackets inline with lyrics, section headers in braces:

```
{Verse 1}
[G]Shangilia, [C]shangilia
[Em]Bwana yu [D]mwema
```

The engine renders chords above the lyrics and powers the transpose buttons everywhere.

---

## Get it live — step by step

You'll do this once. After that, every `git push` redeploys the site automatically.

### 1. Put the code on your computer

Unzip this folder somewhere sensible, open a terminal inside it, and install:

```bash
cd worship-na-marafiki
npm install
```

### 2. Push it to GitHub

Create a new **empty** repository on github.com (name it `worship-na-marafiki`, no README). Then:

```bash
git init
git add .
git commit -m "Worship na Marafiki — initial site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/worship-na-marafiki.git
git push -u origin main
```

### 3. Import the project into Vercel

1. Go to **vercel.com** and sign in with your GitHub account.
2. **Add New → Project**, pick your `worship-na-marafiki` repo, click **Import**.
3. Vercel auto-detects Next.js. Leave everything default and click **Deploy**.
4. You'll get a live `something.vercel.app` URL in about a minute. (The pages load; the database comes next.)

### 4. Create the database

1. In your new Vercel project, open the **Storage** tab.
2. **Create Database → Neon** (Postgres) from the Marketplace, and follow the prompts. Choose the option to create a new Neon account if you don't have one — billing stays inside Vercel, and the free plan is plenty to start.
3. When it connects to your project, Vercel **automatically adds the `DATABASE_URL`** environment variable. You don't type any credentials yourself.

### 5. Create the tables

1. On the Storage tab, click **Open in Neon** to open the Neon Console.
2. Open the **SQL Editor**.
3. Open `db/schema.sql` from this project, copy **all** of it, paste into the SQL Editor, and **Run**. This creates every table plus the 18 languages, all tags, and the publish-gate view.
4. *(Optional)* Do the same with `db/seed-examples.sql` to start with a public-domain song so the library isn't empty.

### 6. Redeploy so the app sees the database

Back in Vercel → **Deployments** → open the latest → **Redeploy** (or just `git commit --allow-empty -m "connect db" && git push`). The API routes now read and write to Postgres.

### 7. Point your domain at it

1. Vercel project → **Settings → Domains**.
2. Add `worshipnamarafiki.africa` (and `www.worshipnamarafiki.africa` if you want).
3. Vercel shows you the DNS records to add. Log in wherever you registered the `.africa` domain and add them (usually an **A record** to Vercel's IP and a **CNAME** for `www`).
4. Wait for DNS to propagate — often minutes, up to a day for `.africa`. HTTPS is automatic once it resolves.

**You're live.** 🎉

---

## Running it locally (optional)

To preview on your own machine before pushing:

```bash
cp .env.example .env.local
# paste your Neon connection string into .env.local
# (get it from Neon Console → Connection Details)
npm run dev
```

Open http://localhost:3000.

You can also load the schema from your machine instead of the SQL editor:

```bash
DATABASE_URL="postgres://..." npm run db:setup
```

---

## How publishing works (the safety gates)

A song only appears publicly when **all** of these are true — enforced by both the upload form and the database view `public_song_versions`:

- The song's **rights** are `public_domain` or `permission_granted`
- At least one **version** is the `original` or `translation_verified` by your panel
- The song and that version are both marked published

Translations sit privately in `translation_in_progress` / `translation_review` until your panel signs off. Nothing half-finished leaks to the public.

---

## What to build next

- **Lock the panel behind login.** The upload form at `/panel/upload` is currently open. Wire real auth (the `jose` + `bcryptjs` packages are already installed) so only panel members reach it. This should be done before you share the site widely.
- **PDF / Word download** of any song in any key (the "download as PDF" button from the design).
- **Language landing pages** (`/library?lang=Swahili` already works; give each a proper page).
- **Favourites & accounts** for logged-in visitors.

---

*Free for congregational use. © Worship na Marafiki.*

---

## Panel accounts (private upload area)

The upload form at `/panel/upload` is protected. Only signed-in panel members can reach it, and only an admin can create accounts.

### One-time setup

1. **Create the accounts table.** In the Neon SQL Editor, run the contents of `db/auth-schema.sql`.
2. **Add the session secret in Vercel.** Project → **Settings → Environment Variables** → add:
   - **Name:** `AUTH_SECRET`
   - **Value:** a long random string (64 hex characters works well)
   - Apply to all environments, then **Save**.
3. **Redeploy** so the secret takes effect (Deployments → ⋯ → Redeploy).
4. **Create the first admin.** Visit `/signin`. Because there are no accounts yet, it shows a "Create the first admin account" form. Fill it in — this first account becomes the **admin**, and you're signed in immediately.

### Day-to-day

- **Admin adds members:** signed in as admin, go to **Manage accounts** (link in the panel bar) → fill name, email, temporary password → **Create account**. Share those details with the member.
- **Members sign in** at `/signin` with the email and password they were given.
- **Sign out** with the button in the panel bar.

Sessions last 30 days. If you ever change `AUTH_SECRET`, everyone is signed out and must sign in again.
