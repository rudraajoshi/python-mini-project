from datetime import timedelta
from pathlib import Path
import os

import environ

BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env(DJANGO_DEBUG=(bool, True))
environ.Env.read_env(BASE_DIR / ".env")

DEBUG = env.bool("DJANGO_DEBUG", default=False)
SECRET_KEY = env("DJANGO_SECRET_KEY", default="")
if not SECRET_KEY:
    if not DEBUG:
        raise RuntimeError("DJANGO_SECRET_KEY must be set when DJANGO_DEBUG is False.")
    SECRET_KEY = "unsafe-local-development-key"
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=["localhost", "127.0.0.1", "backend"])

INSTALLED_APPS = [
    "django.contrib.admin", "django.contrib.auth", "django.contrib.contenttypes",
    "django.contrib.sessions", "django.contrib.messages", "django.contrib.staticfiles",
    "corsheaders", "rest_framework", "rest_framework_simplejwt.token_blacklist", "api",
]
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware", "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware", "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware", "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware", "django.contrib.messages.middleware.MessageMiddleware",
]
ROOT_URLCONF = "config.urls"
TEMPLATES = [{"BACKEND": "django.template.backends.django.DjangoTemplates", "DIRS": [], "APP_DIRS": True,
              "OPTIONS": {"context_processors": ["django.template.context_processors.request", "django.contrib.auth.context_processors.auth", "django.contrib.messages.context_processors.messages"]}}]
WSGI_APPLICATION = "config.wsgi.application"

# SQLite makes the project usable immediately; set DATABASE_URL for PostgreSQL in deployment.
DATABASES = {"default": env.db("DATABASE_URL", default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}")}
AUTH_USER_MODEL = "api.User"
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = Path(env("MEDIA_ROOT", default=str(BASE_DIR / "media")))
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=["http://localhost:5173", "http://127.0.0.1:5173"])
CORS_ALLOW_HEADERS = ["accept", "accept-encoding", "authorization", "content-type", "origin", "user-agent", "x-csrftoken", "x-requested-with"]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ("rest_framework_simplejwt.authentication.JWTAuthentication",),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "EXCEPTION_HANDLER": "api.views.exception_handler",
}
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=env.int("JWT_ACCESS_MINUTES", default=60)),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=env.int("JWT_REFRESH_DAYS", default=7)),
    "ROTATE_REFRESH_TOKENS": True, "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}
MAX_UPLOAD_MB = env.int("MAX_UPLOAD_MB", default=50)
CHUNK_CHARS = env.int("CHUNK_CHARS", default=900)
CHUNK_OVERLAP = env.int("CHUNK_OVERLAP", default=120)
RETRIEVAL_MIN_SCORE = env.float("RETRIEVAL_MIN_SCORE", default=0.5)
RETRIEVAL_TOP_K = env.int("RETRIEVAL_TOP_K", default=4)
LLM_PROVIDER = env("LLM_PROVIDER", default="extractive")
LLM_BASE_URL = env("LLM_BASE_URL", default="https://api.groq.com/openai/v1" if LLM_PROVIDER == "groq" else "").rstrip("/")
LLM_API_KEY = env("LLM_API_KEY", default="") or env("GROQ_API_KEY", default="")
LLM_MODEL = env("LLM_MODEL", default="")
LLM_TIMEOUT_SECONDS = env.int("LLM_TIMEOUT_SECONDS", default=20)
LLM_MAX_TOKENS = env.int("LLM_MAX_TOKENS", default=None)
LLM_REASONING_EFFORT = env("LLM_REASONING_EFFORT", default="")
LLM_TEMPERATURE = env.float("LLM_TEMPERATURE", default=None)
LLM_CONTEXT_CHARS = env.int("LLM_CONTEXT_CHARS", default=9000)
