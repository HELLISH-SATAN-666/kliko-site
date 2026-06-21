import json
import logging
import socket
from contextlib import contextmanager
import urllib.error
import urllib.request

from django.conf import settings
from django.utils import timezone


logger = logging.getLogger(__name__)
_resolved_chat_id = ""


@contextmanager
def _telegram_network():
    if not settings.TELEGRAM_FORCE_IPV4:
        yield
        return

    original_getaddrinfo = socket.getaddrinfo

    def ipv4_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
        result = original_getaddrinfo(host, port, family, type, proto, flags)
        if host == "api.telegram.org":
            ipv4 = [item for item in result if item[0] == socket.AF_INET]
            return ipv4 or result
        return result

    socket.getaddrinfo = ipv4_getaddrinfo
    try:
        yield
    finally:
        socket.getaddrinfo = original_getaddrinfo


def _compact(value, limit=700):
    value = " ".join(str(value or "").split())
    if len(value) <= limit:
        return value
    return f"{value[:limit - 3]}..."


def _request(method, payload=None, timeout=None):
    if not settings.TELEGRAM_BOT_TOKEN:
        return None
    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/{method}"
    data = None
    headers = {}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(url, data=data, headers=headers, method="POST" if payload else "GET")
    with _telegram_network():
        with urllib.request.urlopen(request, timeout=timeout or settings.TELEGRAM_TIMEOUT_SECONDS) as response:
            return json.loads(response.read().decode("utf-8"))


def telegram_request(method, payload=None, timeout=None):
    return _request(method, payload, timeout=timeout)


def resolve_chat_id():
    global _resolved_chat_id
    if settings.TELEGRAM_CHAT_ID:
        return settings.TELEGRAM_CHAT_ID
    if _resolved_chat_id:
        return _resolved_chat_id

    username = settings.TELEGRAM_ADMIN_USERNAME.strip().lstrip("@").lower()
    if not username:
        return ""

    try:
        data = _request("getUpdates")
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        logger.warning("Telegram chat id resolve failed: %s", exc)
        return ""

    for update in reversed(data.get("result", [])):
        message = update.get("message") or update.get("edited_message") or {}
        sender = message.get("from") or {}
        chat = message.get("chat") or {}
        if sender.get("username", "").lower() == username and chat.get("id"):
            _resolved_chat_id = str(chat["id"])
            return _resolved_chat_id
    return ""


def build_lead_message(lead):
    created = timezone.localtime(lead.created_at).strftime("%d.%m.%Y %H:%M")
    lines = [
        "Новая заявка с proforin.online",
        f"ID: {lead.id}",
        f"Время: {created}",
        f"Имя: {_compact(lead.name, 120)}",
        f"Контакт: {_compact(lead.phone, 120)}",
        f"Пакет: {lead.get_package_display()}",
    ]
    if lead.source_path:
        lines.append(f"Страница: {_compact(lead.source_path, 180)}")
    if lead.message:
        lines.append("")
        lines.append("Задача:")
        lines.append(_compact(lead.message, 1200))
    return "\n".join(lines)


def send_lead_notification(lead):
    if not settings.TELEGRAM_NOTIFY_ENABLED or not settings.TELEGRAM_BOT_TOKEN:
        return False

    from .models import TelegramAdmin

    chat_ids = list(
        TelegramAdmin.objects.filter(is_active=True).values_list("chat_id", flat=True)
    )
    if not chat_ids:
        fallback = resolve_chat_id()
        if fallback:
            chat_ids = [fallback]
    if not chat_ids:
        logger.warning("Telegram notification skipped: chat id is not configured or resolved.")
        return False

    sent = False
    text = build_lead_message(lead)
    for chat_id in chat_ids:
        payload = {
            "chat_id": chat_id,
            "text": text,
            "disable_web_page_preview": True,
        }
        try:
            data = _request("sendMessage", payload)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            logger.warning("Telegram notification failed for lead %s: %s", lead.id, exc)
            continue
        sent = bool(data and data.get("ok")) or sent
    if not sent:
        logger.warning("Telegram notification rejected for lead %s.", lead.id)
    return sent
