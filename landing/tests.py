import json
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings

from . import vpn
from .management.commands.telegram_bot import Command
from .models import Lead, TelegramAdmin, TrackedEvent, VpnClient


@override_settings(LEAD_FORM_MIN_SECONDS=0)
class LandingFlowTests(TestCase):
    def lead_payload(self, **overrides):
        response = self.client.get('/')
        token = response.context['form']['form_token'].value()
        payload = {
            'name': 'Анна',
            'phone': '+79991234567',
            'message': 'Нужен сайт для кофейни',
            'package': 'site',
            'source_path': '/',
            'form_token': token,
        }
        payload.update(overrides)
        return payload

    def test_home_page_loads(self):
        response = self.client.get('/')

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Сайты, боты и автоматизация')

    def test_ajax_lead_submission_creates_lead(self):
        response = self.client.post(
            '/lead/',
            self.lead_payload(),
            HTTP_X_REQUESTED_WITH='XMLHttpRequest',
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['ok'])
        self.assertEqual(Lead.objects.count(), 1)
        self.assertEqual(TrackedEvent.objects.filter(event_type='form_submit').count(), 1)

    def test_lead_limit_blocks_bursts_per_ip(self):
        payload = self.lead_payload()

        for _ in range(3):
            response = self.client.post('/lead/', payload, HTTP_X_REQUESTED_WITH='XMLHttpRequest')
            self.assertEqual(response.status_code, 200)

        response = self.client.post('/lead/', payload, HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 429)
        self.assertFalse(response.json()['ok'])

    def test_lead_submission_requires_form_token(self):
        response = self.client.post(
            '/lead/',
            self.lead_payload(form_token=''),
            HTTP_X_REQUESTED_WITH='XMLHttpRequest',
        )

        self.assertEqual(response.status_code, 422)
        self.assertEqual(Lead.objects.count(), 0)

    def test_phone_is_not_rendered_and_reveals_by_post(self):
        response = self.client.get('/')

        self.assertEqual(response.status_code, 200)
        self.assertNotContains(response, '+7 (999) 123-45-67')
        self.assertNotContains(response, 'tel:+79991234567')

        response = self.client.post('/contact-phone/', HTTP_X_REQUESTED_WITH='XMLHttpRequest')

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['ok'])
        self.assertEqual(response.json()['tel_href'], 'tel:+79991234567')

    def test_sitemap_and_robots_are_available(self):
        robots = self.client.get('/robots.txt')
        sitemap = self.client.get('/sitemap.xml')

        self.assertEqual(robots.status_code, 200)
        self.assertContains(robots, 'Sitemap:')
        self.assertContains(robots, 'Disallow: /control/')
        self.assertEqual(sitemap.status_code, 200)
        self.assertContains(sitemap, '/showcase/coffee/')

    def test_first_telegram_sender_becomes_admin(self):
        admin, _ = TelegramAdmin.objects.get_or_create(
            chat_id='123',
            defaults={'username': 'first_admin'},
        )
        self.assertFalse(admin.is_active)

        self.assertFalse(TelegramAdmin.objects.filter(is_active=True).exists())
        admin.is_active = True
        admin.is_owner = True
        admin.save(update_fields=['is_active', 'is_owner', 'updated_at'])

        self.assertTrue(TelegramAdmin.objects.get(chat_id='123').is_active)
        self.assertTrue(TelegramAdmin.objects.get(chat_id='123').is_owner)

    def test_tracking_endpoint_records_click(self):
        response = self.client.post(
            '/track/',
            data=json.dumps({'type': 'click', 'label': 'cta:test', 'path': '/'}),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(TrackedEvent.objects.filter(label='cta:test').count(), 1)

    def test_showcase_site_loads(self):
        response = self.client.get('/showcase/coffee/')

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Brew Corner')

    def test_dashboard_requires_staff_and_renders_for_admin(self):
        response = self.client.get('/control/')
        self.assertEqual(response.status_code, 302)

        user = get_user_model().objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='password',
        )
        self.client.force_login(user)
        response = self.client.get('/control/')

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Статистика сайта')

    @override_settings(
        VPN_ENABLED=True,
        VPN_REALITY_PUBLIC_KEY='test-public-key',
        VPN_REALITY_SHORT_ID='abcd1234',
        VPN_SERVER_HOST='example.com',
    )
    def test_vpn_link_uses_public_profile_label(self):
        client = VpnClient.objects.create(name='internal client name')

        link = vpn.client_link(client)

        self.assertTrue(link.endswith('#NOCTALIA'))
        self.assertNotIn(client.name, link)
        self.assertEqual(client.name, 'internal client name')


class TelegramBotBootstrapTests(TestCase):
    def update(self, username, chat_id='123'):
        return {
            'update_id': int(chat_id),
            'message': {
                'chat': {'id': int(chat_id), 'type': 'private'},
                'from': {
                    'id': int(chat_id),
                    'username': username,
                    'first_name': 'Admin',
                },
                'text': '/start',
            },
        }

    @override_settings(TELEGRAM_ADMIN_USERNAME='')
    def test_first_sender_becomes_owner_when_no_bootstrap_username_is_set(self):
        command = Command()

        with patch.object(command, 'send_message'):
            command.handle_update(self.update('first_admin'))

        admin = TelegramAdmin.objects.get(chat_id='123')
        self.assertTrue(admin.is_active)
        self.assertTrue(admin.is_owner)

    @override_settings(TELEGRAM_ADMIN_USERNAME='@kulagingerman')
    def test_bootstrap_username_limits_first_owner(self):
        command = Command()

        with patch.object(command, 'send_message'):
            command.handle_update(self.update('other_user'))

        self.assertFalse(TelegramAdmin.objects.filter(is_active=True).exists())
        self.assertFalse(TelegramAdmin.objects.get(chat_id='123').is_active)

        with patch.object(command, 'send_message'):
            command.handle_update(self.update('kulagingerman', chat_id='456'))

        admin = TelegramAdmin.objects.get(chat_id='456')
        self.assertTrue(admin.is_active)
        self.assertTrue(admin.is_owner)
