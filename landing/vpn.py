import json
import os
import subprocess
import tempfile
from dataclasses import dataclass
from urllib.parse import quote

from django.conf import settings
from django.utils import timezone


class VpnError(RuntimeError):
    pass


PUBLIC_PROFILE_LABEL = "NOCTALIA"


@dataclass
class Traffic:
    uplink: int = 0
    downlink: int = 0
    online: int = 0

    @property
    def total(self):
        return self.uplink + self.downlink


def normalize_package(value):
    value = (value or settings.VPN_DEFAULT_PACKAGE).strip().lower()
    value = settings.VPN_PACKAGE_ALIASES.get(value, value)
    if value not in settings.VPN_PACKAGES:
        raise VpnError(f"Неизвестный VPN пакет: {value}")
    return value


def package_config(value):
    return settings.VPN_PACKAGES[normalize_package(value)]


def package_choices_text():
    lines = []
    for code, config in settings.VPN_PACKAGES.items():
        adblock = "adblock" if config.get("adblock") else "без adblock"
        lines.append(f"{code}: {config['label']} ({config['speed']}, порт {config['port']}, {adblock})")
    return "\n".join(lines)


def is_expired(client):
    return bool(client.expires_at and client.expires_at <= timezone.now())


def enabled():
    return (
        settings.VPN_ENABLED
        and bool(settings.VPN_REALITY_PUBLIC_KEY)
        and bool(settings.VPN_REALITY_SHORT_ID)
    )


def format_bytes(value):
    value = int(value or 0)
    units = ("B", "KB", "MB", "GB", "TB")
    size = float(value)
    for unit in units:
        if size < 1024 or unit == units[-1]:
            if unit == "B":
                return f"{int(size)} {unit}"
            return f"{size:.2f} {unit}"
        size /= 1024
    return f"{value} B"


def client_link(client):
    if not enabled():
        raise VpnError("VPN еще не настроен на сервере.")

    label = quote(PUBLIC_PROFILE_LABEL)
    config = package_config(client.package)
    params = {
        "encryption": "none",
        "flow": "xtls-rprx-vision",
        "security": "reality",
        "sni": settings.VPN_REALITY_SNI,
        "fp": settings.VPN_REALITY_FINGERPRINT,
        "pbk": settings.VPN_REALITY_PUBLIC_KEY,
        "sid": settings.VPN_REALITY_SHORT_ID,
        "spx": settings.VPN_REALITY_SPIDER_X or "/",
        "type": "tcp",
        "headerType": "none",
    }
    query = "&".join(f"{key}={quote(str(value), safe='')}" for key, value in params.items())
    return f"vless://{client.uuid}@{settings.VPN_SERVER_HOST}:{config['port']}?{query}#{label}"


def hiddify_link(client):
    return client_link(client)


def run_xray_api(args, timeout=8):
    if not enabled():
        raise VpnError("VPN выключен или не настроен.")
    if not os.path.exists(settings.VPN_XRAY_BIN):
        raise VpnError("Xray binary не найден на сервере.")

    command = [
        settings.VPN_XRAY_BIN,
        "api",
        args[0],
        f"--server={settings.VPN_XRAY_API}",
        "-timeout",
        str(timeout),
        *args[1:],
    ]
    result = subprocess.run(command, capture_output=True, text=True, timeout=timeout + 2, check=False)
    output = (result.stdout or "").strip()
    error = (result.stderr or "").strip()
    if result.returncode != 0:
        detail = error or output or f"код {result.returncode}"
        raise VpnError(f"Xray API error: {detail}")
    return output


def _user_config(client):
    config = package_config(client.package)
    return {
        "inbounds": [
            {
                "tag": config["tag"],
                "listen": "0.0.0.0",
                "port": config["port"],
                "protocol": "vless",
                "settings": {
                    "clients": [
                        {
                            "id": str(client.uuid),
                            "email": client.email,
                            "flow": "xtls-rprx-vision",
                            "level": 0,
                        }
                    ],
                    "decryption": "none",
                },
            }
        ]
    }


def _run_with_temp_config(command, payload):
    handle = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8")
    try:
        with handle:
            json.dump(payload, handle, ensure_ascii=False)
        return run_xray_api([command, handle.name])
    finally:
        try:
            os.unlink(handle.name)
        except OSError:
            pass


def runtime_user_exists(client):
    config = package_config(client.package)
    output = run_xray_api([
        "inbounduser",
        f"-tag={config['tag']}",
        f"-email={client.email}",
    ])
    try:
        data = json.loads(output or "{}")
    except json.JSONDecodeError:
        return client.email in output
    for user in data.get("users", []):
        if user.get("email") == client.email:
            return True
    return False


def add_runtime_user(client):
    if is_expired(client):
        client.is_active = False
        client.save(update_fields=["is_active", "updated_at"])
        remove_runtime_user(client, ignore_missing=True)
        return "expired"
    if runtime_user_exists(client):
        return "exists"
    _run_with_temp_config("adu", _user_config(client))
    client.last_synced_at = timezone.now()
    client.save(update_fields=["last_synced_at", "updated_at"])
    return "added"


def remove_runtime_user(client, ignore_missing=False, tags=None):
    tags = tags or [config["tag"] for config in settings.VPN_PACKAGES.values()]
    output = ""
    for tag in tags:
        try:
            output = run_xray_api(["rmu", f"-tag={tag}", client.email])
        except VpnError as exc:
            if ignore_missing or "not found" in str(exc).lower():
                continue
            raise
    client.last_synced_at = timezone.now()
    client.save(update_fields=["last_synced_at", "updated_at"])
    return output


def sync_active_clients():
    from .models import VpnClient

    synced = 0
    expired = 0
    for client in VpnClient.objects.filter(is_active=True, expires_at__isnull=False, expires_at__lte=timezone.now()):
        client.is_active = False
        client.save(update_fields=["is_active", "updated_at"])
        remove_runtime_user(client, ignore_missing=True)
        expired += 1
    for client in VpnClient.objects.filter(is_active=True):
        add_runtime_user(client)
        synced += 1
    return {"synced": synced, "expired": expired}


def query_stats(pattern="", reset=False):
    args = ["statsquery"]
    if pattern:
        args.append(f"-pattern={pattern}")
    if reset:
        args.append("-reset")
    output = run_xray_api(args)
    try:
        data = json.loads(output or "{}")
    except json.JSONDecodeError as exc:
        raise VpnError(f"Не удалось разобрать статистику Xray: {exc}") from exc
    return data.get("stat", [])


def online_count(client):
    output = run_xray_api(["statsonline", f"-email={client.email}"], timeout=5)
    try:
        data = json.loads(output or "{}")
    except json.JSONDecodeError:
        return 0
    return int(data.get("count") or data.get("value") or 0)


def client_traffic(client):
    stats = query_stats(f"user>>>{client.email}>>>traffic>>>")
    traffic = Traffic()
    for item in stats:
        name = item.get("name", "")
        value = int(item.get("value") or 0)
        if name.endswith(">>>uplink"):
            traffic.uplink = value
        elif name.endswith(">>>downlink"):
            traffic.downlink = value
    try:
        traffic.online = online_count(client)
    except VpnError:
        traffic.online = 0
    return traffic


def service_status():
    checks = {}
    for name in ("xray", "proforin-bot", "proforin"):
        result = subprocess.run(
            ["systemctl", "is-active", name],
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )
        checks[name] = (result.stdout or result.stderr or "").strip() or f"code {result.returncode}"
    return checks
