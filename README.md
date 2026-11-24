# AI Interviewer — Complete MVP

A full-stack mock interview practice app for students. Pick a job role (Python Full Stack, DevOps, Frontend, Backend, Data Analyst, HR/Behavioural, or your own), answer by text or voice, and receive an AI-generated performance report.

## Stack

- Frontend: React + Vite + React Router + Axios
- Backend: Python + Django + Django REST Framework
- AI: Google Gemini API (`google-genai`)
- Voice: Browser Web Speech API (speech recognition + speech synthesis)
- Storage: **No database**. Active interview sessions are held in backend process memory. Browser uses `sessionStorage` only for temporary navigation state.

## Important no-database behaviour

- There are no Django models, migrations, database tables, login accounts, or saved interview history.
- Restarting Django clears all active interviews.
- Sessions expire after 3 hours.
- Run one Django development server process for this MVP. Do not use multiple workers because sessions are in memory.
- This is a learning/MVP project, not a hardened production deployment.

## 1. Get a Gemini API key

1. Open Google AI Studio: https://aistudio.google.com/
2. Sign in and create an API key.
3. Keep the key private. **Never put it in the React `.env` file or commit it to GitHub.**
4. Free-tier availability, quotas, supported models and rate limits depend on Google's current policy and your account. If `gemini-2.0-flash` is unavailable to your key, set `GEMINI_MODEL` in `backend/.env` to a currently available Flash model in AI Studio.

## 2. Start the Django backend (Windows PowerShell)

Open PowerShell in the project folder:

```powershell
cd .\backend
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
notepad .env
```

Paste your Gemini key after `GEMINI_API_KEY=` and save `.env`.

Then start the API:

```powershell
python manage.py runserver 127.0.0.1:8000
```

Do **not** run `makemigrations` or `migrate`; this app has no database.

Check the API in a browser:
- http://127.0.0.1:8000/api/health/

It should return JSON and `"gemini_configured": true` after you add the key.

## 3. Start the React frontend

Open a **second** PowerShell window in the project folder:

```powershell
cd .\frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open the local URL printed by Vite, normally http://localhost:5173.

## 4. How to use

1. Click Start practicing.
2. Select your role, experience, difficulty, duration, and Text / Voice / Both.
3. Answer the interviewer's question.
4. Use the microphone button to dictate an answer (Chrome/Edge recommended; browser microphone permission is required).
5. Use the speaker button to hear the latest question.
6. End the interview to generate the report.

Voice features are browser capabilities, not a separate speech AI service. The text interview works even when speech recognition is unavailable.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health/` | Backend and Gemini configuration check |
| POST | `/api/interview/start/` | Create an in-memory session and first question |
| POST | `/api/interview/chat/` | Submit an answer and get feedback + next question |
| POST | `/api/interview/end/` | Generate the final evaluation report |

### Request examples

Start:
```json
{"role":"Python Full Stack Developer","experience":"Fresher","difficulty":"Beginner","duration":"15","mode":"both"}
```

Answer:
```json
{"session_id":"SESSION_UUID","answer":"My answer goes here"}
```

End:
```json
{"session_id":"SESSION_UUID"}
```

## Troubleshooting

- **Gemini API key is missing:** edit `backend/.env`, not frontend `.env`.
- **429 / quota error:** Gemini free-tier quota may be exhausted. Wait for quota reset or check your AI Studio limits.
- **Model not found:** choose an available Gemini Flash model in AI Studio and update `GEMINI_MODEL` in `backend/.env`.
- **CORS error:** keep Vite on `localhost:5173` or `127.0.0.1:5173`; these origins are allowed.
- **Microphone not working:** use Chrome or Edge, allow microphone access, and try `localhost`. Or type answers.
- **Session not found:** sessions are temporary and disappear after server restart or expiry.
- **PowerShell activation blocked:** run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in that terminal, then activate the venv again.

## Project layout

```text
AI-Interviewer/
├── frontend/
│   ├── src/pages/       # Home, Setup, Interview, Report
│   ├── src/services/    # API client
│   └── package.json
├── backend/
│   ├── config/          # Django configuration and routes
│   ├── interviews/      # Gemini prompts, session logic, API views
│   ├── .env.example
│   └── requirements.txt
└── README.md
```

## Before public deployment

Add authentication/rate limiting, stricter input moderation, HTTPS, observability, robust retries, and a durable session store if you later decide to allow persistence. Never expose the Gemini key to the browser.
