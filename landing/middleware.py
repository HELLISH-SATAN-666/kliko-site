import ipaddress

from django.conf import settings
from django.utils.deprecation import MiddlewareMixin

from .models import Visit
from .rate_limit import is_rate_limited


STATIC_SKIPPED_PREFIXES = (
    '/control/',
    '/static/',
    '/media/',
    '/track/',
    '/lead/',
    '/contact-phone/',
    '/favicon',
    '/robots.txt',
    '/sitemap.xml',
)


def skipped_prefixes():
    return (f"/{settings.ADMIN_URL}", *STATIC_SKIPPED_PREFIXES)


def clean_ip(value):
    if not value:
        return None
    candidate = str(value).split(',')[0].strip()
    try:
        ipaddress.ip_address(candidate)
    except ValueError:
        return None
    return candidate


def get_client_ip(request):
    if settings.TRUST_PROXY_HEADERS:
        forwarded_for = clean_ip(request.META.get('HTTP_X_FORWARDED_FOR'))
        if forwarded_for:
            return forwarded_for
        real_ip = clean_ip(request.META.get('HTTP_X_REAL_IP'))
        if real_ip:
            return real_ip
    return clean_ip(request.META.get('REMOTE_ADDR'))


def detect_device(user_agent):
    user_agent = (user_agent or '').lower()
    if any(marker in user_agent for marker in ('mobile', 'android', 'iphone', 'ipod')):
        return 'mobile'
    if any(marker in user_agent for marker in ('ipad', 'tablet')):
        return 'tablet'
    return 'desktop'


def looks_like_bot(user_agent):
    lowered = (user_agent or '').lower()
    return any(marker in lowered for marker in settings.BOT_USER_AGENT_MARKERS)


class VisitTrackingMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        if self._should_track(request, response):
            try:
                user_agent = request.META.get('HTTP_USER_AGENT', '')
                ip_address = get_client_ip(request)
                Visit.objects.create(
                    path=request.path[:255],
                    referrer=request.META.get('HTTP_REFERER', ''),
                    session_key=request.session.session_key or '',
                    ip_address=ip_address,
                    user_agent=user_agent,
                    device_type=detect_device(user_agent),
                    status_code=response.status_code,
                )
            except Exception:
                # Analytics must never block the sales page.
                pass
        return response

    def _should_track(self, request, response):
        if request.method != 'GET':
            return False
        if response.status_code >= 400:
            return False
        if any(request.path.startswith(prefix) for prefix in skipped_prefixes()):
            return False
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        if looks_like_bot(user_agent):
            return False
        identifier = get_client_ip(request) or request.META.get('REMOTE_ADDR') or user_agent or 'unknown'
        if is_rate_limited(
            'visit-track',
            f'{identifier}:{request.path}',
            settings.VISIT_TRACK_LIMIT,
            settings.VISIT_TRACK_WINDOW_SECONDS,
        ):
            return False
        content_type = response.headers.get('Content-Type', '')
        return content_type.startswith('text/html')


class SecurityHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response.setdefault('Content-Security-Policy', settings.CONTENT_SECURITY_POLICY)
        response.setdefault('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
        response.setdefault('Cross-Origin-Opener-Policy', 'same-origin')
        response.setdefault('X-Permitted-Cross-Domain-Policies', 'none')
        return response
