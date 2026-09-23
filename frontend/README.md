# Personal Digital Memory — frontend

A private knowledge base: upload PDFs, notes, markdown and screenshots, search them
by meaning, and ask questions that are answered with the page each claim came from.

React 18 · Vite · Tailwind CSS · React Router · Axios · Framer Motion · Lucide.

## Run it

```bash
npm install
cp .env.example .env
npm run dev
```

The app opens at http://localhost:5173 and starts in mock mode, so every screen is
populated without a backend. Sign in with any email and a password of six or more
characters.

## Connecting the Django backend

Set both variables in `.env`:

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCKS=false
```

That single flag is the whole switch. Every service function in `src/api/` already
calls the real endpoint when mocks are off:

| Service | Endpoint |
| --- | --- |
| `authApi.register` | `POST /api/auth/register/` |
| `authApi.login` | `POST /api/auth/login/` |
| `authApi.getCurrentUser` | `GET /api/auth/me/` |
| `documentsApi.listDocuments` | `GET /api/documents/` |
| `documentsApi.uploadDocument` | `POST /api/documents/` (multipart) |
| `documentsApi.getDocument` | `GET /api/documents/{id}/` |
| `documentsApi.getDocumentStatus` | `GET /api/documents/{id}/status/` |
| `documentsApi.deleteDocument` | `DELETE /api/documents/{id}/` |
| `documentsApi.summarizeDocument` | `POST /api/documents/{id}/summarize/` |
| `searchApi.semanticSearch` | `POST /api/search/` |
| `chatApi.ask` | `POST /api/chat/ask/` |

`collectionsApi`, `bookmarksApi`, `chatApi` session calls and `searchApi` history use
the conventional DRF routes (`/collections/`, `/bookmarks/`, `/chat/sessions/`,
`/search/history/`); adjust the paths in those files if your router differs.

JWT handling lives in `src/api/apiClient.js`: the access token is attached to every
request, a 401 triggers one refresh attempt against `/auth/token/refresh/`, and a
failed refresh clears the session and emits `pdm:session-expired`, which
`AuthContext` listens for.

## Structure

```
src/
├── api/            service layer — one module per resource
│   └── mock/       fixtures and mock services (delete this folder to go live)
├── components/
│   ├── app/        shell chrome: sidebar, topbar, search bar, page header
│   ├── ui/         primitives: button, modal, toast, skeleton, empty/error states
│   ├── documents/  rows, cards, icons, viewer, upload, processing status
│   ├── collections/
│   ├── search/     result rows and source citations
│   └── chat/       messages, input, conversation history
├── context/        AuthContext, ToastContext
├── hooks/          useAsync, useDebounce, useHotkey, useMediaQuery, useClickOutside
├── layouts/        AppShell, AuthLayout
├── pages/          one file per route
├── routes/         route table, protected and public-only guards
└── utils/          formatting, class helper, constants
```

Components never call the network directly — pages call service functions, which
decide between mock and live.

## Routes

`/login` · `/register` · `/dashboard` · `/documents` · `/documents/:id` · `/search` ·
`/ask` · `/collections` · `/collections/:id` · `/bookmarks` · 404 fallback.

Authenticated routes redirect to `/login`; signed-in users are bounced from the auth
pages back to `/dashboard`.

## Notes on the document lifecycle

Upload → processing → indexing → ready is displayed, not simulated. The frontend
uploads the file and then reports whatever status the backend gives it; extraction,
OCR, chunking and embedding all happen server-side. `getDocumentStatus` is the hook
for polling once Celery is wired up.

Source citations link to `/documents/:id?page=n`, and the viewer reads that query
parameter, so every answer and search result lands on the exact page it came from.

## Keyboard

`⌘/Ctrl + K` jumps to search · `⌘/Ctrl + U` opens the upload dialog · `Esc` closes
dialogs · `Enter` sends a question, `Shift + Enter` adds a line.
