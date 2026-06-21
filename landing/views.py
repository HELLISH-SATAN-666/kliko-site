import json
from datetime import timedelta
from xml.sax.saxutils import escape

from django.conf import settings
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.http import Http404, HttpResponse, JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from .forms import LeadForm
from .middleware import get_client_ip
from .models import Lead, TrackedEvent, Visit
from .rate_limit import is_rate_limited
from .telegram import send_lead_notification


PACKAGES = [
    {
        'id': Lead.Package.SITE,
        'title': 'Сайт-визитка который будет готов уже завтра',
        'price': 'от 3 000 ₽',
        'term': '1 день',
        'tag': 'быстрый запуск',
        'summary': 'Лендинг или небольшой сайт с понятной услугой, информационными блоками и контактами.',
        'items': [
            'структура под вашу нишу и задачу',
            'адаптивный дизайн без шаблонной скуки',
            'заявки, звонок, мессенджеры, события',
            'базовая аналитика и подготовка к рекламе',
        ],
    },
    {
        'id': Lead.Package.AUTOMATION,
        'title': 'Автоматизация заявок и рутины',
        'price': 'от 8 000 ₽',
        'term': '3-5 дней',
        'tag': 'самый продаваемый',
        'summary': 'Скрипты, Telegram-боты, интеграции и мини-CRM, чтобы заявки не терялись в хаосе.',
        'items': [
            'уведомления менеджеру и история лидов',
            'таблицы, CRM, Telegram, WhatsApp, формы',
            'статусы, напоминания и повторные сценарии',
            'дашборд по заявкам и действиям клиентов',
        ],
    },
    {
        'id': Lead.Package.SYSTEM,
        'title': 'Система под ключ',
        'price': 'от 15 000 ₽',
        'term': '7-14 дней',
        'tag': 'когда нужно серьезно',
        'summary': 'Сайт, бот, личный кабинет, внутренняя админка и логика бизнеса в одном рабочем пакете.',
        'items': [
            'воронка сайта плюс автоматизация',
            'бот для заявок, записи или поддержки',
            'админка, роли, база данных, отчеты',
            'запуск, тестирование и 2 недели сопровождения',
        ],
    },
]

SPECIALS = [
    ('Telegram-бот', 'Запись, заявки, рассылки, оплата, поддержка клиентов.'),
    ('Парсер или мониторинг', 'Цены конкурентов, остатки, объявления, уведомления о новых событиях.'),
    ('CRM-минисистема', 'Своя база клиентов, статусы, история общения и задачи менеджеру.'),
    ('Интеграции', 'Сайт, формы, таблицы, почта, Telegram, amoCRM, Bitrix24, платежи.'),
    ('Скрипт под задачу', 'Автоматизация повторяющейся работы, которую сейчас делают руками.'),
    ('Доработка сайта', 'Формы, скорость, SEO-база, адаптив, новые блоки и аналитика.'),
]

SHOWCASE = [
    {
        'slug': 'coffee',
        'name': 'Brew Corner',
        'type': 'кофейня и завтраки',
        'title': 'Сайт кофейни с предзаказом, банкетами и заявками в админку',
        'summary': 'Теплый, продуктовый сайт для локальной кофейни: меню, сезонные предложения, предзаказ, банкеты и быстрая связь.',
        'accent': '#f07855',
        'soft': '#f8e7d3',
        'dark': '#2d211d',
        'image': 'landing/img/pr1_2.png',
        'services': ['Меню и завтраки', 'Предзаказ', 'Банкеты', 'Telegram-уведомления'],
        'metrics': ['+28% заявок на банкеты', 'Заявка за минуту', 'запуск за 3 дня'],
    },
    {
        'slug': 'beauty',
        'name': 'Luma Beauty',
        'type': 'салон красоты',
        'title': 'Сайт салона с услугами, мастерами, записью и повторными клиентами',
        'summary': 'Визуальный сайт, где клиент быстро выбирает услугу, видит мастеров, цены и оставляет заявку без лишней анкеты.',
        'accent': '#8d72ff',
        'soft': '#eee8ff',
        'dark': '#231f33',
        'image': 'landing/img/pr2_2.png',
        'services': ['Услуги', 'Мастера', 'Онлайн-запись', 'Напоминания'],
        'metrics': ['+19% записей', 'авто-окна для записи', 'рассылка для повторных визитов'],
    },
    {
        'slug': 'repair',
        'name': 'FixLab',
        'type': 'ремонт и сервис',
        'title': 'Сайт сервиса с калькулятором заявки, кейсами и контролем клиентов',
        'summary': 'Практичный сайт для ремонтной компании: быстро объясняет услугу, показывает примеры и переводит заявку в работу.',
        'accent': '#2abf8f',
        'soft': '#ddf7ed',
        'dark': '#172a2f',
        'image': 'landing/img/pr3_2.png',
        'services': ['Калькулятор', 'До и после', 'Статусы', 'CRM'],
        'metrics': ['никаких ручных уточнений', '4 статуса заявки', 'отчет по кликам'],
    },
    {
        'slug': 'primeri',
        'name': 'Brew Atelier',
        'type': 'живой пример: кофейня',
        'title': 'Пример сайта кофейни с меню, атмосферой, промо-блоками и быстрым действием',
        'summary': 'Готовый внешний пример из репозитория plague40404/primeri. В рабочем окружении ссылка ведет на страницу /examples/primeri/ на основном домене.',
        'accent': '#c8764a',
        'soft': '#f7e6d8',
        'dark': '#2d221d',
        'image': 'landing/img/example-primeri.png',
        'services': ['Меню', 'Промо', 'Атмосфера', 'CTA'],
        'metrics': ['живой пример', 'страница на домене', 'готов к показу'],
        'external_url': settings.EXAMPLE_PRIMERI_URL,
        'source_repo': 'https://github.com/plague40404/primeri',
    },
    {
        'slug': 'primeri-2',
        'name': 'eclat beauty',
        'type': 'живой пример: салон красоты',
        'title': 'Пример сайта салона красоты с услугами, визуальной подачей и записью',
        'summary': 'Готовый внешний пример из репозитория plague40404/primeri-2.0. В рабочем окружении ссылка ведет на страницу /examples/primeri-2/ на основном домене.',
        'accent': '#9c70ff',
        'soft': '#efe6ff',
        'dark': '#241f33',
        'image': 'landing/img/example-primeri-2.png',
        'services': ['Услуги', 'Прайс', 'Запись', 'Визуал'],
        'metrics': ['живой пример', 'страница на домене', 'готов к показу'],
        'external_url': settings.EXAMPLE_PRIMERI_2_URL,
        'source_repo': 'https://github.com/plague40404/primeri-2.0',
    },
]

REVIEWS = [
    {
        'company': 'Веранда, ресторан',
        'person': 'Ярослав, управляющий',
        'text': 'После запуска сайта заявки на банкеты и доставку стали приходить не в личку, а на сайт, легче отвечать быстро. Сделали меню на сайте, рассылки с акциями в соц.сети',
        'metric': '-5 часов рутины в день',
    },
    {
        'company': 'Diesel Nails',
        'person': 'Екатерина, салон красоты',
        'text': 'Спасибо, стало легче заниматься реальными делами. Запись теперь через сайт или бота, девочки сразу выбирают окно и мастера. А мне приходят напоминания в телеграм',
        'metric': '+64% заявок',
    },
    {
        'company': 'Выездной ремонт',
        'person': 'Дмитрий, ремонт',
        'text': 'Спасибо. Через бота в максе удобно, можно не звонить по заказам',
        'metric': '-4 часа рутины в день',
    },
    {
        'company': 'Smile City',
        'person': 'Мария, стоматология',
        'text': 'Понравилось, не передать словами. Вместе собрали воронку, подключили СРМ',
        'metric': '+24 человека в день',
    },
]


def shared_context(request, form=None):
    return {
        'form': form or LeadForm(initial={'source_path': request.path}),
        'packages': PACKAGES,
        'specials': SPECIALS,
        'showcase': SHOWCASE,
        'reviews': REVIEWS,
        'phone_reveal_url': reverse('contact-phone'),
        'telegram_url': settings.TELEGRAM_URL,
        'whatsapp_url': settings.WHATSAPP_URL,
    }


@ensure_csrf_cookie
def home(request):
    return render(request, 'landing/home.html', shared_context(request))


@ensure_csrf_cookie
def showcase_site(request, slug):
    item = next((case for case in SHOWCASE if case['slug'] == slug), None)
    if item is None:
        raise Http404('Showcase site not found')
    if item.get('external_url'):
        return redirect(item['external_url'])
    return render(request, 'landing/showcase_site.html', {
        'item': item,
        'phone_reveal_url': reverse('contact-phone'),
    })


@ensure_csrf_cookie
def thanks(request):
    return render(request, 'landing/thanks.html', {
        'phone_reveal_url': reverse('contact-phone'),
        'telegram_url': settings.TELEGRAM_URL,
    })


@require_GET
def noctalia(request):
    return render(request, 'landing/noctalia.html', {
        'title': 'Noctalia NOC',
        'amnezia_download_url': 'https://amneziaofficial.com/ru/download',
    })


def lead_limit_exceeded(ip_address):
    if not ip_address:
        return False
    now = timezone.now()
    checks = (
        (timedelta(minutes=5), 3),
        (timedelta(hours=1), 5),
        (timedelta(days=1), 15),
    )
    return any(
        Lead.objects.filter(ip_address=ip_address, created_at__gte=now - window).count() >= limit
        for window, limit in checks
    )


@require_POST
def submit_lead(request):
    ip_address = get_client_ip(request)
    is_ajax = request.headers.get('x-requested-with') == 'XMLHttpRequest'

    if is_rate_limited('lead-post', ip_address, 20, 60) or lead_limit_exceeded(ip_address):
        payload = {
            'ok': False,
            'message': 'Слишком много отправок за короткое время. Попробуйте позже или напишите в Telegram.',
        }
        if is_ajax:
            return JsonResponse(payload, status=429)
        return render(request, 'landing/home.html', shared_context(request), status=429)

    form = LeadForm(request.POST)
    if form.is_valid():
        if not request.session.session_key:
            request.session.save()
        lead = form.save(commit=False)
        lead.session_key = request.session.session_key or ''
        lead.ip_address = ip_address
        lead.user_agent = request.META.get('HTTP_USER_AGENT', '')
        lead.save()
        TrackedEvent.objects.create(
            event_type=TrackedEvent.EventType.FORM_SUBMIT,
            label=lead.get_package_display(),
            path=lead.source_path or request.META.get('HTTP_REFERER', ''),
            session_key=lead.session_key,
            ip_address=lead.ip_address,
            user_agent=lead.user_agent,
            metadata={'lead_id': lead.id, 'package': lead.package},
        )
        send_lead_notification(lead)

        if is_ajax:
            return JsonResponse({
                'ok': True,
                'message': 'Заявка сохранена. Я свяжусь с вами в ближайшее рабочее время.',
                'lead_id': lead.id,
            })
        return redirect(reverse('thanks'))

    if is_ajax:
        return JsonResponse({'ok': False, 'errors': form.errors}, status=422)
    return render(request, 'landing/home.html', shared_context(request, form), status=422)


@require_POST
def track_event(request):
    ip_address = get_client_ip(request)
    if is_rate_limited('track-event', ip_address, 90, 60):
        return JsonResponse({'ok': False}, status=429)

    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'ok': False}, status=400)

    event_type = payload.get('type') or TrackedEvent.EventType.CLICK
    allowed = {choice[0] for choice in TrackedEvent.EventType.choices}
    if event_type not in allowed:
        event_type = TrackedEvent.EventType.CLICK

    if not request.session.session_key:
        request.session.save()

    metadata = payload.get('metadata') if isinstance(payload.get('metadata'), dict) else {}
    metadata = {
        str(key)[:80]: str(value)[:240]
        for key, value in metadata.items()
        if key is not None
    }
    duration_ms = payload.get('duration_ms')
    try:
        duration_ms = int(duration_ms) if duration_ms is not None else None
    except (TypeError, ValueError):
        duration_ms = None

    TrackedEvent.objects.create(
        event_type=event_type,
        label=str(payload.get('label', ''))[:180],
        path=str(payload.get('path', request.path))[:255],
        metadata=metadata,
        duration_ms=duration_ms,
        session_key=request.session.session_key or '',
        ip_address=ip_address,
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
    )
    return JsonResponse({'ok': True})


@require_POST
@never_cache
def contact_phone(request):
    ip_address = get_client_ip(request)
    if is_rate_limited('contact-phone', ip_address, 8, 60 * 60):
        return JsonResponse({'ok': False, 'message': 'Лимит запросов исчерпан.'}, status=429)
    tel = ''.join(ch for ch in settings.CONTACT_PHONE_TEL if ch.isdigit() or ch == '+')
    return JsonResponse({
        'ok': True,
        'display': settings.CONTACT_PHONE_DISPLAY,
        'tel_href': f'tel:{tel}',
    })


@require_GET
def robots_txt(request):
    sitemap_url = request.build_absolute_uri(reverse('sitemap-xml'))
    lines = [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin/',
        'Disallow: /control/',
        'Disallow: /lead/',
        'Disallow: /track/',
        'Disallow: /contact-phone/',
        'Disallow: /thanks/',
        '',
        f'Sitemap: {sitemap_url}',
    ]
    return HttpResponse('\n'.join(lines), content_type='text/plain; charset=utf-8')


@require_GET
def sitemap_xml(request):
    urls = [
        (reverse('home'), 'daily', '1.0'),
        *[
            (reverse('showcase-site', kwargs={'slug': item['slug']}), 'weekly', '0.7')
            for item in SHOWCASE
            if not item.get('external_url')
        ],
    ]
    items = []
    for path, changefreq, priority in urls:
        loc = escape(request.build_absolute_uri(path))
        items.append(
            f'<url><loc>{loc}</loc><changefreq>{changefreq}</changefreq>'
            f'<priority>{priority}</priority></url>'
        )
    body = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        f'{"".join(items)}'
        '</urlset>'
    )
    return HttpResponse(body, content_type='application/xml; charset=utf-8')


@staff_member_required
def admin_dashboard(request):
    now = timezone.now()
    today = timezone.localdate()
    start_day = today - timedelta(days=13)

    visits_total = Visit.objects.count()
    leads_total = Lead.objects.count()
    events_total = TrackedEvent.objects.count()
    visits_today = Visit.objects.filter(started_at__date=today).count()
    leads_today = Lead.objects.filter(created_at__date=today).count()
    conversion = round((leads_total / visits_total) * 100, 1) if visits_total else 0

    raw_days = (
        Visit.objects.filter(started_at__date__gte=start_day)
        .annotate(day=TruncDate('started_at'))
        .values('day')
        .annotate(count=Count('id'))
        .order_by('day')
    )
    visits_by_day = {row['day']: row['count'] for row in raw_days}
    max_visits = max(visits_by_day.values(), default=1)
    chart_days = []
    for offset in range(14):
        day = start_day + timedelta(days=offset)
        count = visits_by_day.get(day, 0)
        chart_days.append({
            'label': day.strftime('%d.%m'),
            'count': count,
            'height': max(8, int((count / max_visits) * 100)) if count else 8,
        })

    top_clicks = (
        TrackedEvent.objects.exclude(label='')
        .values('event_type', 'label')
        .annotate(count=Count('id'))
        .order_by('-count')[:12]
    )
    packages = (
        Lead.objects.values('package')
        .annotate(count=Count('id'))
        .order_by('-count')
    )
    package_labels = dict(Lead.Package.choices)

    context = {
        'title': 'Статистика сайта',
        'now': now,
        'visits_total': visits_total,
        'leads_total': leads_total,
        'events_total': events_total,
        'visits_today': visits_today,
        'leads_today': leads_today,
        'conversion': conversion,
        'chart_days': chart_days,
        'top_clicks': top_clicks,
        'packages': [
            {'label': package_labels.get(row['package'], row['package']), 'count': row['count']}
            for row in packages
        ],
        'recent_leads': Lead.objects.all()[:10],
        'recent_visits': Visit.objects.all()[:12],
        'recent_events': TrackedEvent.objects.all()[:12],
        'admin_base_url': f'/{settings.ADMIN_URL}',
    }
    return render(request, 'landing/admin_dashboard.html', context)
