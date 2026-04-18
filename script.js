/* ============================================================
   CGI Jaffna – Shared JavaScript
   GIGW 3.0 / WCAG 2.1 AA compliant interactive features
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── Accessibility: Font Size Controls ──────────── */
  const fontBtns = document.querySelectorAll('.font-btn[data-action]');
  let fontScale = parseFloat(localStorage.getItem('cgi-font-scale') || '1');
  applyFontScale(fontScale);

  fontBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'increase') fontScale = Math.min(fontScale + 0.1, 1.4);
      else if (action === 'decrease') fontScale = Math.max(fontScale - 0.1, 0.8);
      else if (action === 'reset') fontScale = 1;
      applyFontScale(fontScale);
      localStorage.setItem('cgi-font-scale', fontScale);
    });
  });

  function applyFontScale(scale) {
    document.documentElement.style.fontSize = (16 * scale) + 'px';
  }

  /* ── Accessibility: High Contrast ───────────────── */
  const contrastBtn = document.querySelector('.contrast-btn');
  if (contrastBtn) {
    const isHC = localStorage.getItem('cgi-contrast') === 'high';
    if (isHC) document.body.classList.add('high-contrast');
    contrastBtn.addEventListener('click', () => {
      document.body.classList.toggle('high-contrast');
      const state = document.body.classList.contains('high-contrast') ? 'high' : 'normal';
      localStorage.setItem('cgi-contrast', state);
      contrastBtn.setAttribute('aria-pressed', state === 'high' ? 'true' : 'false');
    });
  }

  /* ── Language Toggle ─────────────────────────────── */
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* ── Header Clocks ─────────────────────────────── */
  const headerClocks = document.querySelectorAll('.clock-text[data-timezone]');
  const clockFormatters = new Map();

  function getClockFormatter(zone) {
    if (!clockFormatters.has(zone)) {
      clockFormatters.set(zone, new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    }
    return clockFormatters.get(zone); 
  }

  function formatClock(zone) {
    const parts = getClockFormatter(zone).formatToParts(new Date());
    const map = {};
    parts.forEach(part => {
      if (part.type !== 'literal') map[part.type] = part.value;
    });
    const suffix = (map.dayPeriod || '').toLowerCase();
    return `${map.weekday}, ${map.month} ${map.day}, ${map.year} at ${map.hour}:${map.minute}:${map.second} ${suffix}`.trim();
  }

  function updateHeaderClocks() {
    headerClocks.forEach(clock => {
      const zone = clock.dataset.timezone;
      if (!zone) return;
      clock.textContent = formatClock(zone);
    });
  }

  if (headerClocks.length) {
    updateHeaderClocks();
    setInterval(updateHeaderClocks, 1000);
  }

  /* ── Mobile Nav ──────────────────────────────────── */
  const hamburger = document.querySelector('.nav-hamburger');
  const navList = document.querySelector('.nav-list');
  if (hamburger && navList) {
    hamburger.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }
  document.addEventListener('click', e => {
    if (navList && !e.target.closest('.primary-nav')) navList.classList.remove('open');
  });

  /* ── Dropdown keyboard ───────────────────────────── */
  const navToggles = document.querySelectorAll('.nav-toggle');
  navToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const item = toggle.closest('.nav-item');
      const dd = item.querySelector('.dropdown');
      if (!dd) return;
      const isVisible = dd.style.display === 'block';
      document.querySelectorAll('.dropdown').forEach(d => d.style.display = '');
      navToggles.forEach(t => t.setAttribute('aria-expanded', 'false'));
      dd.style.display = isVisible ? '' : 'block';
      toggle.setAttribute('aria-expanded', isVisible ? 'false' : 'true');
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-item')) {
      document.querySelectorAll('.dropdown').forEach(d => d.style.display = '');
      navToggles.forEach(t => t.setAttribute('aria-expanded', 'false'));
    }
  });

  /* ── Hero Slider ──────────────────────────────────── */
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  let cur = 0, timer;
  function goTo(n) {
    slides[cur].classList.remove('active');
    dots[cur]?.classList.remove('active');
    cur = (n + slides.length) % slides.length;
    slides[cur].classList.add('active');
    dots[cur]?.classList.add('active');
  }
  function startSlider() { timer = setInterval(() => goTo(cur + 1), 5500); }
  if (slides.length) {
    startSlider();
    dots.forEach((d, i) => d.addEventListener('click', () => { clearInterval(timer); goTo(i); startSlider(); }));
    document.querySelector('.slider-prev')?.addEventListener('click', () => { clearInterval(timer); goTo(cur - 1); startSlider(); });
    document.querySelector('.slider-next')?.addEventListener('click', () => { clearInterval(timer); goTo(cur + 1); startSlider(); });
  }

  /* ── News Ticker ──────────────────────────────────── */
  const track = document.querySelector('.ticker-track');
  if (track) track.innerHTML += track.innerHTML;

  /* ── Tabs ────────────────────────────────────────── */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const container = btn.closest('.tab-container');
      const target = btn.dataset.tab;
      container.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const panel = container.querySelector('#' + target);
      if (panel) panel.classList.add('active');
    });
  });

  /* ── Accordion ───────────────────────────────────── */
  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const isOpen = content.classList.contains('open');
      const acc = btn.closest('.accordion');
      if (acc) {
        acc.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('open'));
        acc.querySelectorAll('.accordion-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-expanded', 'false'); });
      }
      if (!isOpen) { content.classList.add('open'); btn.classList.add('active'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ── Scroll Animations ───────────────────────────── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-up, .fade-in, .scale-in').forEach(el => io.observe(el));

  /* ── Back to Top ─────────────────────────────────── */
  const btt = document.getElementById('back-to-top');
  if (btt) {
    window.addEventListener('scroll', () => btt.style.display = window.scrollY > 400 ? 'flex' : 'none');
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── Sticky Header ────────────────────────────────── */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 10 ? '0 4px 16px rgba(0,0,0,.15)' : '0 2px 6px rgba(0,0,0,.08)';
    });
  }

  /* ── Counter Animation ───────────────────────────── */
  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target, target = parseInt(el.dataset.count || el.textContent);
        if (!isNaN(target)) {
          let cur2 = 0; const step = Math.ceil(target / 60);
          const t = setInterval(() => { cur2 = Math.min(cur2 + step, target); el.textContent = cur2.toLocaleString('en-IN'); if (cur2 >= target) clearInterval(t); }, 25);
        }
        cio.unobserve(el);
      }
    });
  });
  document.querySelectorAll('.stat-number[data-count]').forEach(el => cio.observe(el));

  /* ── Escape closes menus ─────────────────────────── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.dropdown').forEach(d => d.style.display = '');
      navToggles.forEach(t => t.setAttribute('aria-expanded', 'false'));
      navList?.classList.remove('open');
    }
  });

  /* ── Active nav ──────────────────────────────────── */
  const current = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === current) { link.classList.add('active'); link.setAttribute('aria-current', 'page'); }
  });

  /* ── Search ──────────────────────────────────────── */
  const st = document.querySelector('.search-toggle');
  const sb = document.querySelector('.search-bar');
  if (st && sb) st.addEventListener('click', () => { sb.classList.toggle('visible'); if (sb.classList.contains('visible')) sb.querySelector('input')?.focus(); });
});

/* ── Inject animation & utility CSS ─────────────────── */
const s = document.createElement('style');
s.textContent = `
.fade-up{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease}
.fade-in{opacity:0;transition:opacity .6s ease}
.scale-in{opacity:0;transform:scale(.95);transition:opacity .5s ease,transform .5s ease}
.fade-up.visible,.fade-in.visible,.scale-in.visible{opacity:1;transform:none}
.fade-up:nth-child(2){transition-delay:.1s}.fade-up:nth-child(3){transition-delay:.2s}.fade-up:nth-child(4){transition-delay:.3s}
#back-to-top{position:fixed;bottom:28px;right:28px;z-index:999;width:42px;height:42px;background:var(--navy);color:white;border:none;border-radius:50%;cursor:pointer;display:none;align-items:center;justify-content:center;font-size:1.1rem;box-shadow:0 4px 12px rgba(0,0,0,.2);transition:background .2s}
#back-to-top:hover{background:var(--saffron)}
.search-bar{position:absolute;top:100%;left:0;right:0;background:var(--navy-dark);padding:14px 20px;display:none;box-shadow:0 8px 20px rgba(0,0,0,.2);z-index:999}
.search-bar.visible{display:block}
.search-bar input{width:100%;padding:10px 16px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.1);color:white;border-radius:4px;font-size:.9rem;font-family:var(--font-base);outline:none;transition:border-color .2s}
.search-bar input::placeholder{color:rgba(255,255,255,.5)}
.search-bar input:focus{border-color:var(--saffron)}
`;
document.head.appendChild(s);