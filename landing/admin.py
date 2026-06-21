from django.contrib import admin
from django.utils.html import format_html

from .models import Lead, TelegramAdmin, TrackedEvent, Visit, VpnClient


admin.site.site_header = 'Kliko: заявки и аналитика'
admin.site.site_title = 'Kliko admin'
admin.site.index_title = 'Управление сайтом'


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = (
        'created_at',
        'name',
        'phone_link',
        'company',
        'package',
        'status',
        'niche',
    )
    list_filter = ('status', 'package', 'created_at')
    search_fields = ('name', 'phone', 'company', 'niche', 'message')
    readonly_fields = ('created_at', 'updated_at', 'session_key', 'ip_address', 'user_agent')
    list_editable = ('status',)
    date_hierarchy = 'created_at'

    @admin.display(description='Телефон')
    def phone_link(self, obj):
        clean = ''.join(ch for ch in obj.phone if ch.isdigit() or ch == '+')
        return format_html('<a href="tel:{}">{}</a>', clean, obj.phone)


@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = ('started_at', 'path', 'device_type', 'ip_address', 'status_code')
    list_filter = ('device_type', 'status_code', 'started_at')
    search_fields = ('path', 'referrer', 'ip_address', 'session_key', 'user_agent')
    readonly_fields = ('started_at', 'path', 'referrer', 'session_key', 'ip_address', 'user_agent', 'device_type', 'status_code')
    date_hierarchy = 'started_at'

    def has_add_permission(self, request):
        return False


@admin.register(TrackedEvent)
class TrackedEventAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'event_type', 'label', 'path', 'duration_ms', 'ip_address')
    list_filter = ('event_type', 'created_at')
    search_fields = ('label', 'path', 'session_key', 'ip_address')
    readonly_fields = (
        'created_at',
        'event_type',
        'label',
        'path',
        'metadata',
        'duration_ms',
        'session_key',
        'ip_address',
        'user_agent',
    )
    date_hierarchy = 'created_at'

    def has_add_permission(self, request):
        return False


@admin.register(TelegramAdmin)
class TelegramAdminAdmin(admin.ModelAdmin):
    list_display = ('chat_id', 'username', 'first_name', 'is_active', 'is_owner', 'created_at')
    list_filter = ('is_active', 'is_owner', 'created_at')
    search_fields = ('chat_id', 'username', 'first_name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(VpnClient)
class VpnClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'package', 'email', 'is_active', 'expires_at', 'last_synced_at', 'created_at')
    list_filter = ('package', 'is_active', 'expires_at', 'created_at', 'last_synced_at')
    search_fields = ('name', 'email', 'uuid', 'note')
    readonly_fields = ('uuid', 'email', 'last_synced_at', 'created_at', 'updated_at')
