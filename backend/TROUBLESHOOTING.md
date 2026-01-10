# Troubleshooting Login Issues

## 401 Unauthorized Error

If you're getting `401 Unauthorized` when trying to log in, here are the steps to fix it:

### 1. Check if user exists

```bash
cd backend
python manage.py shell
```

Then in the shell:
```python
from django.contrib.auth.models import User
for user in User.objects.all():
    print(f"Username: {user.username}, Email: {user.email}")
```

### 2. Test login credentials

You can test if your password works:

```bash
python test_login.py
```

This will prompt you for the password and test authentication.

### 3. Create a new user (if needed)

If you don't have a user or forgot the password:

```bash
python manage.py createsuperuser
```

This creates a new admin user with username/password you choose.

### 4. Reset password for existing user

If you have a user but forgot the password:

```bash
python manage.py shell
```

Then:
```python
from django.contrib.auth.models import User
user = User.objects.get(username='simba')  # or your username
user.set_password('newpassword123')
user.save()
print("Password reset!")
```

### 5. Test login with curl

You can test the API directly:

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "simba_phiri@outlook.com", "password": "yourpassword"}'
```

Or using username:
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "simba", "password": "yourpassword"}'
```

### 6. Check Django server logs

The server logs will show what's happening. Look for:
- `Unauthorized: /api/auth/login/` - means credentials are wrong
- `POST /api/auth/login/ HTTP/1.1" 401` - authentication failed

### Common Issues:

1. **Wrong email/username**: Make sure you're using the exact email or username from the database
2. **Wrong password**: The password must match exactly
3. **Case sensitivity**: Username/email matching is now case-insensitive, but password is case-sensitive
4. **No user exists**: Create one with `createsuperuser`

### Quick Fix:

If you just want to get it working quickly:

```bash
cd backend
python manage.py createsuperuser
# Enter: username (e.g., "admin")
# Enter: email (e.g., "admin@test.com")  
# Enter: password (remember this!)

# Then use those credentials in the frontend login form
```

