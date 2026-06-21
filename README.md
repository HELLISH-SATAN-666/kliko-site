# Kliko Site

Professional Django landing site for selling websites, bots, scripts, and automation services to small businesses.

## What Is Inside

- Responsive landing page for Kliko services.
- Lead form with validation, anti-spam checks, and Django admin storage.
- Click, CTA, phone, messenger, and page timing tracking.
- Admin dashboard at `/control/` for visits, leads, conversion, and recent activity.
- Showcase pages for ready-made site concepts.
- Optional Telegram lead notifications and Telegram admin bot.
- Optional VPN client management module.
- Production-oriented security headers, rate limits, and deployment configs.

## Repository Layout

```text
config/                  Django project settings and URLs
landing/                 Main application, templates, static assets, models
deploy/                  systemd, nginx, and fail2ban examples
examples/                Git submodules with external example projects
requirements.txt         Python dependencies
.env.example             Environment variable template
```

## Linked Example Projects

The repository is connected to two external example projects as Git submodules:

- `examples/primeri` -> `https://github.com/plague40404/primeri`
- `examples/primeri-2.0` -> `https://github.com/plague40404/primeri-2.0`

Use them as source references for future showcase pages. They are linked instead of copied so their history and updates stay separate from the main Kliko site.

Clone with examples:

```powershell
git clone --recurse-submodules https://github.com/HELLISH-SATAN-666/kliko-site.git
```

If you already cloned the repository:

```powershell
git submodule update --init --recursive
```

## Local Development

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py createsuperuser
.\.venv\Scripts\python.exe manage.py runserver
```

Open:

- Site: `http://127.0.0.1:8000/`
- Django admin: `http://127.0.0.1:8000/admin/`
- Dashboard: `http://127.0.0.1:8000/control/`

## Production Settings

Configure secrets and host-specific values through environment variables:

```powershell
$env:DJANGO_SECRET_KEY="change-this"
$env:DJANGO_DEBUG="0"
$env:DJANGO_ALLOWED_HOSTS="proforin.online,www.proforin.online,proforin.ru,www.proforin.ru"
$env:DJANGO_CSRF_TRUSTED_ORIGINS="http://proforin.online,http://www.proforin.online,http://proforin.ru,http://www.proforin.ru,https://proforin.online,https://www.proforin.online,https://proforin.ru,https://www.proforin.ru"
$env:DJANGO_SECURE_SSL_REDIRECT="0"
$env:DJANGO_SESSION_COOKIE_SECURE="0"
$env:DJANGO_CSRF_COOKIE_SECURE="0"
$env:DJANGO_HSTS_SECONDS="0"
$env:DJANGO_CSP_UPGRADE_INSECURE_REQUESTS="0"
$env:DJANGO_DB_PATH="/srv/kliko-site/shared/db.sqlite3"
$env:CONTACT_PHONE_DISPLAY="+7 913 898 93 55"
$env:CONTACT_PHONE_TEL="+79138989355"
$env:TELEGRAM_URL="https://t.me/kulagingerman"
$env:WHATSAPP_URL="https://vk.com/username"
$env:EXAMPLE_PRIMERI_URL="/examples/primeri/"
$env:EXAMPLE_PRIMERI_2_URL="/examples/primeri-2/"
$env:TELEGRAM_NOTIFY_ENABLED="1"
$env:TELEGRAM_BOT_TOKEN="change-this"
$env:TELEGRAM_ADMIN_USERNAME="@kulagingerman"
```

The current VPS deployment keeps the existing VPN on port 443, so the Django site is served on HTTP port 80. To make the domains resolve to this server, point `proforin.online`, `www.proforin.online`, `proforin.ru`, and `www.proforin.ru` to the VPS IPv4 address. Remove unrelated AAAA records unless the VPS has a routed public IPv6 address.

The linked examples are served under the same domains:

- `/examples/primeri/`
- `/examples/primeri-2/`

For Telegram notifications, start a private chat with the configured bot and send `/start`. If `TELEGRAM_ADMIN_USERNAME` is set, only that username can become the first owner/admin.

Before deployment:

```powershell
.\.venv\Scripts\python.exe manage.py check --deploy
.\.venv\Scripts\python.exe manage.py collectstatic
```

## What Must Not Be Committed

The repository intentionally excludes local runtime data:

- `.venv/`
- `.env`
- `db.sqlite3`
- `staticfiles/`
- `*.log`
- `PRIVAT.txt`
- `__pycache__/`

Keep real tokens, chat IDs, production database files, and private notes outside GitHub.
