"""
Quick script to test login functionality
Run: python test_login.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'grind_backend.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

# Check existing users
print("=== Existing Users ===")
for user in User.objects.all():
    print(f"Username: {user.username}")
    print(f"Email: {user.email}")
    print(f"Has token: {Token.objects.filter(user=user).exists()}")
    print()

# Test authentication
print("=== Testing Authentication ===")
test_username = "simba"
test_password = input(f"Enter password for user '{test_username}': ")

user = User.objects.filter(username=test_username).first()
if user:
    from django.contrib.auth import authenticate
    authenticated = authenticate(username=user.username, password=test_password)
    if authenticated:
        print("✅ Authentication successful!")
        token, created = Token.objects.get_or_create(user=authenticated)
        print(f"Token: {token.key}")
    else:
        print("❌ Authentication failed - wrong password")
else:
    print("❌ User not found")

