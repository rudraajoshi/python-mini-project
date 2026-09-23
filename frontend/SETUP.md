# Setup

Everything below takes about three minutes. You need Node.js and nothing else —
no database, no Python, no backend. The app starts in mock mode with a full
library of sample documents already loaded.

---

## 1. Install Node.js

You need **Node 18 or newer** (20 LTS recommended).

Check what you have:

```bash
node -v
npm -v
```

If `node -v` prints nothing, or a number below 18, install it:

- **Windows / macOS** — download the LTS installer from https://nodejs.org and run it
- **macOS with Homebrew** — `brew install node`
- **Ubuntu / Debian** — `sudo apt install nodejs npm` (check the version; if it's
  below 18, use https://github.com/nodesource/distributions instead)

Close and reopen your terminal after installing so the new `node` is on your PATH.

---

## 2. Unzip and open the folder

Unzip `personal-digital-memory.zip` wherever you keep projects, then open a
terminal **inside** the unzipped folder.

```bash
cd path/to/personal-digital-memory
```

You're in the right place if `ls` (or `dir` on Windows) shows `package.json`.

---

## 3. Install dependencies

```bash
npm install
```

This downloads about 105 MB into a new `node_modules/` folder and takes one to
three minutes on a normal connection. `package-lock.json` is included, so you get
the exact versions this project was built and tested against.

---

## 4. Create your environment file

```bash
# macOS / Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

The defaults are already correct for running without a backend:

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCKS=true
```

The app reads `.env` only at startup, so if you edit it later, restart the dev
server.

---

## 5. Run it

```bash
npm run dev
```

Vite prints a local URL, normally http://localhost:5173. Open it in your browser.

At the sign-in screen, enter **any email address** and **any password of six or
more characters**. Mock mode accepts them and drops you on the dashboard with a
sample library already in place.

Stop the server with `Ctrl + C`.

---

## What you can try

| Where | What works |
| --- | --- |
| Dashboard | Recent documents, continue-reading progress, collections, activity |
| `⌘K` / `Ctrl+K` | Jumps to search from anywhere |
| `⌘U` / `Ctrl+U` | Opens the upload dialog |
| Search | Try `2NF`, `circular queue`, or `SVD image compression` |
| Ask | Try "What is 2NF?" — the answer arrives with clickable page citations |
| Upload | Drag any file in; it runs the real upload flow against the mock service |
| Any citation | Opens the document at that exact page |

Uploads and edits live in memory only — refreshing the page resets everything
back to the sample data. That's the mock layer, not a bug.

---

## Other commands

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

---

## Connecting your Django backend

When the API is running, change one line in `.env`:

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCKS=false
```

Restart `npm run dev`. Every service function in `src/api/` now calls the real
endpoint. Once you're happy, delete `src/api/mock/` — nothing outside that folder
imports it.

You'll also need CORS on the Django side:

```bash
pip install django-cors-headers
```

```python
INSTALLED_APPS = [..., "corsheaders"]
MIDDLEWARE = ["corsheaders.middleware.CorsMiddleware", ...]  # above CommonMiddleware
CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
```

The endpoint map is in `README.md`.

---

## If something goes wrong

**`npm: command not found`** — Node isn't installed, or your terminal was open
before you installed it. Reopen the terminal.

**`Cannot find module` or a blank page after install** — delete and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

(On Windows PowerShell: `Remove-Item -Recurse -Force node_modules, package-lock.json`)

**Port 5173 already in use** — run `npm run dev -- --port 3000` instead.

**Styles look broken — plain text, no layout** — Tailwind didn't compile. Stop the
server and restart it; if it persists, confirm `postcss.config.js` and
`tailwind.config.js` are both in the project root.

**Fonts look generic** — the Inter webfont is loaded from Google Fonts, so the
first load needs internet. Offline, it falls back to your system sans-serif and
everything still lays out correctly.

**Sign-in does nothing** — the password must be at least six characters. Shorter
ones are rejected on purpose to exercise the error state.

**A network error on every request with mocks off** — either Django isn't running,
`VITE_API_BASE_URL` is wrong, or CORS isn't configured. Check the browser console.
