
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DEBUG = os.getenv("DEBUG", "True").lower() == "true"

SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "local-development-only-key" if DEBUG else ""
)

if not SECRET_KEY:
    raise RuntimeError("DJANGO_SECRET_KEY is required in production.")

ALLOWED_HOSTS = [
    x.strip()
    for x in os.getenv(
        "ALLOWED_HOSTS", "127.0.0.1,localhost"
    ).split(",")
    if x.strip()
]

INSTALLED_APPS = [
    "rest_framework",
    "corsheaders",
    "interviews",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "config.urls"
TEMPLATES = []
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# No database: interview sessions currently live in memory.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.dummy"
    }
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOWED_ORIGINS = [
    x.strip()
    for x in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if x.strip()
]

CORS_ALLOW_HEADERS = [
    "accept",
    "authorization",
    "content-type",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny"
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer"
    ],
    "UNAUTHENTICATED_USER": None,
}

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

TIME_ZONE = "Asia/Kolkata"
USE_TZ = True

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
