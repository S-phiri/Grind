# ✅ Backend Setup Complete!

Your Django backend is now set up and ready to connect to your React frontend.

## 📁 Project Structure

```
Grind/
├── backend/                    # Django backend
│   ├── api/                    # API application
│   │   ├── models.py          # Database models (Player, Session, Metric, Leaderboard)
│   │   ├── serializers.py     # JSON conversion
│   │   ├── views.py           # API endpoints
│   │   └── urls.py            # URL routing
│   ├── grind_backend/         # Django project settings
│   │   ├── settings.py        # Configuration (CORS, DRF, etc.)
│   │   └── urls.py            # Main URL routing
│   ├── manage.py              # Django management script
│   ├── requirements.txt       # Python dependencies
│   └── SETUP_GUIDE.md         # Detailed explanation
├── src/                        # React frontend (existing)
└── .env                        # Environment variables (updated)
```

## 🚀 Quick Start

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Why:** Installs Django, DRF, and CORS headers needed for the API.

### 2. Create Database Tables

```bash
python manage.py migrate
```

**Why:** Creates SQLite database and all tables for Player, Session, Metric, Leaderboard models.

### 3. Create Admin User

```bash
python manage.py createsuperuser
```

**Why:** Creates a user account you can use to:
- Log in to Django admin (`/admin/`)
- Test API authentication
- Manage data through admin interface

### 4. Start Django Server

```bash
python manage.py runserver
```

**Why:** Starts the Django development server on `http://127.0.0.1:8000`

### 5. Start Frontend (in another terminal)

```bash
npm run dev
```

**Why:** Starts Vite dev server (usually on `http://localhost:5173`)

## 🔗 API Endpoints Created

All endpoints are prefixed with `/api/`:

### Authentication
- `POST /api/auth/login/` - Login (returns token)
- `POST /api/auth/logout/` - Logout (deletes token)
- `GET /api/me/` - Get current user info

### Players
- `GET /api/players/` - List all players
- `POST /api/players/` - Create player
- `GET /api/players/:id/` - Get player details
- `GET /api/players/:id/metrics/` - Get player metrics
- `GET /api/players/:id/sessions/` - Get player sessions

### Sessions
- `GET /api/sessions/?week=current` - List sessions (filter by week)
- `POST /api/sessions/` - Create session

### Metrics
- `POST /api/metrics/` - Log a metric

### Leaderboards
- `GET /api/leaderboards/?type=speed` - Speed leaderboard
- `GET /api/leaderboards/?type=strength` - Strength leaderboard
- `GET /api/leaderboards/?type=compliance` - Compliance leaderboard

## 🔐 Authentication Flow

1. User submits login form → `POST /api/auth/login/`
2. Backend validates credentials → Returns token
3. Frontend stores token in localStorage
4. All subsequent requests include: `Authorization: Token <token>`
5. Backend validates token on each request

## 🛠️ What Was Configured

### ✅ CORS (Cross-Origin Resource Sharing)
- Allows frontend (`localhost:5173`) to make requests
- **Why:** Browsers block cross-origin requests by default for security

### ✅ Token Authentication
- Stateless authentication (no sessions)
- **Why:** Better for SPAs, works with mobile apps

### ✅ REST Framework
- Automatic API documentation
- Serialization/validation
- **Why:** Saves tons of boilerplate code

### ✅ Database Models
- Player, Session, Metric, Leaderboard
- **Why:** Structured data storage with relationships

## 📝 Next Steps

1. **Test the connection:**
   - Start both servers
   - Try logging in from the frontend
   - Check browser console for errors

2. **Add some test data:**
   - Visit `http://127.0.0.1:8000/admin/`
   - Log in with your superuser account
   - Create a few players and sessions

3. **Test the API:**
   - Use the frontend forms to create players/sessions
   - Check that data appears in Django admin

## 🐛 Troubleshooting

**"Connection refused" error:**
- Make sure Django server is running (`python manage.py runserver`)

**CORS errors:**
- Check that `CORS_ALLOWED_ORIGINS` in `settings.py` includes your frontend URL
- Make sure CORS middleware is before CommonMiddleware

**401 Unauthorized:**
- Make sure you're logged in (token exists)
- Check token is being sent in Authorization header

**404 Not Found:**
- Check URL patterns in `api/urls.py`
- Make sure you're using `/api/` prefix

## 📚 Learn More

See `backend/SETUP_GUIDE.md` for detailed explanations of each component and why it's needed.

---

**You're all set!** 🎉 Your frontend and backend are ready to communicate!

