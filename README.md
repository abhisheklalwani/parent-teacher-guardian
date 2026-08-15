# BridgeAI

**BridgeAI turns what a teacher already knows about their students into parent
communication — without giving them anything new to do.**

It was built at an AI-in-education hackathon (Cambridge, MA — August 2026) around one
problem: teachers know a hundred small, useful things about each student, and almost
none of it ever reaches a parent, because writing it down and sending it takes too much
time. Parents usually hear from school only when something has already gone wrong.

BridgeAI closes that gap. Once a week, it looks at a class's gradebook, attendance, and
a short voice note from the teacher, and turns that into a handful of ready-to-send
messages home — the good moments included, not just the problems. The teacher reviews
every message before anything goes out. Nothing sends on its own.

▶️ [Watch a 3-minute demo](https://www.loom.com/share/9940684c3e0a4a3f8c7db33ee5a0e76b)

> **This is a hackathon prototype.** It runs on a single synthetic (AI-generated) class
> roster — no real students, no real parents, no real data. It's meant to demonstrate
> the idea end-to-end, not to be plugged into a real school yet.

---

## What it actually does

Every week, BridgeAI looks for three kinds of moments worth telling a parent about:

| Type | What triggers it | What the parent gets |
|---|---|---|
| 🌱 **Positive noticing** | Effort, improvement, or a moment worth naming | A short, warm note — nothing for them to do |
| 📋 **Intervention needed** | Falling grades, missing work, a concept not landing | A direct but kind message with one concrete thing to try at home |
| 🔄 **Something changed** | A shift from that student's own recent pattern (was on top of homework, now isn't; scores dropped after doing well) | A curious, open note that invites the parent to reply |

The teacher is always in the loop. The app never emails a parent by itself — every
message is approved, edited, or skipped by a human first.

## Using the app

Once it's running (see setup below), the app has three main screens:

1. **Add Notes** — Click record and talk for a couple of minutes about your class:
   what you noticed, who stood out, what changed. When you stop, it's transcribed and
   automatically split into a note per student, matched against your roster. Review,
   edit, or delete any note, then save. Nothing here is sent to anyone — it's just
   building up what the app knows.
2. **Outreach** — A queue of 3–5 suggested messages for the week, generated from the
   gradebook, attendance, and your notes together. Each card shows *why* that student
   was picked, plus an editable subject and message. From here you can:
   - **Approve & send** — sends the email for real (requires email sending to be
     configured; see below)
   - **Copy** — copies the subject + message so you can paste it into your own email,
     the school's parent portal, or anything else you already use
   - **Skip** — dismiss it, no message sent
   - **Regenerate** — ask for a fresh batch
3. **How It Works** — An in-app walkthrough of the whole pipeline (synced gradebook and
   attendance → weekly voice note → generated outreach) using the same live data behind
   the scenes. Good for a first look, or for showing someone else how it works.

---

## Setting it up (no coding experience required)

BridgeAI runs on your own computer as a small local website. This looks like a lot of
steps, but each one is a single command or a couple of clicks — budget about 20 minutes
the first time.

### What you'll need before you start

- A Mac, Windows, or Linux computer
- About 20 minutes
- Three free accounts (instructions for each are below):
  - **Google AI Studio** (required) — powers the transcription and message drafting
  - **Supabase** (required) — stores your saved notes and generated messages
  - **Resend** (optional) — only needed if you want the "Approve & send" button to
    deliver real emails; without it you can still use the "Copy" button

### Step 1 — Install Node.js

Node.js is the free program this app runs on.

1. Go to [nodejs.org](https://nodejs.org)
2. Download the **LTS** version for your computer and run the installer, clicking
   through the default options
3. To check it worked, open:
   - **Mac**: the *Terminal* app (search for it with Spotlight, `Cmd + Space`)
   - **Windows**: *Command Prompt* or *PowerShell* (search for it in the Start menu)
4. Type `node -v` and press Enter. If you see a version number like `v20.x.x`, you're
   set.

### Step 2 — Get a copy of this project

If you were sent a link to this repository on GitHub:

1. Click the green **Code** button, then **Download ZIP**
2. Unzip it somewhere you'll remember, like your Desktop

(If you're comfortable with Git, `git clone` works too.)

### Step 3 — Get your API keys

**Gemini (Google AI Studio) — required**

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with a Google account and click **Create API key**
3. Copy the key somewhere safe — you'll paste it in Step 5

**Supabase — required**

This is where the app stores saved notes and generated messages between visits.

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (pick any name and password — you won't need the password
   again)
3. Once it's ready, open the **SQL Editor** in the left sidebar
4. Copy the contents of
   [`webapp/supabase/migrations/20260815110000_outreach_suggestions.sql`](webapp/supabase/migrations/20260815110000_outreach_suggestions.sql),
   paste it into the editor, and click **Run**
5. Repeat step 4 for
   [`webapp/supabase/migrations/20260815113000_teacher_notes.sql`](webapp/supabase/migrations/20260815113000_teacher_notes.sql)
6. In the left sidebar, go to **Project Settings → API Keys**. You'll need the
   **Project URL** and the **secret key** (sometimes called `service_role`) in Step 5.

**Resend — optional, only if you want real emails to send**

1. Go to [resend.com](https://resend.com) and create a free account
2. Go to **API Keys** and create one
3. You'll also need a "from" email address that Resend has verified for your account —
   their dashboard walks you through this. If you'd rather skip this for now, that's
   fine: everything works except the "Approve & send" button, and you can still use
   "Copy" to paste messages anywhere.

### Step 4 — Install the app's dependencies

In Terminal / Command Prompt, navigate into the project and then into the `webapp`
folder (this is the part of the project that actually runs):

```bash
cd path/to/parent-teacher-guardian/webapp
npm install
```

This downloads everything the app needs to run. It can take a minute or two.

### Step 5 — Add your keys

Inside the `webapp` folder, make a copy of `.env.example` named `.env.local`:

```bash
cp .env.example .env.local
```

Open `.env.local` in any text editor (TextEdit, Notepad, VS Code) and fill in the
values you collected above:

```bash
GEMINI_API_KEY=your-gemini-key

SUPABASE_PROJECT_URL=your-supabase-project-url
SUPABASE_SECRET_KEY=your-supabase-secret-key

# Optional — only needed for the "Approve & send" button
RESEND_API_KEY=your-resend-key
RESEND_FROM_EMAIL=you@yourdomain.com
```

Save the file.

### Step 6 — Run it

Still inside `webapp`:

```bash
npm run dev
```

Leave that window open — it's your local server. Open a web browser and go to:

```
http://localhost:3000
```

You should see BridgeAI. Start with **Add Notes**, then check **Outreach** to see
generated messages.

To stop the app later, click back into that Terminal window and press `Ctrl + C`. To
start it again, repeat Step 6 from inside the `webapp` folder.

### Troubleshooting

- **"command not found: node"** — Node.js isn't installed, or you need to close and
  reopen your Terminal after installing it.
- **A page shows an error mentioning `GEMINI_API_KEY` or Supabase** — double check
  `.env.local` is in the `webapp` folder (not the project root) and that you restarted
  `npm run dev` after editing it (env files are only read when the server starts).
- **"Approve & send" gives an error but "Copy" works fine** — that's expected if you
  skipped the Resend setup; use Copy in the meantime.

---

## Project layout

```
parent-teacher-guardian/
├── webapp/     ← the actual app (Next.js) — see webapp/README.md for developer docs
├── data/       ← synthetic class data (roster, gradebook, attendance, homework)
└── CONTRIBUTE.md
```

If you want to dig into the code, extend a feature, or fix something, see
[CONTRIBUTE.md](CONTRIBUTE.md).

## License

MIT — see [LICENSE](LICENSE).
