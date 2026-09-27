# Matchbench — Student Skill & Project Matching (local setup)

A 4-step app (Profile → Skills & Interest → Project Level → Matches) that
generates tailored project ideas using the **Google Gemini API**. It runs as
two separate local processes:

- `backend/` — a small Express server that holds your Gemini API key and
  calls the Gemini API (the key never touches the browser)
- `frontend/` — a Vite static site (plain HTML/CSS/JS) that talks to the
  backend over `http://localhost:5000`

```
project/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── .env.example
    ├── .gitignore
    └── src/
        ├── main.js
        └── style.css
```
## 🌐 Live Demo

Matchbench is deployed on AWS Elastic Beanstalk:
http://projectmatchbench-env.eba-e3cd97mm.ap-south-1.elasticbeanstalk.com/

> Note: the Gemini API key is configured via Elastic Beanstalk's environment
> properties in the AWS console, not from a committed `.env` file.

## 0. Prerequisites

- **Node.js 18 or newer** (needed for built-in `fetch`). Check with:
  ```
  node -v
  ```
- A **free Gemini API key** from Google AI Studio:
  https://aistudio.google.com/app/apikey

## 1. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and paste your key:

```
GEMINI_API_KEY=your_real_key_here
GEMINI_MODEL=gemini-2.5-flash
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
```

Start it:

```bash
npm start
```

You should see:

```
✅ Skill Matcher backend running at http://localhost:5000
   Model: gemini-2.5-flash
   API key loaded: yes
```

Sanity-check it in a browser or with curl:

```
http://localhost:5000/api/health
```

If `hasApiKey` is `false`, your `.env` wasn't picked up — double check it's
in `backend/.env` (not `backend/.env.example`) and restart `npm start`.

> If `gemini-2.5-flash` ever gets deprecated or you want a different model,
> just change `GEMINI_MODEL` in `.env` — no code changes needed. You can see
> which models your key can use at https://aistudio.google.com/.

## 2. Set up the frontend (in a **second** terminal)

```bash
cd frontend
npm install
npm run dev
```

Vite will open the app automatically at:

```
http://localhost:5173
```

(If it doesn't open automatically, click that URL yourself.)

The frontend already points at `http://localhost:5000` by default. If your
backend runs on a different port/host, copy `frontend/.env.example` to
`frontend/.env` and set `VITE_API_BASE_URL` accordingly, then restart
`npm run dev`.

## 3. Use it

1. Fill in name, course, branch (pick **Other** if yours isn't listed —
   both course and branch will let you type a custom value)
2. Select your skills (or add your own) and one area of interest (also has
   an **Other** option)
3. Pick a project level: Easy / Medium / Hard
4. Click **Find my projects** — the frontend calls your backend, which
   calls Gemini, and 5 tailored project ideas come back

## Troubleshooting — avoiding a blank/failed output screen

- **"Could not reach the backend..."** → the backend isn't running, or it's
  running on a different port than `VITE_API_BASE_URL` expects. Check the
  backend terminal is still open and showing no crash.
- **CORS error in the browser console** → `FRONTEND_ORIGIN` in
  `backend/.env` doesn't match the URL the frontend is actually served
  from. Default is `http://localhost:5173` — if Vite picked a different
  port (it will say so in its terminal), update `FRONTEND_ORIGIN` to match
  and restart the backend.
- **"GEMINI_API_KEY is not set..."** → you skipped step 1's `cp .env.example .env`,
  or forgot to paste your key in, or restart the backend after editing `.env`.
- **"Gemini API request failed (404)" / "model ... is no longer available"**
  → Google regularly retires specific model versions. Set
  `GEMINI_MODEL=gemini-flash-latest` in `backend/.env` (this is now the
  default) — it's an alias that always points at Google's current stable
  Flash model, so it won't go stale. If you want a pinned version instead,
  check https://ai.google.dev/gemini-api/docs/models for the current list
  (at time of writing: `gemini-3.6-flash`, `gemini-3.5-flash-lite`).
  Restart the backend (`npm start`) after changing `.env` — it only reads
  the file on startup.
- **"Gemini API request failed (400/403)"** → usually an invalid key, or a
  key without Gemini API access enabled.
- **"Could not parse Gemini's response as JSON"** → rare; just click
  "Try again" — the backend already strips ```` ```json ```` fences and
  isolates the `[...]` array, but a model can occasionally add stray text.
- Ports already in use → change `PORT` in `backend/.env` (and update
  `VITE_API_BASE_URL` in `frontend/.env` to match), or `npm run dev -- --port 5174`
  for the frontend.

## Notes

- Nothing is persisted — this is a stateless demo flow, matching the
  original spec. No database is included.
- The Gemini API key lives only in `backend/.env` and is never sent to the
  browser — the frontend only ever talks to your own backend.
