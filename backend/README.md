# Personal Digital Memory API

The Django API powers the React app in `frontend/`. It supports account creation, JWT login, uploaded notes and PDFs, collections, bookmarks, search history, chat history, and a retrieval-based answer flow.

## Run

1. From the repository root, run `docker compose up --build`.
2. In another terminal, start the frontend with `cd frontend` followed by `npm run dev`.
3. Open the address printed by Vite and register a new account.

The checked-in `frontend/.env` already points the UI at `http://localhost:8000/api` and disables mock data.

For local Python use, copy `.env.example` to `.env`, install `requirements.txt`, then run `python manage.py migrate` and `python manage.py runserver` from `backend/`.

## Using Groq

Create a Groq API key, then place these four settings in `backend/.env` (never in the frontend):

```text
LLM_PROVIDER=groq
GROQ_API_KEY=your-key
LLM_MODEL=your-selected-model
LLM_REASONING_EFFORT=low
```

Apply the change with `docker compose up -d --force-recreate backend`, then run `docker compose exec backend python manage.py check_llm`. If a model becomes unavailable, use `docker compose exec backend python manage.py check_llm --list-models` and update `LLM_MODEL`.

Chat responses include `degraded: true` and a `degradedReason` only when an enabled LLM fails or lacks configuration; the API then safely returns compact extractive passages instead. Groq free-tier limits and model availability can change over time.
