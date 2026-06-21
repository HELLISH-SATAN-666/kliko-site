(() => {
    document.documentElement.classList.add('has-js');

    const body = document.body;
    const trackUrl = body.dataset.trackUrl;
    const phoneUrl = body.dataset.phoneUrl;
    const startedAt = Date.now();

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return '';
    };

    const sendTrack = (payload, keepalive = false) => {
        if (!trackUrl) return;
        fetch(trackUrl, {
            method: 'POST',
            keepalive,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({
                path: window.location.pathname,
                ...payload,
            }),
        }).catch(() => {});
    };

    let phoneData = null;
    let phoneRequest = null;

    const applyPhone = (data) => {
        document.querySelectorAll('[data-protected-phone]').forEach((node) => {
            node.textContent = data.display || 'Позвонить';
            if (node.tagName === 'A') {
                node.href = data.tel_href || '#';
            }
            node.dataset.phoneReady = '1';
        });
    };

    const loadPhone = async () => {
        if (phoneData) return phoneData;
        if (!phoneUrl) {
            throw new Error('Телефон временно недоступен. Напишите в Telegram.');
        }
        if (!phoneRequest) {
            phoneRequest = fetch(phoneUrl, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
            }).then(async (response) => {
                const data = await response.json();
                if (!response.ok || !data.ok) {
                    throw new Error(data.message || 'Телефон временно недоступен. Напишите в Telegram.');
                }
                phoneData = data;
                applyPhone(data);
                return data;
            }).finally(() => {
                phoneRequest = null;
            });
        }
        return phoneRequest;
    };

    document.addEventListener('click', async (event) => {
        const target = event.target.closest('[data-protected-phone]');
        if (!target) return;
        event.preventDefault();
        const originalText = target.textContent;
        target.disabled = true;
        target.textContent = 'Открываю...';
        try {
            const data = await loadPhone();
            target.textContent = data.display || originalText;
            if (target.dataset.phoneMode === 'call' && data.tel_href) {
                window.location.href = data.tel_href;
            }
        } catch (error) {
            target.textContent = error.message || originalText;
        } finally {
            target.disabled = false;
        }
    });

    const navToggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-nav]');
    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('is-open');
            body.classList.toggle('menu-open', isOpen);
            navToggle.classList.toggle('is-open', isOpen);
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });
        nav.addEventListener('click', () => {
            nav.classList.remove('is-open');
            body.classList.remove('menu-open');
            navToggle.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            nav.classList.remove('is-open');
            body.classList.remove('menu-open');
            navToggle.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    }

    const progress = document.querySelector('[data-scroll-progress]');
    const updateProgress = () => {
        if (!progress) return;
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        progress.style.width = `${Math.min(100, (window.scrollY / max) * 100)}%`;
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    document.querySelectorAll('.reveal').forEach((node, index) => {
        node.style.transitionDelay = `${Math.min(index * 35, 240)}ms`;
        observer.observe(node);
    });

    document.addEventListener('click', (event) => {
        const target = event.target.closest('[data-track]');
        if (!target) return;
        const label = target.dataset.track || target.textContent.trim().slice(0, 80);
        sendTrack({
            type: target.dataset.eventType || 'click',
            label,
            metadata: {
                href: target.getAttribute('href') || '',
                package: target.dataset.package || '',
            },
        });
    });

    const packageInputNodes = document.querySelectorAll('[data-package-input]');
    const setPackage = (value) => {
        packageInputNodes.forEach((input) => {
            input.value = value || 'consult';
        });
    };

    document.querySelectorAll('[data-package]').forEach((button) => {
        button.addEventListener('click', () => {
            setPackage(button.dataset.package);
        });
    });

    document.querySelectorAll('[data-lead-form]').forEach((form) => {
        const status = form.querySelector('[data-form-status]');
        const submit = form.querySelector('button[type="submit"]');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (submit) {
                submit.disabled = true;
                submit.dataset.originalHtml = submit.innerHTML;
                submit.textContent = 'Отправляю...';
            }
            if (status) {
                status.hidden = true;
                status.classList.remove('error');
            }

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': getCookie('csrftoken'),
                    },
                    body: new FormData(form),
                });

                const responseText = await response.text();
                let data;
                try {
                    data = responseText ? JSON.parse(responseText) : {};
                } catch {
                    if (response.redirected && response.url.includes('/thanks/')) {
                        data = {
                            ok: true,
                            message: 'Заявка сохранена. Я свяжусь с вами в ближайшее рабочее время.',
                        };
                    } else {
                        throw new Error('Сервер вернул неожиданный ответ. Обновите страницу и попробуйте еще раз.');
                    }
                }

                if (!response.ok || !data.ok) {
                    const firstError = data.errors ? Object.values(data.errors)[0]?.[0] : data.message;
                    throw new Error(firstError || 'Проверьте поля формы и попробуйте еще раз.');
                }
                form.reset();
                setPackage('consult');
                if (status) {
                    status.textContent = data.message || 'Заявка отправлена.';
                    status.hidden = false;
                }
            } catch (error) {
                if (status) {
                    status.textContent = error.message || 'Не удалось отправить заявку.';
                    status.classList.add('error');
                    status.hidden = false;
                }
            } finally {
                if (submit) {
                    submit.disabled = false;
                    submit.innerHTML = submit.dataset.originalHtml || 'Получить план запуска <span>→</span>';
                }
            }
        });
    });

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 720px), (pointer: coarse)').matches;
    if (!reduceMotion) {
        document.querySelectorAll('[data-tilt-card]').forEach((card) => {
            card.addEventListener('pointermove', (event) => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `perspective(900px) rotateX(${y * -3}deg) rotateY(${x * 4}deg) translateY(-2px)`;
            });
            card.addEventListener('pointerleave', () => {
                card.style.transform = '';
            });
        });
    }

    const nudge = document.querySelector('[data-nudge]');
    const stickyCta = document.querySelector('.sticky-cta');
    const contactSection = document.querySelector('#contact');
    let contactVisible = false;
    const updateStickyCta = () => {
        if (stickyCta) {
            stickyCta.classList.toggle('is-hidden', contactVisible || window.scrollY < 420);
        }
    };
    if (contactSection) {
        const contactObserver = new IntersectionObserver((entries) => {
            contactVisible = entries.some((entry) => entry.isIntersecting);
            updateStickyCta();
            if (contactVisible && nudge) {
                nudge.hidden = true;
            }
        }, { threshold: 0.18 });
        contactObserver.observe(contactSection);
    }

    const showNudge = () => {
        if (!nudge || contactVisible || sessionStorage.getItem('kliko_nudge_closed')) return;
        nudge.hidden = false;
        sendTrack({ type: 'form_open', label: 'nudge-shown' });
    };
    const nudgeClose = document.querySelector('[data-nudge-close]');
    if (nudgeClose) {
        nudgeClose.addEventListener('click', () => {
            sessionStorage.setItem('kliko_nudge_closed', '1');
            nudge.hidden = true;
        });
    }

    let nudgeTimer = window.setTimeout(showNudge, 22000);
    window.addEventListener('scroll', () => {
        updateProgress();
        updateStickyCta();
        const scrollDepth = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        if (scrollDepth > 0.62) {
            window.clearTimeout(nudgeTimer);
            showNudge();
        }
    }, { passive: true });
    updateProgress();
    updateStickyCta();

    window.addEventListener('pagehide', () => {
        sendTrack({
            type: 'page_timing',
            label: document.title,
            duration_ms: Date.now() - startedAt,
        }, true);
    });
})();
