import uuid

from django.db import models
from django.utils import timezone


class Lead(models.Model):
    class Package(models.TextChoices):
        SITE = 'site', 'Сайт за 5 дней'
        AUTOMATION = 'automation', 'Автоматизация продаж'
        SYSTEM = 'system', 'Система под ключ'
        BOT = 'bot', 'Бот или скрипт'
        CONSULT = 'consult', 'Нужна консультация'

    class Status(models.TextChoices):
        NEW = 'new', 'Новая'
        CONTACTED = 'contacted', 'Связались'
        QUALIFIED = 'qualified', 'Подходит'
        WON = 'won', 'Купил'
        LOST = 'lost', 'Не купил'

    name = models.CharField('Имя', max_length=120)
    phone = models.CharField('Телефон', max_length=60)
    company = models.CharField('Компания', max_length=160, blank=True)
    niche = models.CharField('Ниша', max_length=160, blank=True)
    package = models.CharField('Пакет', max_length=30, choices=Package.choices, default=Package.CONSULT)
    budget = models.CharField('Бюджет', max_length=80, blank=True)
    preferred_contact_time = models.CharField('Удобное время', max_length=120, blank=True)
    message = models.TextField('Задача', blank=True)
    source_path = models.CharField('Страница', max_length=255, blank=True)
    session_key = models.CharField('Сессия', max_length=80, blank=True, db_index=True)
    ip_address = models.GenericIPAddressField('IP', null=True, blank=True)
    user_agent = models.TextField('User-Agent', blank=True)
    status = models.CharField('Статус', max_length=30, choices=Status.choices, default=Status.NEW, db_index=True)
    admin_note = models.TextField('Заметка', blank=True)
    created_at = models.DateTimeField('Создана', default=timezone.now, db_index=True)
    updated_at = models.DateTimeField('Обновлена', auto_now=True)

    class Meta:
        verbose_name = 'заявка'
        verbose_name_plural = 'заявки'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} - {self.get_package_display()}'


class Visit(models.Model):
    path = models.CharField('Страница', max_length=255, db_index=True)
    referrer = models.TextField('Источник', blank=True)
    session_key = models.CharField('Сессия', max_length=80, blank=True, db_index=True)
    ip_address = models.GenericIPAddressField('IP', null=True, blank=True)
    user_agent = models.TextField('User-Agent', blank=True)
    device_type = models.CharField('Устройство', max_length=30, blank=True, db_index=True)
    status_code = models.PositiveSmallIntegerField('HTTP статус', default=200)
    started_at = models.DateTimeField('Время входа', default=timezone.now, db_index=True)

    class Meta:
        verbose_name = 'визит'
        verbose_name_plural = 'визиты'
        ordering = ['-started_at']

    def __str__(self):
        return f'{self.path} @ {self.started_at:%d.%m %H:%M}'


class TrackedEvent(models.Model):
    class EventType(models.TextChoices):
        CLICK = 'click', 'Клик'
        PACKAGE = 'package', 'Выбор пакета'
        FORM_OPEN = 'form_open', 'Открытие формы'
        FORM_SUBMIT = 'form_submit', 'Отправка формы'
        CALL = 'call', 'Клик по звонку'
        MESSENGER = 'messenger', 'Клик по мессенджеру'
        PAGE_TIMING = 'page_timing', 'Время на странице'

    event_type = models.CharField('Тип', max_length=30, choices=EventType.choices, db_index=True)
    label = models.CharField('Элемент', max_length=180, blank=True, db_index=True)
    path = models.CharField('Страница', max_length=255, blank=True, db_index=True)
    metadata = models.JSONField('Данные', default=dict, blank=True)
    duration_ms = models.PositiveIntegerField('Длительность, мс', null=True, blank=True)
    session_key = models.CharField('Сессия', max_length=80, blank=True, db_index=True)
    ip_address = models.GenericIPAddressField('IP', null=True, blank=True)
    user_agent = models.TextField('User-Agent', blank=True)
    created_at = models.DateTimeField('Создано', default=timezone.now, db_index=True)

    class Meta:
        verbose_name = 'событие'
        verbose_name_plural = 'события'
        ordering = ['-created_at']

    def __str__(self):
        label = f' - {self.label}' if self.label else ''
        return f'{self.get_event_type_display()}{label}'


class TelegramAdmin(models.Model):
    chat_id = models.CharField('Telegram chat ID', max_length=32, unique=True)
    username = models.CharField('Username', max_length=64, blank=True, db_index=True)
    first_name = models.CharField('Имя', max_length=120, blank=True)
    is_active = models.BooleanField('Активен', default=False, db_index=True)
    is_owner = models.BooleanField('Владелец', default=False)
    created_at = models.DateTimeField('Создан', default=timezone.now, db_index=True)
    updated_at = models.DateTimeField('Обновлен', auto_now=True)

    class Meta:
        verbose_name = 'Telegram админ'
        verbose_name_plural = 'Telegram админы'
        ordering = ['-is_owner', '-is_active', 'username', 'chat_id']

    def __str__(self):
        label = f'@{self.username}' if self.username else self.chat_id
        return f'{label} {"active" if self.is_active else "pending"}'


class VpnClient(models.Model):
    class Package(models.TextChoices):
        P1 = 'p1', 'P1: без лимита + adblock'
        P2 = 'p2', 'P2: 50 Mbit без adblock'
        P3 = 'p3', 'P3: 10 Mbit без adblock'

    name = models.CharField('Название', max_length=80, unique=True, db_index=True)
    uuid = models.UUIDField('UUID', default=uuid.uuid4, unique=True, editable=False)
    email = models.EmailField('Xray email', max_length=160, unique=True, blank=True)
    package = models.CharField('Пакет', max_length=20, choices=Package.choices, default=Package.P1, db_index=True)
    is_active = models.BooleanField('Активен', default=True, db_index=True)
    expires_at = models.DateTimeField('Активен до', null=True, blank=True, db_index=True)
    note = models.TextField('Заметка', blank=True)
    last_synced_at = models.DateTimeField('Последняя синхронизация', null=True, blank=True)
    created_at = models.DateTimeField('Создан', default=timezone.now, db_index=True)
    updated_at = models.DateTimeField('Обновлен', auto_now=True)

    class Meta:
        verbose_name = 'VPN клиент'
        verbose_name_plural = 'VPN клиенты'
        ordering = ['-is_active', 'name']

    def save(self, *args, **kwargs):
        if not self.email:
            self.email = f'vpn-{self.uuid.hex[:12]}@kliko.local'
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.name} {"active" if self.is_active else "disabled"}'
