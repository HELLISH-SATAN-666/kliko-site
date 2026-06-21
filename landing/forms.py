import time

from django import forms
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core import signing

from .models import Lead


CONTACT_USERNAME_RE = r'^@[A-Za-z0-9_]{5,32}$'
URL_MARKERS = ('http://', 'https://', 'www.', '.ru/', '.com/', '.online/')


def has_url(value):
    lowered = (value or '').lower()
    return any(marker in lowered for marker in URL_MARKERS)


class LeadForm(forms.ModelForm):
    website = forms.CharField(required=False, widget=forms.HiddenInput)
    form_token = forms.CharField(required=False, widget=forms.HiddenInput)

    token_salt = 'landing.lead-form'

    class Meta:
        model = Lead
        fields = ['name', 'phone', 'message', 'package', 'source_path']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.is_bound:
            self.initial.setdefault('form_token', self.make_form_token())

    def make_form_token(self):
        return signing.dumps({'ts': time.time()}, salt=self.token_salt)

    def clean(self):
        cleaned = super().clean()
        if self.cleaned_data.get('website'):
            raise ValidationError('Не удалось принять заявку. Обновите страницу и попробуйте еще раз.')
        token = cleaned.get('form_token')
        try:
            payload = signing.loads(token, salt=self.token_salt, max_age=settings.LEAD_FORM_MAX_AGE_SECONDS)
            age = time.time() - float(payload.get('ts', 0))
        except (TypeError, ValueError, signing.BadSignature, signing.SignatureExpired):
            raise ValidationError('Не удалось принять заявку. Обновите страницу и попробуйте еще раз.')
        if age < settings.LEAD_FORM_MIN_SECONDS:
            raise ValidationError('Не удалось принять заявку. Обновите страницу и попробуйте еще раз.')
        return cleaned

    def clean_name(self):
        name = ' '.join(self.cleaned_data['name'].split())[:120]
        if len(name) < 2:
            raise forms.ValidationError('Укажите имя.')
        if has_url(name):
            raise forms.ValidationError('Укажите имя без ссылок.')
        return name

    def clean_phone(self):
        phone = ' '.join(self.cleaned_data['phone'].split())[:60]
        if has_url(phone):
            raise forms.ValidationError('Укажите телефон или Telegram-юзернейм без ссылок.')
        if phone.startswith('@'):
            import re

            if not re.match(CONTACT_USERNAME_RE, phone):
                raise forms.ValidationError('Укажите корректный Telegram-юзернейм.')
            return phone
        digits = ''.join(ch for ch in phone if ch.isdigit())
        if len(digits) < 7 or len(digits) > 15:
            raise forms.ValidationError('Укажите телефон или Telegram-юзернейм, по которому можно связаться.')
        return phone

    def clean_message(self):
        message = ' '.join(self.cleaned_data.get('message', '').split())
        if len(message) < 4:
            raise forms.ValidationError('Опишите задачу хотя бы парой слов.')
        if len(message) > 1500:
            raise forms.ValidationError('Сократите описание задачи до 1500 символов.')
        if sum(message.lower().count(marker) for marker in URL_MARKERS) > 2:
            raise forms.ValidationError('Слишком много ссылок в заявке.')
        return message

    def clean_source_path(self):
        source_path = (self.cleaned_data.get('source_path') or '/').strip()[:255]
        if not source_path.startswith('/'):
            return '/'
        return source_path
