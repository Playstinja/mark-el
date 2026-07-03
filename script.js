/*LOGÓK*/
const CLIENT_LOGOS = [
    'bosch.webp',
    'ceva.webp',
    'incholding.webp',
	'museart.webp',
	'trusstech.webp',
	'aionhill.webp',
	'mfb.webp',
	'fehermagic.webp',
	'apollo-tyres-ltd.webp',
];

function loadClientLogos() {
    const track = document.querySelector('.marquee-track');
    if (!track) return;
    track.innerHTML = '';
    [false, true].forEach(isDuplicate => {
        CLIENT_LOGOS.forEach(filename => {
            const name = filename.replace(/\.[^/.]+$/, '');
            const wrap = document.createElement('span');
            wrap.className = 'client-logo-wrap';
            if (isDuplicate) wrap.setAttribute('aria-hidden', 'true');
            wrap.innerHTML = `<img class="client-logo" src="assets/logos/${filename}" alt="${isDuplicate ? '' : name}">`;
            track.appendChild(wrap);
        });
    });
}

/* ── PORTFOLIO SLIDESHOW ── */
// Minden "oldal" tartalmaz egy nagy sort (2 kép) és egy kis sort (3 kép)
const PORTFOLIO_SLIDES = [
    {
        large: [
            { file: 'bosch-receptfuzet.webp', title: 'Bosch receptfüzet', desc: 'Rövid leírás a projektről és a feladatról.' },
            { file: 'arculat-1.webp',         title: 'Arculat', desc: 'Rövid leírás a projektről és a feladatról.' },
        ],
        small: [
            { file: 'csomagolas-1.webp',  title: 'Csomagolás', desc: 'Rövid leírás a projektről és a feladatról.' },
            { file: 'marketing-1.webp',   title: 'Marketing kampány', desc: 'Rövid leírás a projektről és a feladatról.' },
            { file: 'dekoracio-1.webp',   title: 'Dekoráció', desc: 'Rövid leírás a projektről és a feladatról.' },
        ]
    },
    {
        large: [
            { file: 'arculat-2.webp',     title: 'Arculat', desc: 'Rövid leírás a projektről és a feladatról.' },
            { file: 'nagyformatum.webp',  title: 'Nagyformátum', desc: 'Rövid leírás a projektről és a feladatról.' },
        ],
        small: [
            { file: 'marketing-2.webp',   title: 'Kampány', desc: 'Rövid leírás a projektről és a feladatról.' },
            { file: 'arculat-3.webp',     title: 'Arculat', desc: 'Rövid leírás a projektről és a feladatról.' },
            { file: 'kiadvany-1.webp',    title: 'Kiadvány', desc: 'Rövid leírás a projektről és a feladatról.' },
        ]
    },
];

function loadPortfolio() {
    const showcase  = document.querySelector('.portfolio-showcase');
    const dotsEl    = document.getElementById('portfolio-dots');
    const scrollerEl = document.getElementById('portfolio-scroller');
    if (!showcase || !scrollerEl) return;

    // Két külön vízszintes sáv egymás alatt
    const largeTrack = document.createElement('div');
    largeTrack.className = 'pt-track pt-track-large';

    const smallTrack = document.createElement('div');
    smallTrack.className = 'pt-track pt-track-small';

    PORTFOLIO_SLIDES.forEach(slide => {
        slide.large.forEach(item => {
            const el = document.createElement('div');
            el.className = 'portfolio-item-large';
            el.innerHTML = `<img src="assets/portfolio/${item.file}" alt="${item.title}" onerror="this.parentElement.style.background='#2a2a2a'">`;
            largeTrack.appendChild(el);
        });
        slide.small.forEach(item => {
            const el = document.createElement('div');
            el.className = 'portfolio-item-small';
            el.innerHTML = `<img src="assets/portfolio/${item.file}" alt="${item.title}" onerror="this.parentElement.style.background='#2a2a2a'">`;
            smallTrack.appendChild(el);
        });
    });

    scrollerEl.style.display = 'none';
    const wrapper = document.createElement('div');
    wrapper.className = 'pt-wrapper';
    wrapper.style.touchAction = 'pan-y';
    wrapper.appendChild(largeTrack);
    wrapper.appendChild(smallTrack);
    showcase.insertBefore(wrapper, scrollerEl);

    // Mobil: egy-képes négyzetes (1:1) carousel, natív ujjas húzással
    const mobile = document.createElement('div');
    mobile.className = 'pt-mobile';
    PORTFOLIO_SLIDES.forEach(slide => {
        [...slide.large, ...slide.small].forEach(item => {
            const s = document.createElement('div');
            s.className = 'pt-m-slide';
            s.innerHTML = `<img src="assets/portfolio/${item.file}" alt="${item.title || ''}" onerror="this.parentElement.style.background='#2a2a2a'">`;
            mobile.appendChild(s);
        });
    });
    showcase.appendChild(mobile);

    // ── Animáció állapot ──
    const totalSlides = PORTFOLIO_SLIDES.length;
    let currentSlide  = 0;
    let largeProg = 0;   // animált progress a nagy sornak
    let smallProg = 0;   // animált progress a kis sornak (lassabb)
    let isAnimating = false;
    let rafId = null;

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function getLargeItemWidth() {
        // 50vw - 3px gap fele
        return window.innerWidth / 2 - 3 + 6; // item + gap
    }
    function getSmallItemWidth() {
        // 33.333vw - ~4px gap
        return window.innerWidth / 3 - 4 + 6;
    }

    function applyPositions(lp, sp) {
        // Nagy sor: 2 kép/slide → lépés = 2 × (50vw)
        const lStep = window.innerWidth; // 2 × (50vw) = 100vw
        const sStep = window.innerWidth; // 3 × (33.33vw) = 100vw
        largeTrack.style.transform = `translateX(${-lp * lStep}px)`;
        // Kis sor 75%-os sebességgel → parallax
        smallTrack.style.transform = `translateX(${-sp * sStep}px)`;
    }

    function animateTo(target) {
        if (isAnimating) return;
        isAnimating = true;
        if (rafId) cancelAnimationFrame(rafId);

        const startLarge = largeProg;
        const startSmall = smallProg;
        const duration   = 700;
        const startTime  = performance.now();

        function tick(now) {
            const t = Math.min((now - startTime) / duration, 1);
            const e = easeInOutCubic(t);

            largeProg = startLarge + (target - startLarge) * e;
            // Kis sor 75%-os sebességgel mozdul → lemarad, aztán utolér
            smallProg = startSmall + (target - startSmall) * e * 0.75;

            applyPositions(largeProg, smallProg);

            if (t < 1) {
                rafId = requestAnimationFrame(tick);
            } else {
                largeProg = target;
                isAnimating = false;
                updateDots();
            }
        }
        rafId = requestAnimationFrame(tick);
    }

    function goTo(idx) {
        idx = Math.max(0, Math.min(totalSlides - 1, idx));
        currentSlide = idx;
        animateTo(idx);
    }

    function updateDots() {
        document.querySelectorAll('.portfolio-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    // Dot navigátor
    if (dotsEl) {
        dotsEl.innerHTML = '';
        PORTFOLIO_SLIDES.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'portfolio-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `${i + 1}. oldal`);
            dot.addEventListener('click', () => { goTo(i); startAuto(); });
            dotsEl.appendChild(dot);
        });
    }

    // Swipe / drag (mobilon ujjal is)
    let dragStartX = null;
    let dragStartY = null;
    function endDrag(clientX) {
        if (dragStartX === null) return;
        const dx = dragStartX - clientX;
        if (Math.abs(dx) > 40) goTo(currentSlide + (dx > 0 ? 1 : -1));
        dragStartX = null;
        dragStartY = null;
        startAuto();
    }
    wrapper.addEventListener('pointerdown', e => {
        dragStartX = e.clientX;
        dragStartY = e.clientY;
    });
    wrapper.addEventListener('pointerup', e => endDrag(e.clientX));
    wrapper.addEventListener('pointercancel', () => { dragStartX = null; dragStartY = null; });

    // Automatikus lapozás 15 mp-enként, körbeforgással; egérrel fölé érve megáll
    let autoTimer = null;
    function nextSlide() { goTo((currentSlide + 1) % totalSlides); }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
    function startAuto() { stopAuto(); if (totalSlides > 1) autoTimer = setInterval(nextSlide, 15000); }
    showcase.addEventListener('mouseenter', stopAuto);
    showcase.addEventListener('mouseleave', startAuto);
    startAuto();

    applyPositions(0, 0);
}

/* ── PORTFÓLIÓ OLDAL BENTO RÁCS ── */
const PORTFOLIO_CATEGORIES = [
    { id: 'arculat', label: 'Arculat', items: [
        { file: 'arculat-1.webp', title: 'Projekt neve', desc: 'Rövid leírás a feladatról.' },
        { file: 'arculat-2.webp', title: 'Projekt neve', desc: 'Rövid leírás a feladatról.' },
        { file: 'arculat-3.webp', title: 'Projekt neve', desc: 'Rövid leírás a feladatról.' },
        { file: 'arculat-4.webp', title: 'Projekt neve', desc: 'Rövid leírás a feladatról.' },
    ]},
    { id: 'nyomdai', label: 'Nyomdai', items: [
        { file: 'nyomda-1.webp', title: 'Projekt neve', desc: 'Rövid leírás a feladatról.' },
        { file: 'nyomda-2.webp', title: 'Projekt neve', desc: 'Rövid leírás a feladatról.' },
        { file: 'nyomda-3.webp', title: 'Projekt neve', desc: 'Rövid leírás a feladatról.' },
        { file: 'nyomda-4.webp', title: 'Projekt neve', desc: 'Rövid leírás a feladatról.' },
    ]},
    { id: 'dekoracio', label: 'Dekoráció', items: [
        { file: 'dekoracio-1.webp', title: 'Projekt neve', desc: 'Rövid leírás a feladatról.' },
        { file: 'dekoracio-2.webp', title: 'Projekt neve', desc: 'Rövid leírás a feladatról.' },
        { file: 'dekoracio-3.webp', title: 'Projekt neve', desc: 'Rövid leírás a feladatról.' },
        { file: 'dekoracio-4.webp', title: 'Projekt neve', desc: 'Rövid leírás a feladatról.' },
    ]},
    { id: 'web', label: 'Web', items: [
        { file: 'web-1.webp', title: 'Projekt neve', desc: 'Rövid leírás a feladatról.' },
        { file: 'web-2.webp', title: 'Projekt neve', desc: 'Rövid leírás a feladatról.' },
        { file: 'web-3.webp', title: 'Projekt neve', desc: 'Rövid leírás a feladatról.' },
        { file: 'web-4.webp', title: 'Projekt neve', desc: 'Rövid leírás a feladatról.' },
    ]},
];

function loadBento() {
    const grid = document.getElementById('bento');
    if (!grid) return;
    const catsEl = document.getElementById('portfolio-cats');
    grid.innerHTML = '';
    if (catsEl) catsEl.innerHTML = '';

    PORTFOLIO_CATEGORIES.forEach(cat => {
        if (catsEl) {
            const link = document.createElement('a');
            link.href = '#kat-' + cat.id;
            link.textContent = cat.label;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.getElementById('kat-' + cat.id);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            catsEl.appendChild(link);
        }
        cat.items.forEach((item, idx) => {
            const tile = document.createElement('div');
            tile.className = 'feature-tile reveal-up';
            if (idx === 0) tile.id = 'kat-' + cat.id;
            tile.innerHTML = `<div class="ft-img" style="background-image:url('assets/portfolio/${item.file}')"></div><div class="ft-overlay"><h3>${item.title || ''}</h3><p class="ft-sub">${item.desc || ''}</p></div>`;
            if (window.matchMedia('(hover: none)').matches) {
                tile.addEventListener('click', () => tile.classList.toggle('revealed'));
            }
            grid.appendChild(tile);
        });
    });
}

/* ── SZOLGÁLTATÁSOK KATEGÓRIA-SÁV ── */
function setupServiceCats() {
    document.querySelectorAll('#service-cats a[href^="#"], #rolam-cats a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(link.getAttribute('href').slice(1));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

/* ── SZÁMLÁLÓ ── */
const runCounters = () => {
    document.querySelectorAll('.stat-number').forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const suffix = counter.getAttribute('data-suffix') || '';
        const update = () => {
            const current = +counter.innerText.replace(/\D/g, '') || 0;
            const increment = Math.max(1, Math.ceil(target / 100));
            if (current < target) {
                counter.innerText = Math.min(target, current + increment).toLocaleString('hu-HU') + suffix;
                setTimeout(update, 15);
            } else {
                counter.innerText = target.toLocaleString('hu-HU') + suffix;
            }
        };
        update();
    });
};

/* ── NAVBAR ── */
const setupNavbar = () => {
    const navToggle = document.getElementById('navToggle');
    const navLinks  = document.getElementById('navLinks');
    if (!navToggle || !navLinks) return;
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        navToggle.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            navLinks.classList.remove('open');
            navToggle.classList.remove('open');
        });
    });
};

/* ── KAPCSOLAT – e-mail és telefon, robotbiztos ── */
const setupContactActions = () => {
    const emailLink = document.getElementById('contact-mail');
    if (emailLink) {
        emailLink.addEventListener('click', function(e) {
            e.preventDefault();
            const parts = ['hello', '@', 'mark-el', '.hu'];
            const email = parts.join('');
            window.location.href = 'mailto:' + email;
            navigator.clipboard?.writeText(email).then(() => {
                alert('E-mail cím másolva: ' + email);
            }).catch(() => {});
        });
    }

    const phoneLink = document.getElementById('contact-phone');
    if (phoneLink) {
        phoneLink.addEventListener('click', function(e) {
            e.preventDefault();
            const p = ['+36', '20', '290', '4932'].join('');
            // Mobilon hív, asztali gépen megmutatja a számot
            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (isMobile) {
                window.location.href = 'tel:' + p;
            } else {
                alert('Telefonszám: ' + p);
            }
        });
    }

    const discordBtn = document.getElementById('discord-copy');
    if (discordBtn) {
        discordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const u = 'markl42';
            navigator.clipboard?.writeText(u).then(() => {
                alert('Discord név másolva: ' + u);
            }).catch(() => {});
        });
    }
};

/* ── HERO SCROLL ── */
const setupHeroCta = () => {
    const cta = document.getElementById('hero-cta');
    if (cta) {
        cta.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
};

/* ── SÜTI BANNER ── */
const setupCookieBanner = () => {
    if (localStorage.getItem('cookie-consent')) return;
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.innerHTML = `<p class="cookie-text">Ez a weboldal sütiket használ a megfelelő működéshez és a látogatottság elemzéséhez. Részletek az <a href="adatkezeles.html">Adatkezelési tájékoztatóban</a>.</p><div class="cookie-actions"><button type="button" class="cta-button" id="cookie-accept">Elfogadom</button><button type="button" class="btn-ghost" id="cookie-reject">Elutasítom</button></div>`;
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('show'));
    const close = (choice) => {
        localStorage.setItem('cookie-consent', choice);
        banner.classList.remove('show');
        setTimeout(() => banner.remove(), 450);
    };
    const accept = document.getElementById('cookie-accept');
    const reject = document.getElementById('cookie-reject');
    if (accept) accept.addEventListener('click', () => close('accepted'));
    if (reject) reject.addEventListener('click', () => close('rejected'));
};

/* ── INIT ── */
function setupFaq() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;
    items.forEach(item => {
        const q = item.querySelector('.faq-q');
        if (!q) return;
        q.addEventListener('click', () => {
            const isOpen = item.classList.toggle('open');
            q.setAttribute('aria-expanded', String(isOpen));
        });
    });
}

function setupProtectedEmail() {
    const els = document.querySelectorAll('.email-protected');
    if (!els.length) return;
    const email = ['hello', '@', 'mark-el', '.hu'].join('');
    els.forEach(el => {
        const a = document.createElement('a');
        a.href = 'mailto:' + email;
        a.textContent = email;
        el.appendChild(a);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    loadClientLogos();
    loadPortfolio();
    loadBento();
    setupServiceCats();
    setupNavbar();
    setupContactActions();
    setupHeroCta();
    setupCookieBanner();
    setupFaq();
    setupProtectedEmail();

    const sectionObs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.05 });
    document.querySelectorAll('section').forEach(s => sectionObs.observe(s));

    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                revealObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal, .reveal-up').forEach(el => revealObs.observe(el));

    const statsSection = document.querySelector('#stats-bar');
    if (statsSection) {
        const statsObs = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) { runCounters(); statsObs.unobserve(statsSection); }
        }, { threshold: 0.6 });
        statsObs.observe(statsSection);
    }

    const navbar = document.getElementById('navbar');
    const btn    = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (navbar) navbar.classList.toggle('scrolled', scrollTop > 50);
        if (btn) {
            const docH = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            btn.classList.toggle('visible', docH > 0 && (scrollTop / docH) * 100 > 90);
        }
    });
    if (btn) btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Jobb klikk tiltás eltávolítva (user kérés)
