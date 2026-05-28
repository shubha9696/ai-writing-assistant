# Antigravity Write: AI Writing Assistant & Summarizer

Antigravity Write is a production-ready, full-stack web application designed to perfect writing with AI-powered revisions. Users can paste text and receive styled, contextual, and optimized rewrites or summaries powered by the **Claude API** (Anthropic). 

The application features full secure JWT User Authentication, live word/character counters, multiple style adjustments, copy capabilities, and a revision log that allows users to instantly restore any past generation.

---

## Live Deployment URLs
- **Frontend (Vercel):** *[Your Live Frontend URL Here]*
- **Backend (Railway/Render):** *[Your Live Backend URL Here]*

---

## Key Features
- **JWT-Secured REST API:** Full User Registration, Login, and secure Token Refresh endpoints.
- **Context-Aware AI Perfecting:** Call Claude API with customized prompt instructions for either complete improved text restructuring (`rewrite`) or core detail extraction (`summarise`).
- **Granular Controls:** Choose custom **Tone** (Professional, Casual, Academic, Creative, Persuasive) and **Output Length** (Shorter, Longer, Same) modifiers.
- **Premium User Interface:** A highly polished, single-page dark dashboard featuring custom glassmorphism panels, loading sequence text indicators, and clipboard indicators.
- **Revision History Logging:** Stores prior revision states securely in SQLite, with an instant click-to-restore panel.
- **Thoughtful Local Fallback:** Supports a highly detailed local developer Mock Mode if an `ANTHROPIC_API_KEY` is not present, ensuring seamless validation.

---

## Technology Stack
- **Backend:** Python, Django 4.2, Django REST Framework, SimpleJWT, Anthropic SDK, SQLite
- **Frontend:** React 18, Vite 8, Tailwind CSS v4, Lucide Icons, PostCSS

---

## Directory Structure
```
/ (Project Root)
├── backend/                  # Django Web API
│   ├── manage.py
│   ├── requirements.txt
│   ├── Procfile              # Railway/Render startup script
│   ├── runtime.txt           # Platform python environment version
│   ├── writing_assistant/    # Django Project Settings
│   └── api/                  # Authentication & AI business logic
└── frontend/                 # Vite + React Single-Page App
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/                  # Components, Styles, and Fetch client
```

---

## Environment Variables Configuration

Both the frontend and backend require a `.env` file for local development. Copy the `.env.example` templates provided in their respective directories.

### Backend `.env` (`/backend/.env`)
```ini
# Django security keys (Must change in production)
SECRET_KEY=django-insecure-3h8b(1-o=1#b5b-y*@a)34-2e%_n5h6i$s-t*e%s_k#ey
DEBUG=True
ALLOWED_HOSTS=*

# Local frontend origin whitelist
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Anthropic Claude Integration
ANTHROPIC_API_KEY=your_anthropic_api_key_here
CLAUDE_MODEL=claude-3-5-haiku-20241022
```

### Frontend `.env` (`/frontend/.env`)
```ini
# Base URL pointing to the active backend API
VITE_API_URL=http://localhost:8000
```

---

## Local Development Setup

### Prerequisite Check
- Ensure **Python 3.10+** and **Node.js 18+** are installed.

### 1. Backend Setup
1. Navigate into the backend directory:
   ```bash
   cd backend
   ```
2. Initialize and activate a virtual environment:
   - **Windows:**
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **macOS/Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install package dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Launch the local API server:
   ```bash
   python manage.py runserver
   ```
   *The backend will now be live on `http://127.0.0.1:8000`.*

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Boot the Vite development server:
   ```bash
   npm run dev
   ```
   *The UI will now be accessible on `http://localhost:5173`.*

---

## Automated API Integration Testing

A robust automated testing harness has been provided to verify the backend API endpoints end-to-end (Register, Token Obtain, Token Expiry/Rejection, Claude Rewrite, Summarize, and History).

To run the suite:
1. Ensure your backend virtual environment is active.
2. In the `backend` folder, run:
   ```bash
   python test_api.py
   ```
This script automatically registers a unique user, logs in, obtains and stores tokens, and performs testing assertions across all REST operations.

---

## Production Deployment Guidelines

### Backend Deployment (Railway or Render)
1. **Repository Settings:** Ensure your backend folder is pushed to GitHub.
2. **Variables Configuration:** In the Railway/Render dashboard, add the following environment variables:
   - `SECRET_KEY` (Generate a secure, random string)
   - `DEBUG=False`
   - `ALLOWED_HOSTS` (Set to your deployed backend domain name, e.g., `api.example.com` or `*`)
   - `CORS_ALLOWED_ORIGINS` (Set to your deployed frontend Vercel URL, e.g., `https://your-app.vercel.app`)
   - `ANTHROPIC_API_KEY` (Your live Claude API token)
   - `CLAUDE_MODEL` (`claude-3-5-haiku-20241022`)
3. **Execution Port:** Railway/Render will automatically read the `Procfile` and bind to the correct `$PORT`.

### Frontend Deployment (Vercel)
1. Import your repository into Vercel.
2. Set the **Root Directory** to `frontend`.
3. In **Environment Variables**, configure:
   - `VITE_API_URL` (Set to your deployed backend production URL)
4. Deploy! Vercel will build the SPA assets and serve the client interface.
