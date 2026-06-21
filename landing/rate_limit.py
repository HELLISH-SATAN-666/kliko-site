import time

from django.core.cache import cache


def is_rate_limited(scope, identifier, limit, window_seconds):
    if not identifier:
        identifier = "unknown"
    bucket = int(time.time() // window_seconds)
    key = f"rate:{scope}:{identifier}:{bucket}"
    added = cache.add(key, 1, timeout=window_seconds + 5)
    if added:
        return False
    try:
        count = cache.incr(key)
    except ValueError:
        cache.set(key, 1, timeout=window_seconds + 5)
        return False
    return count > limit
