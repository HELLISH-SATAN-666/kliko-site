import os
import sys
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured


def env_bool(name, default=False):
    return os.getenv(name, str(int(default))).strip().lower() in {"1", "true", "yes", "on"}


def env_list(name, default=""):
    return [item.strip() for item in os.getenv(name, default).split(",") if item.strip()]

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/

DEBUG = env_bool("DJANGO_DEBUG", True)

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    if DEBUG or "test" in sys.argv:
        SECRET_KEY = "django-insecure-dev-only-change-me"
    else:
        raise ImproperlyConfigured("DJANGO_SECRET_KEY must be set in production.")

ALLOWED_HOSTS = env_list(
    "DJANGO_ALLOWED_HOSTS",
    "proforin.online,www.proforin.online,127.0.0.1,localhost,testserver",
)

CSRF_TRUSTED_ORIGINS = env_list(
    "DJANGO_CSRF_TRUSTED_ORIGINS",
    "https://proforin.online,https://www.proforin.online",
)


# Application definition

INSTALLED_APPS = [
    'landing',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'landing.middleware.VisitTrackingMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'landing.middleware.SecurityHeadersMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'ru-ru'

TIME_ZONE = 'Asia/Bangkok'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

ADMIN_URL = os.getenv("DJANGO_ADMIN_URL", "admin/").strip("/") + "/"
LOGIN_URL = f"/{ADMIN_URL}login/"

CONTACT_PHONE_DISPLAY = os.getenv("CONTACT_PHONE_DISPLAY", "+7 (999) 123-45-67")
CONTACT_PHONE_TEL = os.getenv("CONTACT_PHONE_TEL", "+79991234567")
TELEGRAM_URL = os.getenv("TELEGRAM_URL", "https://t.me/your_username")
WHATSAPP_URL = os.getenv("WHATSAPP_URL", "https://wa.me/79991234567")

EXAMPLE_PRIMERI_URL = os.getenv("EXAMPLE_PRIMERI_URL", "/examples/primeri/")
EXAMPLE_PRIMERI_2_URL = os.getenv("EXAMPLE_PRIMERI_2_URL", "/examples/primeri-2/")

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
TELEGRAM_ADMIN_USERNAME = os.getenv("TELEGRAM_ADMIN_USERNAME", "")
TELEGRAM_NOTIFY_ENABLED = env_bool("TELEGRAM_NOTIFY_ENABLED", bool(TELEGRAM_BOT_TOKEN))
TELEGRAM_TIMEOUT_SECONDS = float(os.getenv("TELEGRAM_TIMEOUT_SECONDS", "5"))
TELEGRAM_FORCE_IPV4 = env_bool("TELEGRAM_FORCE_IPV4", True)

VPN_ENABLED = env_bool("VPN_ENABLED", False)
VPN_SERVER_HOST = os.getenv("VPN_SERVER_HOST", "proforin.online")
VPN_SERVER_PORT = int(os.getenv("VPN_SERVER_PORT", "8443"))
VPN_INBOUND_TAG = os.getenv("VPN_INBOUND_TAG", "vless-reality")
VPN_XRAY_API = os.getenv("VPN_XRAY_API", "127.0.0.1:10085")
VPN_XRAY_BIN = os.getenv("VPN_XRAY_BIN", "/usr/local/bin/xray")
VPN_REALITY_PUBLIC_KEY = os.getenv("VPN_REALITY_PUBLIC_KEY", "")
VPN_REALITY_SHORT_ID = os.getenv("VPN_REALITY_SHORT_ID", "")
VPN_REALITY_SNI = os.getenv("VPN_REALITY_SNI", "www.microsoft.com")
VPN_REALITY_FINGERPRINT = os.getenv("VPN_REALITY_FINGERPRINT", "chrome")
VPN_REALITY_SPIDER_X = os.getenv("VPN_REALITY_SPIDER_X", "/")
VPN_SYNC_INTERVAL_SECONDS = int(os.getenv("VPN_SYNC_INTERVAL_SECONDS", "60"))
VPN_DEFAULT_PACKAGE = os.getenv("VPN_DEFAULT_PACKAGE", "p1")
VPN_PACKAGES = {
    "p1": {
        "label": "без лимита + adblock",
        "tag": "vless-p1",
        "port": VPN_SERVER_PORT,
        "speed": "без ограничения",
        "adblock": True,
    },
    "p2": {
        "label": "50 Mbit, без adblock",
        "tag": "vless-p2",
        "port": int(os.getenv("VPN_P2_PORT", "8444")),
        "speed": "50 Mbit",
        "adblock": False,
    },
    "p3": {
        "label": "10 Mbit, без adblock",
        "tag": "vless-p3",
        "port": int(os.getenv("VPN_P3_PORT", "8445")),
        "speed": "10 Mbit",
        "adblock": False,
    },
}
VPN_PACKAGE_ALIASES = {
    "1": "p1",
    "max": "p1",
    "premium": "p1",
    "pro": "p1",
    "2": "p2",
    "mid": "p2",
    "standard": "p2",
    "std": "p2",
    "3": "p3",
    "slow": "p3",
    "basic": "p3",
    "eco": "p3",
}

TRUST_PROXY_HEADERS = env_bool("DJANGO_TRUST_PROXY_HEADERS", False)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = False

SECURE_SSL_REDIRECT = env_bool("DJANGO_SECURE_SSL_REDIRECT", not DEBUG)
SECURE_HSTS_SECONDS = int(os.getenv("DJANGO_HSTS_SECONDS", "31536000" if not DEBUG else "0"))
SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool("DJANGO_HSTS_INCLUDE_SUBDOMAINS", not DEBUG)
SECURE_HSTS_PRELOAD = env_bool("DJANGO_HSTS_PRELOAD", False)
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
SESSION_COOKIE_SECURE = env_bool("DJANGO_SESSION_COOKIE_SECURE", not DEBUG)
CSRF_COOKIE_SECURE = env_bool("DJANGO_CSRF_COOKIE_SECURE", not DEBUG)
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
X_FRAME_OPTIONS = "DENY"

DATA_UPLOAD_MAX_MEMORY_SIZE = 64 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 64 * 1024
DATA_UPLOAD_MAX_NUMBER_FIELDS = 30

LEAD_FORM_MIN_SECONDS = float(os.getenv("LEAD_FORM_MIN_SECONDS", "1.2"))
LEAD_FORM_MAX_AGE_SECONDS = int(os.getenv("LEAD_FORM_MAX_AGE_SECONDS", str(4 * 60 * 60)))
VISIT_TRACK_LIMIT = int(os.getenv("VISIT_TRACK_LIMIT", "30"))
VISIT_TRACK_WINDOW_SECONDS = int(os.getenv("VISIT_TRACK_WINDOW_SECONDS", "60"))
BOT_USER_AGENT_MARKERS = tuple(
    marker.strip().lower()
    for marker in os.getenv(
        "BOT_USER_AGENT_MARKERS",
        "bot,crawler,spider,scan,headless,python-requests,curl,wget,go-http-client,nikto,sqlmap",
    ).split(",")
    if marker.strip()
)

CONTENT_SECURITY_POLICY = os.getenv(
    "CONTENT_SECURITY_POLICY",
    "default-src 'self'; "
    "script-src 'self'; "
    "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; "
    "font-src 'self' https://fonts.gstatic.com; "
    "img-src 'self' data:; "
    "connect-src 'self'; "
    "frame-ancestors 'none'; "
    "base-uri 'self'; "
    "form-action 'self'; "
    "object-src 'none'; "
    "upgrade-insecure-requests",
)

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "kliko-runtime-cache",
    }
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "loggers": {
        "landing": {
            "handlers": ["console"],
            "level": os.getenv("DJANGO_LOG_LEVEL", "INFO"),
        },
    },
}
