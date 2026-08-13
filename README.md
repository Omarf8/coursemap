# CourseMap

CourseMap turns a course syllabus PDF into structured, actionable dates. Upload a syllabus, let Gemini pull out every homework, quiz, exam, and project deadline, and push the results straight to your Google Calendar — no more manually copying due dates out of a 12-page PDF.

## Goals

- **Save students time.** Reading through every syllabus at the start of a semester and manually transcribing due dates is tedious and error-prone. CourseMap automates that first pass.
- **One-click calendar sync.** Parsed dates aren't just for viewing — they're formatted as real Google Calendar events and uploaded in a single action, per-course, ready to plan around.
- **Handle real, messy syllabi.** Syllabi vary wildly in layout and wording. CourseMap leans on an LLM (Gemini) rather than rigid text patterns so it can adapt to different formats, disambiguate assignment types (homework, exam, quiz, project, essay/paper), and sequentially number repeated items (e.g. "Quiz #1", "Quiz #2") when the source doesn't distinguish them.
- **Keep it simple.** A minimal upload → review → sync flow with clear feedback at every step (missing file, parse errors, empty results, upload success/failure) rather than a heavyweight course-management tool.

## How it works

1. **Sign in with Google** (`Landing` component) — kicks off an OAuth 2.0 PKCE flow so CourseMap can later write events to your calendar.
2. **Upload a syllabus PDF** (`Dashboard` component) — the file is sent to the backend.
3. **Text extraction** — the backend (`pdfplumber`) pulls raw text out of the PDF.
4. **AI parsing** — that text is sent to Google's Gemini API with a prompt asking for a strict JSON array of `{ title, type, date, course }` objects for every clearly defined (non-TBD) date.
5. **Review** — parsed items are rendered as cards, each tagged with a color/icon based on its type (homework, exam, quiz, project, paper, or other).
6. **Sync to Google Calendar** — a single click posts the reviewed events to the authenticated user's primary calendar as all-day events.

## Tech stack

**Backend** — Python, [FastAPI](https://fastapi.tiangolo.com/), [pdfplumber](https://github.com/jsvine/pdfplumber) for PDF text extraction, [google-genai](https://pypi.org/project/google-genai/) (Gemini) for date extraction, `google-auth-oauthlib` + `google-api-python-client` for Google Calendar OAuth and event creation.

**Frontend** — [React 19](https://react.dev/) + [Vite](https://vitejs.dev/), plain CSS Modules for styling, `react-icons` for the Google sign-in icon.

## Project structure

```
coursemap/
├── backend/
│   └── parser.py       # FastAPI app: syllabus upload, Gemini parsing, Google OAuth, calendar sync
├── frontend/
│   └── src/
│       ├── App.jsx              # Auth-gated router between Landing and Dashboard
│       └── components/
│           ├── Landing.jsx      # Google sign-in screen
│           └── Dashboard.jsx    # Upload, review, and calendar-sync UI
└── requirements.txt     # Backend (Python) dependencies
```

## Getting started

### Prerequisites

- Python 3.13+
- Node.js (for the Vite frontend)
- A Google Cloud project with the Calendar API enabled and OAuth 2.0 credentials (`credentials.json`)
- A Gemini API key

### Backend setup

```bash
cd coursemap
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Place your Google OAuth client secrets in `backend/credentials.json` and set your Gemini API key in a `backend/.env` file (loaded via `python-dotenv`), e.g.:

```
GEMINI_API_KEY=your-key-here
```

Run the API:

```bash
cd backend
fastapi dev parser.py
```

The backend expects to run on `http://localhost:8000` and its OAuth redirect URI is `http://localhost:8000/auth/callback`.

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on Vite's default dev port (`5173`/`5174`) and talks to the backend at `http://localhost:8000`.
