# Grind

Performance training for footballers. A player completes an intake, gets a structured programme built from templates, logs sessions and metrics, and tracks progress against a squad leaderboard.

## Features

- **Player intake → programme:** intake answers (position, level, goals, training days, equipment, competition schedule) generate a draft programme from reusable programme templates.
- **Workout recommendations:** on-demand standalone workouts by focus area, which can be saved straight into the training calendar as sessions.
- **Session and metric logging:** sets, reps and tempo per exercise; strength and speed metrics over time.
- **Dashboard:** weekly calendar, streaks, upcoming sessions and progress charts.
- **Leaderboards** across players.
- **Analytics dashboard** (`analytics_dashboard.py`, Streamlit): correlation between strength and speed metrics from training data.

## Architecture

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind, shadcn/ui, Recharts |
| API | Django, Django REST Framework (`backend/api`) |
| Analytics | Streamlit, pandas, SciPy |

**Domain model:** `Player` · `PlayerIntake` · `ProgrammeTemplate` · `PlayerProgramme` · `Session` · `Metric` · `Leaderboard`

**Key endpoints** (under `/api/`): `players`, `sessions`, `metrics`, `leaderboards`, `intake`, `programme-templates`, `programmes`, `players/<id>/programmes/draft/`, `workouts/recommend/`, `workouts/generate/`, `dashboard/summary/`, plus `auth/login|signup|logout`.

## Run locally

```bash
# API
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate && python manage.py runserver

# Frontend (repo root, new terminal)
npm install && npm run dev
```

See `backend/SETUP_GUIDE.md` for seeding and troubleshooting.

## Design System

### Colors
- **Charcoal Base**: `#0F1419` - Deep charcoal with subtle dark blue tint
- **Panel**: `#1A1F26` at 70% opacity with 20px backdrop blur
- **Electric Green**: `#00FF88` - Primary actions and progress indicators
- **Warm Orange**: `#FF6B35` - Intensity tags and secondary highlights

### Typography
- **Display/Headings**: `Syne` (Extra Bold, 800) - Athletic energy
- **Body/UI Text**: `Manrope` (Medium 500, SemiBold 600) - Clean and readable
- **Data/Metrics**: `JetBrains Mono` (Medium 500) - Data-driven aesthetic

### Key Design Features
- Glassmorphism panels with frosted glass effect
- Subtle noise texture overlay (5% opacity)
- Custom glow effects for interactive elements
- Smooth transitions with cubic-bezier easing (0.4, 0.0, 0.2, 1)

## Design Principles

Every element should feel like it belongs in a high-performance training facility — clinical, precise, and built for serious athletes. The platform avoids playful or casual design choices, focusing on calculated improvement through data-driven training.
