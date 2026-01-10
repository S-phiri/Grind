# Django Backend Setup Guide

## Step-by-Step Explanation

### 1. **Project Structure** ✅
```
backend/
├── grind_backend/     # Main Django project (settings, URLs)
├── api/              # API app (models, views, serializers)
├── manage.py         # Django management script
└── requirements.txt  # Python dependencies
```

**Why:** Separates the Django project configuration from the API application code. This is Django's standard structure.

---

### 2. **Dependencies (requirements.txt)** ✅

**What we installed:**
- `Django==5.0.1` - The web framework
- `djangorestframework==3.14.0` - Adds REST API capabilities
- `django-cors-headers==4.3.1` - Allows frontend to make requests (CORS)
- `python-decouple==3.8` - For environment variables (optional, for future use)

**Why:** 
- DRF provides serializers, viewsets, and authentication out of the box
- CORS headers are essential - browsers block cross-origin requests by default
- Without CORS, your React app can't talk to Django

---

### 3. **Settings Configuration** ✅

**Added to INSTALLED_APPS:**
- `rest_framework` - Enables DRF
- `rest_framework.authtoken` - Token-based authentication
- `corsheaders` - CORS middleware
- `api` - Our custom API app

**Added to MIDDLEWARE:**
- `corsheaders.middleware.CorsMiddleware` - Must be before CommonMiddleware

**CORS Configuration:**
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite default port
]
```

**Why:** 
- Middleware order matters - CORS must process requests before Django's common middleware
- Only allows requests from your frontend (security)
- Token auth is stateless and works well with SPAs

**REST Framework Settings:**
- Token authentication for all API endpoints
- Requires authentication by default (security)
- Pagination for list views

---

### 4. **Models (Database Schema)** ✅

**Created 4 models:**

1. **Player** - Athletes/users in the system
   - Fields: name, email, position, team
   - Why: Core entity for the training app

2. **Session** - Training sessions
   - Fields: title, type, date, duration, player (FK)
   - Why: Represents scheduled training

3. **Metric** - Performance measurements
   - Fields: player (FK), metric_type, value, unit, date, notes
   - Why: Tracks player performance over time

4. **Leaderboard** - Pre-calculated rankings
   - Fields: player (FK), type, value, rank
   - Why: Efficient way to show rankings without calculating on-the-fly

**Why Foreign Keys:**
- `player` FK in Session/Metric creates relationships
- Django handles joins automatically
- Ensures data integrity (can't delete player with sessions)

---

### 5. **Serializers** ✅

**What they do:**
- Convert Django models ↔ JSON
- Validate incoming data
- Handle nested relationships

**Why:**
- DRF serializers handle JSON conversion automatically
- Validation prevents bad data from entering database
- `read_only_fields` protect sensitive data

---

### 6. **Views/ViewSets** ✅

**ViewSets used:**
- `ModelViewSet` - Full CRUD (Create, Read, Update, Delete)
- `ReadOnlyModelViewSet` - Only read operations (Leaderboard)

**Custom Actions:**
- `@action(detail=True)` - Creates custom endpoints like `/api/players/1/metrics/`
- `get_queryset()` - Filters data (e.g., current week sessions)

**Why ViewSets:**
- Less code than individual views
- Automatic URL routing
- Consistent API structure

---

### 7. **URL Routing** ✅

**Structure:**
```
/api/auth/login/     → login_view
/api/auth/logout/    → logout_view
/api/me/             → me_view
/api/players/        → PlayerViewSet (list, create)
/api/players/:id/    → PlayerViewSet (detail, update, delete)
/api/players/:id/metrics/  → Custom action
/api/sessions/       → SessionViewSet
/api/leaderboards/   → LeaderboardViewSet
```

**Why:**
- RESTful conventions (GET, POST, PUT, DELETE)
- Predictable URLs
- DRF router generates URLs automatically

---

### 8. **Authentication** ✅

**Token Authentication:**
- User logs in → receives token
- Token sent in `Authorization: Token <token>` header
- Token stored in localStorage (frontend)

**Why Token over Session:**
- Stateless (no server-side session storage)
- Works with mobile apps
- Better for SPAs (Single Page Applications)

---

## Next Steps to Run

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Run migrations (create database tables):**
   ```bash
   python manage.py migrate
   ```

3. **Create a superuser (admin account):**
   ```bash
   python manage.py createsuperuser
   ```

4. **Start the server:**
   ```bash
   python manage.py runserver
   ```

5. **Test the API:**
   - Visit `http://127.0.0.1:8000/admin/` (Django admin)
   - API available at `http://127.0.0.1:8000/api/`

---

## How It All Works Together

1. **Frontend makes request** → `fetch('http://127.0.0.1:8000/api/players/')`
2. **CORS middleware** → Checks if origin is allowed
3. **Authentication** → Validates token in header
4. **URL routing** → Matches URL to ViewSet
5. **ViewSet** → Queries database using Model
6. **Serializer** → Converts model to JSON
7. **Response** → Returns JSON to frontend

This is the standard Django REST Framework flow!

