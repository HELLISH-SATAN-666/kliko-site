import logging
import re
import time
import urllib.error
from uuid import UUID

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from landing import vpn
from landing.models import TelegramAdmin, VpnClient
from landing.telegram import telegram_request


logger = logging.getLogger(__name__)


def user_label(user):
    username = user.get("username") or ""
    if username:
        return f"@{username}"
    return str(user.get("id") or "")


def timezone_label():
    return time.strftime("%Y%m%d-%H%M%S")


def configured_admin_username():
    return settings.TELEGRAM_ADMIN_USERNAME.strip().lstrip("@").lower()


def format_time(value):
    if not value:
        return "без срока"
    return timezone.localtime(value).strftime("%d.%m.%Y %H:%M")


class Command(BaseCommand):
    help = "Run the Kliko Telegram bot long polling worker."

    def add_arguments(self, parser):
        parser.add_argument("--once", action="store_true", help="Process pending updates and exit.")

    def handle(self, *args, **options):
        if not settings.TELEGRAM_BOT_TOKEN:
            raise CommandError("TELEGRAM_BOT_TOKEN is not configured.")

        self.offset = None
        self.last_vpn_sync = 0
        self.configure_bot()
        self.sync_vpn_if_needed(force=True)
        self.stdout.write(self.style.SUCCESS("Telegram bot worker started."))

        while True:
            try:
                self.sync_vpn_if_needed()
                updates = self.get_updates()
                for update in updates:
                    self.offset = max(self.offset or 0, update["update_id"] + 1)
                    self.handle_update(update)
            except KeyboardInterrupt:
                raise
            except Exception as exc:
                logger.exception("Telegram bot loop failed: %s", exc)
                time.sleep(5)

            if options["once"]:
                return

    def configure_bot(self):
        telegram_request("deleteWebhook", {"drop_pending_updates": False})
        telegram_request("setMyCommands", {
            "commands": [
                {"command": "start", "description": "Подключить этот аккаунт"},
                {"command": "admins", "description": "Показать админов"},
                {"command": "addadmin", "description": "Назначить админа"},
                {"command": "deladmin", "description": "Отключить админа"},
                {"command": "vpn", "description": "VPN команды"},
                {"command": "vpn_add", "description": "Создать VPN конфиг"},
                {"command": "vpn_del", "description": "Отключить VPN конфиг"},
                {"command": "vpn_list", "description": "Список VPN конфигов"},
                {"command": "vpn_stats", "description": "Трафик VPN"},
                {"command": "vpn_status", "description": "Статус VPN"},
                {"command": "id", "description": "Показать chat_id"},
            ],
        })

    def get_updates(self):
        payload = {
            "timeout": 25,
            "allowed_updates": ["message"],
        }
        if self.offset is not None:
            payload["offset"] = self.offset
        try:
            data = telegram_request("getUpdates", payload, timeout=35)
        except urllib.error.HTTPError as exc:
            if exc.code == 409:
                logger.error("Telegram getUpdates conflict: remove webhook or stop another bot worker.")
            raise
        if not data or not data.get("ok"):
            logger.warning("Telegram getUpdates returned a non-ok response.")
            return []
        return data.get("result", [])

    def handle_update(self, update):
        message = update.get("message") or {}
        chat = message.get("chat") or {}
        sender = message.get("from") or {}
        if chat.get("type") != "private" or not sender.get("id"):
            return

        admin, _ = self.remember_user(sender, active=False)
        if not TelegramAdmin.objects.filter(is_active=True).exists():
            allowed_username = configured_admin_username()
            sender_username = (sender.get("username") or "").lower()
            if allowed_username and sender_username != allowed_username:
                self.send_message(
                    chat["id"],
                    "Бот подключен, но доступ администратора не выдан. "
                    "Первым главным админом может стать только владелец, указанный в настройках сайта.",
                )
                return
            admin.is_active = True
            admin.is_owner = True
            admin.save(update_fields=["is_active", "is_owner", "updated_at"])
            self.send_message(
                chat["id"],
                "Вы первый написали боту, поэтому стали главным админом. "
                "Заявки с сайта будут приходить сюда.\n\n"
                "Команды: /admins, /addadmin, /deladmin, /id.",
            )
            return

        text = (message.get("text") or "").strip()
        if not admin.is_active:
            self.send_message(
                chat["id"],
                "Бот подключен. Доступ админа пока не выдан. "
                "Активный админ может назначить вас командой /addadmin "
                f"{user_label(sender)} или ответом /addadmin на ваше сообщение.",
            )
            return

        if not text or not text.startswith("/"):
            self.send_message(chat["id"], self.help_text())
            return

        command, _, argument = text.partition(" ")
        command = command.split("@", 1)[0].lower()
        argument = argument.strip()

        if command == "/start":
            self.send_message(chat["id"], self.help_text(prefix="Вы админ. Заявки с сайта будут приходить сюда."))
        elif command == "/id":
            self.send_message(chat["id"], f"Ваш chat_id: {chat['id']}")
        elif command == "/admins":
            self.send_message(chat["id"], self.format_admins())
        elif command in {"/addadmin", "/admin_add", "/админ"}:
            self.add_admin(chat["id"], message, argument)
        elif command in {"/deladmin", "/removeadmin", "/admin_del"}:
            self.remove_admin(chat["id"], admin, argument)
        elif command in {"/vpn", "/vpn_help", "/vpnhelp"}:
            self.send_message(chat["id"], self.vpn_help())
        elif command in {"/vpn_add", "/vpnadd", "/addvpn"}:
            self.vpn_add(chat["id"], argument)
        elif command in {"/vpn_del", "/vpndel", "/delvpn", "/vpn_remove"}:
            self.vpn_remove(chat["id"], argument)
        elif command in {"/vpn_list", "/vpnlist"}:
            self.vpn_list(chat["id"])
        elif command in {"/vpn_config", "/vpnconf", "/vpn_link"}:
            self.vpn_config(chat["id"], argument)
        elif command in {"/vpn_stats", "/vpnstat"}:
            self.vpn_stats(chat["id"], argument)
        elif command in {"/vpn_sync", "/vpnsync"}:
            self.vpn_sync(chat["id"])
        elif command in {"/vpn_status", "/vpnstatus"}:
            self.vpn_status(chat["id"])
        elif command in {"/vpn_reset", "/vpnreset"}:
            self.vpn_reset(chat["id"], argument)
        else:
            self.send_message(chat["id"], self.help_text(prefix="Не знаю такую команду."))

    def remember_user(self, user, active):
        chat_id = str(user["id"])
        defaults = {
            "username": user.get("username") or "",
            "first_name": user.get("first_name") or "",
        }
        admin, created = TelegramAdmin.objects.get_or_create(chat_id=chat_id, defaults={**defaults, "is_active": active})
        changed = []
        for field, value in defaults.items():
            if getattr(admin, field) != value:
                setattr(admin, field, value)
                changed.append(field)
        if changed:
            changed.append("updated_at")
            admin.save(update_fields=changed)
        return admin, created

    def add_admin(self, chat_id, message, argument):
        target_user = (message.get("reply_to_message") or {}).get("from")
        if target_user and target_user.get("id"):
            target, _ = self.remember_user(target_user, active=True)
        else:
            target = self.find_admin(argument)
            if target is None:
                self.send_message(
                    chat_id,
                    "Кого назначить? Лучше ответьте командой /addadmin на сообщение человека, "
                    "или укажите @username/chat_id после команды.",
                )
                return

        target.is_active = True
        target.save(update_fields=["is_active", "updated_at"])
        self.send_message(chat_id, f"Админ добавлен: {target}")
        self.send_message(target.chat_id, "Вам выдан доступ админа к заявкам сайта.")

    def remove_admin(self, chat_id, current_admin, argument):
        target = self.find_admin(argument)
        if target is None:
            self.send_message(chat_id, "Кого удалить? Укажите @username или chat_id после /deladmin.")
            return
        if target.is_owner and TelegramAdmin.objects.filter(is_owner=True, is_active=True).count() <= 1:
            self.send_message(chat_id, "Нельзя удалить последнего главного админа.")
            return
        if target.pk == current_admin.pk and TelegramAdmin.objects.filter(is_active=True).count() <= 1:
            self.send_message(chat_id, "Нельзя удалить последнего активного админа.")
            return
        target.is_active = False
        target.is_owner = False
        target.save(update_fields=["is_active", "is_owner", "updated_at"])
        self.send_message(chat_id, f"Админ отключен: {target}")

    def find_admin(self, value):
        value = (value or "").strip()
        if not value:
            return None
        if value.startswith("@"):
            return TelegramAdmin.objects.filter(username__iexact=value[1:]).first()
        return TelegramAdmin.objects.filter(chat_id=value).first()

    def format_admins(self):
        admins = TelegramAdmin.objects.all()[:50]
        if not admins:
            return "Админов пока нет."
        lines = ["Админы и кандидаты:"]
        for admin in admins:
            status = "active" if admin.is_active else "pending"
            owner = ", owner" if admin.is_owner else ""
            lines.append(f"- {admin} ({status}{owner})")
        return "\n".join(lines)

    def help_text(self, prefix="Я на связи."):
        return (
            f"{prefix}\n\n"
            "Админы: /admins, /addadmin, /deladmin, /id\n"
            "VPN: /vpn, /vpn_add, /vpn_del, /vpn_list, /vpn_config, /vpn_stats, /vpn_status"
        )

    def vpn_help(self):
        status = "включен" if vpn.enabled() else "не настроен"
        return (
            f"VPN статус: {status}\n"
            f"Сервер: {settings.VPN_SERVER_HOST}\n\n"
            "Пакеты:\n"
            f"{vpn.package_choices_text()}\n\n"
            "Команды:\n"
            "/vpn_add имя [p1|p2|p3] [30d] - создать конфиг\n"
            "/vpn_del имя - отключить конфиг\n"
            "/vpn_list - список конфигов\n"
            "/vpn_config имя - показать ссылку для Amnezia\n"
            "/vpn_reset имя - перевыпустить конфиг\n"
            "/vpn_stats [имя] - трафик и онлайн\n"
            "/vpn_status - сервисы и число клиентов\n"
            "/vpn_sync - синхронизировать активные конфиги с Xray"
        )

    def parse_vpn_add_args(self, argument):
        tokens = (argument or "").split()
        package = settings.VPN_DEFAULT_PACKAGE
        expires_at = None
        name_parts = []

        for token in tokens:
            lowered = token.lower()
            package_candidate = settings.VPN_PACKAGE_ALIASES.get(lowered, lowered)
            if package_candidate in settings.VPN_PACKAGES:
                package = package_candidate
                continue
            duration = self.parse_duration(lowered)
            if duration:
                expires_at = timezone.now() + duration
                continue
            name_parts.append(token)

        return {
            "name": " ".join(name_parts).strip() or f"user-{timezone_label()}",
            "package": package,
            "expires_at": expires_at,
        }

    def parse_duration(self, value):
        match = re.fullmatch(r"(\d+)([dhwmy])", value or "")
        if not match:
            return None
        amount = int(match.group(1))
        unit = match.group(2)
        seconds = {
            "d": 86400,
            "h": 3600,
            "w": 7 * 86400,
            "m": 30 * 86400,
            "y": 365 * 86400,
        }[unit]
        return timezone.timedelta(seconds=amount * seconds)

    def find_vpn_client(self, value):
        value = (value or "").strip()
        if not value:
            return None
        client = VpnClient.objects.filter(name__iexact=value).first()
        if client:
            return client
        client = VpnClient.objects.filter(email__iexact=value).first()
        if client:
            return client
        try:
            UUID(value)
        except (TypeError, ValueError):
            return None
        return VpnClient.objects.filter(uuid=value).first()

    def vpn_add(self, chat_id, argument):
        if not vpn.enabled():
            self.send_message(chat_id, "VPN на сервере пока не настроен.")
            return
        parsed = self.parse_vpn_add_args(argument)
        name = parsed["name"]
        if len(name) > 80:
            self.send_message(chat_id, "Название слишком длинное, максимум 80 символов.")
            return
        client, created = VpnClient.objects.get_or_create(
            name=name,
            defaults={
                "is_active": True,
                "package": parsed["package"],
                "expires_at": parsed["expires_at"],
            },
        )
        previous_package = client.package
        previous_expires_at = client.expires_at
        if not created:
            client.package = parsed["package"]
            client.expires_at = parsed["expires_at"]
        if (
            not created
            and client.is_active
            and previous_package == client.package
            and previous_expires_at == client.expires_at
        ):
            self.send_message(
                chat_id,
                f"Такой конфиг уже есть: {client.name}\n"
                f"Пакет: {client.package}, срок: {format_time(client.expires_at)}\n\n"
                f"{vpn.client_link(client)}",
            )
            return
        client.is_active = True
        client.save(update_fields=["package", "expires_at", "is_active", "updated_at"])
        try:
            if previous_package != client.package:
                vpn.remove_runtime_user(client, ignore_missing=True)
            action = vpn.add_runtime_user(client)
            link = vpn.client_link(client)
        except vpn.VpnError as exc:
            self.send_message(chat_id, f"Конфиг сохранен, но Xray не принял его: {exc}")
            return
        verb = "Создан" if created else "Включен заново"
        package = vpn.package_config(client.package)
        self.send_message(
            chat_id,
            f"{verb} VPN конфиг: {client.name}\n"
            f"Пакет: {client.package} - {package['label']}\n"
            f"Срок: {format_time(client.expires_at)}\n"
            f"Xray: {action}\n\n{link}",
        )

    def vpn_remove(self, chat_id, argument):
        client = self.find_vpn_client(argument)
        if not client:
            self.send_message(chat_id, "Кого отключить? Укажите имя, email или UUID после /vpn_del.")
            return
        client.is_active = False
        client.save(update_fields=["is_active", "updated_at"])
        try:
            vpn.remove_runtime_user(client, ignore_missing=True)
        except vpn.VpnError as exc:
            self.send_message(chat_id, f"Конфиг отключен в базе, но Xray ответил ошибкой: {exc}")
            return
        self.send_message(chat_id, f"VPN конфиг отключен: {client.name}")

    def vpn_list(self, chat_id):
        clients = VpnClient.objects.all()[:30]
        if not clients:
            self.send_message(chat_id, "VPN конфигов пока нет. Создать: /vpn_add имя")
            return
        lines = ["VPN конфиги:"]
        for client in clients:
            status = "active" if client.is_active else "off"
            if vpn.is_expired(client):
                status = "expired"
            lines.append(f"- {client.name}: {client.package}, {status}, до {format_time(client.expires_at)}")
        self.send_message(chat_id, "\n".join(lines))

    def vpn_config(self, chat_id, argument):
        client = self.find_vpn_client(argument)
        if not client:
            self.send_message(chat_id, "Какой конфиг показать? Укажите имя после /vpn_config.")
            return
        if not client.is_active:
            self.send_message(chat_id, f"Конфиг {client.name} отключен. Включить заново: /vpn_add {client.name}")
            return
        try:
            vpn.add_runtime_user(client)
            link = vpn.client_link(client)
        except vpn.VpnError as exc:
            self.send_message(chat_id, f"Не могу собрать конфиг: {exc}")
            return
        package = vpn.package_config(client.package)
        self.send_message(
            chat_id,
            f"Конфиг для Amnezia: {client.name}\n"
            f"Пакет: {client.package} - {package['label']}\n"
            f"Срок: {format_time(client.expires_at)}\n\n{link}",
        )

    def vpn_stats(self, chat_id, argument):
        if argument.strip():
            client = self.find_vpn_client(argument)
            if not client:
                self.send_message(chat_id, "Не нашел такой VPN конфиг.")
                return
            try:
                traffic = vpn.client_traffic(client)
            except vpn.VpnError as exc:
                self.send_message(chat_id, f"Не могу получить статистику: {exc}")
                return
            self.send_message(
                chat_id,
                "\n".join([
                    f"VPN трафик: {client.name}",
                    f"Пакет: {client.package}",
                    f"Срок: {format_time(client.expires_at)}",
                    f"Вверх: {vpn.format_bytes(traffic.uplink)}",
                    f"Вниз: {vpn.format_bytes(traffic.downlink)}",
                    f"Всего: {vpn.format_bytes(traffic.total)}",
                    f"Онлайн-сессии: {traffic.online}",
                ]),
            )
            return

        clients = list(VpnClient.objects.filter(is_active=True)[:20])
        if not clients:
            self.send_message(chat_id, "Активных VPN конфигов пока нет.")
            return
        lines = ["VPN трафик:"]
        total = 0
        for client in clients:
            try:
                traffic = vpn.client_traffic(client)
            except vpn.VpnError:
                traffic = vpn.Traffic()
            total += traffic.total
            lines.append(
                f"- {client.name}: {vpn.format_bytes(traffic.total)} "
                f"({client.package}, up {vpn.format_bytes(traffic.uplink)}, down {vpn.format_bytes(traffic.downlink)}, online {traffic.online})"
            )
        lines.append(f"Итого: {vpn.format_bytes(total)}")
        self.send_message(chat_id, "\n".join(lines))

    def vpn_sync(self, chat_id):
        try:
            result = vpn.sync_active_clients()
        except vpn.VpnError as exc:
            self.send_message(chat_id, f"Синхронизация не прошла: {exc}")
            return
        self.last_vpn_sync = time.time()
        self.send_message(chat_id, f"Синхронизация VPN: active {result['synced']}, expired {result['expired']}")

    def vpn_status(self, chat_id):
        statuses = vpn.service_status()
        active = VpnClient.objects.filter(is_active=True).count()
        expired = VpnClient.objects.filter(is_active=True, expires_at__isnull=False, expires_at__lte=timezone.now()).count()
        lines = [
            "VPN status:",
            f"xray: {statuses.get('xray')}",
            f"bot: {statuses.get('proforin-bot')}",
            f"site: {statuses.get('proforin')}",
            f"active clients: {active}",
            f"expired pending disable: {expired}",
        ]
        self.send_message(chat_id, "\n".join(lines))

    def vpn_reset(self, chat_id, argument):
        import uuid

        client = self.find_vpn_client(argument)
        if not client:
            self.send_message(chat_id, "Какой конфиг перевыпустить? Укажите имя после /vpn_reset.")
            return
        try:
            vpn.remove_runtime_user(client, ignore_missing=True)
            client.uuid = uuid.uuid4()
            client.email = f"vpn-{client.uuid.hex[:12]}@kliko.local"
            client.is_active = True
            client.save(update_fields=["uuid", "email", "is_active", "updated_at"])
            vpn.add_runtime_user(client)
            link = vpn.client_link(client)
        except vpn.VpnError as exc:
            self.send_message(chat_id, f"Не получилось перевыпустить конфиг: {exc}")
            return
        self.send_message(chat_id, f"Конфиг перевыпущен: {client.name}\n\n{link}")

    def sync_vpn_if_needed(self, force=False):
        if not vpn.enabled():
            return
        now = time.time()
        if not force and now - self.last_vpn_sync < settings.VPN_SYNC_INTERVAL_SECONDS:
            return
        try:
            vpn.sync_active_clients()
            self.last_vpn_sync = now
        except Exception as exc:
            logger.warning("VPN sync failed: %s", exc)

    def send_message(self, chat_id, text):
        payload = {
            "chat_id": chat_id,
            "text": text,
            "disable_web_page_preview": True,
        }
        try:
            telegram_request("sendMessage", payload)
        except Exception as exc:
            logger.warning("Failed to send Telegram message to %s: %s", chat_id, exc)
