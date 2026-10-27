/* Galdino's Estética Automotiva — interações (sem dependências) */
(() => {
  'use strict';

  const CONFIG = {
    whatsappNumber: '5583991024975',   // usado nos links com mensagem por serviço
    timezone: 'America/Fortaleza',
    open: { days: [1, 2, 3, 4, 5, 6], from: 7 * 60 + 30, to: 17 * 60 }, // minutos do dia
    map: { lat: -7.1245702, lng: -34.8578091, zoom: 17 }
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;
  if (!hasIO) root.classList.remove('js-anim');

  /* ---------- WhatsApp com mensagem por serviço ---------- */
  $$('[data-wa]').forEach(a => {
    a.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(a.dataset.wa)}`;
  });

  /* ---------- ano ---------- */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- NAV ---------- */
  const nav = $('.nav');
  const toggle = $('.nav__toggle');
  const sheet = $('#menu-mobile');
  const fab = $('.fab');
  const hero = $('.hero');
  let lastY = window.scrollY;

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    sheet.hidden = !open;
  }
  toggle.addEventListener('click', () => setMenu(sheet.hidden));
  sheet.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !sheet.hidden) { setMenu(false); toggle.focus(); } });

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 24);
    const goingDown = y > lastY;
    nav.classList.toggle('is-hidden', goingDown && y > 700 && sheet.hidden);
    lastY = y;
    if (fab) fab.classList.toggle('is-visible', y > (hero ? hero.offsetHeight * .6 : 400));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // link ativo
  const links = $$('.nav__links a');
  if (hasIO) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['inicio', 'servicos', 'resultados', 'manutencao', 'agendamento', 'contato'].forEach(id => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- revelações ---------- */
  // atraso escalonado entre irmãos revelados juntos
  $$('.reveal, .reveal-img').forEach(el => {
    const sibs = Array.from(el.parentElement.children).filter(c => c.matches('.reveal, .reveal-img'));
    const i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty('--rd', Math.min(i * 0.08, 0.4) + 's');
  });
  if (hasIO) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    $$('.reveal, .reveal-img, .timeline, .carousel').forEach(el => io.observe(el));
  }

  /* ---------- parallax suave ---------- */
  const para = $$('[data-parallax]');
  if (!reduce && para.length) {
    let ticking = false;
    const run = () => {
      const vh = window.innerHeight;
      para.forEach(img => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const off = (r.top + r.height / 2 - vh / 2) * parseFloat(img.dataset.parallax);
        img.style.transform = `translate3d(0, ${(-off).toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* ---------- serviços: palco com imagem ativa ---------- */
  const svc = $('[data-svc]');
  if (svc) {
    const items = $$('[data-svc-item]', svc);
    const frames = $$('.svc__frame img', svc);
    const counter = $('[data-svc-index]', svc);
    const desk = window.matchMedia('(min-width: 960px)');
    let current = -1;
    const activate = i => {
      if (i === current || !desk.matches) return;
      current = i;
      items.forEach((it, k) => it.classList.toggle('is-active', k === i));
      frames.forEach((im, k) => im.classList.toggle('is-on', k === i));
      if (counter) counter.textContent = String(i + 1).padStart(2, '0');
    };
    items.forEach((it, i) => {
      it.addEventListener('mouseenter', () => activate(i));
      it.addEventListener('focusin', () => activate(i));
    });
    if (hasIO) {
      const band = new IntersectionObserver(entries => {
        entries.forEach(en => { if (en.isIntersecting) activate(items.indexOf(en.target)); });
      }, { rootMargin: '-40% 0px -45% 0px' });
      items.forEach(it => band.observe(it));
    }
    activate(0);
  }

  /* ---------- carrosséis ---------- */
  $$('[data-carousel]').forEach(car => {
    const track = $('[data-carousel-track]', car);
    const prev = $('[data-carousel-prev]', car);
    const next = $('[data-carousel-next]', car);
    const bar = $('[data-carousel-progress]', car);
    if (!track) return;
    const step = () => {
      const li = track.querySelector(':scope > li');
      const gap = parseFloat(getComputedStyle(track).columnGap) || 14;
      const per = li ? li.getBoundingClientRect().width + gap : 300;
      return Math.max(per, Math.floor(track.clientWidth / per) * per);
    };
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      if (bar) {
        const vis = Math.min(1, track.clientWidth / track.scrollWidth);
        const p = max > 0 ? track.scrollLeft / max : 0;
        bar.style.width = (vis * 100) + '%';
        bar.style.transform = `translateX(${(p * (1 / vis - 1)) * 100}%)`;
      }
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= max - 4;
    };
    prev && prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
    next && next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', update);
    update();

    // arrastar com mouse (toque já rola nativamente)
    let down = false, startX = 0, startL = 0, moved = false;
    track.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || track.scrollWidth <= track.clientWidth) return;
      down = true; moved = false; startX = e.clientX; startL = track.scrollLeft;
    });
    window.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('is-dragging'); }
      if (moved) track.scrollLeft = startL - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      if (moved) {
        track.classList.remove('is-dragging');
        const s = step() / Math.max(1, Math.floor(track.clientWidth / (track.querySelector(':scope > li')?.offsetWidth || 300)));
        track.scrollTo({ left: Math.round(track.scrollLeft / s) * s, behavior: 'smooth' });
        const kill = ev => { ev.preventDefault(); ev.stopPropagation(); };
        track.addEventListener('click', kill, { capture: true, once: true });
        setTimeout(() => track.removeEventListener('click', kill, { capture: true }), 50);
      }
    });
  });

  /* ---------- vídeos: tocam quando visíveis ---------- */
  const reels = $$('.reel video');
  const load = v => { if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); } };
  const play = v => {
    if (v.closest('.reel').classList.contains('is-paused')) return;
    load(v);
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  };
  reels.forEach(v => {
    v.addEventListener('playing', () => v.closest('.reel').classList.add('is-playing'));
    v.addEventListener('pause', () => v.closest('.reel').classList.remove('is-playing'));
    v.addEventListener('click', () => {
      const fig = v.closest('.reel');
      if (v.paused) { fig.classList.remove('is-paused'); load(v); v.play().catch(() => {}); }
      else { fig.classList.add('is-paused'); v.pause(); }
    });
  });
  if (hasIO && !reduce) {
    const vio = new IntersectionObserver(entries => {
      entries.forEach(en => { en.isIntersecting ? play(en.target) : en.target.pause(); });
    }, { threshold: 0.6 });
    reels.forEach(v => vio.observe(v));
  } else {
    reels.forEach(v => v.closest('.reel').classList.add('is-paused'));
  }

  /* ---------- lightbox ---------- */
  const dlg = $('[data-lightbox-dialog]');
  const FULL = { 'civic-estudio': 1080, 'abarth-pulse': 1080, 'ppf-concha': 1080, 'vitrificacao-certificado': 1080, 'interior-volante': 1080, 'fireball-frasco': 1080, 'byd-reflexo': 1080, 'andre-galdino': 1080, 'hidrorepelencia': 1077 };
  const full = src => src.replace(/([a-z-]+)-(640|1080)\.webp$/, (m, name) => `${name}-${FULL[name] || 720}.webp`);
  if (dlg && typeof dlg.showModal === 'function') {
    const img = $('[data-lightbox-img]', dlg);
    const cap = $('[data-lightbox-cap]', dlg);
    const count = $('[data-lightbox-count]', dlg);
    let group = [], idx = 0, opener = null;
    const show = i => {
      idx = (i + group.length) % group.length;
      const src = group[idx].querySelector('img');
      img.style.animation = 'none'; void img.offsetWidth; img.style.animation = '';
      img.src = full(src.currentSrc || src.src);
      img.alt = src.alt;
      cap.textContent = src.alt;
      count.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(group.length).padStart(2, '0')}`;
    };
    $$('[data-lightbox]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.lightbox[0];
        group = $$(`[data-lightbox^="${key}"]`);
        opener = btn;
        show(group.indexOf(btn));
        dlg.showModal();
      });
    });
    $('[data-lightbox-close]', dlg).addEventListener('click', () => dlg.close());
    $('[data-lightbox-prev]', dlg).addEventListener('click', () => show(idx - 1));
    $('[data-lightbox-next]', dlg).addEventListener('click', () => show(idx + 1));
    dlg.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    dlg.addEventListener('click', e => { if (e.target === dlg || e.target.classList.contains('lightbox__fig')) dlg.close(); });
    dlg.addEventListener('close', () => { opener && opener.focus(); });
    let tx = 0;
    dlg.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------- aberto agora (horário de João Pessoa) ---------- */
  const DAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  function nowInTz() {
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: CONFIG.timezone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      const get = t => parts.find(p => p.type === t).value;
      const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
      return { day: wd, min: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      const d = new Date(); return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }
  function status() {
    const { day, min } = nowInTz();
    const { days, from, to } = CONFIG.open;
    const openDay = days.includes(day);
    if (openDay && min >= from && min < to) return { open: true, text: 'Aberto agora · até 17h', day };
    if (openDay && min < from) return { open: false, text: 'Fechado · abre hoje às 07h30', day };
    let n = (day + 1) % 7, label = 'amanhã';
    while (!days.includes(n)) { n = (n + 1) % 7; label = DAYS[n]; }
    return { open: false, text: `Fechado · abre ${label} às 07h30`, day };
  }
  function paintStatus() {
    const s = status();
    $$('[data-live-status]').forEach(el => {
      el.textContent = s.text;
      el.classList.toggle('is-open', s.open);
      el.classList.toggle('is-closed', !s.open);
    });
    $$('.hours__table tr').forEach(tr => tr.classList.toggle('is-today', Number(tr.dataset.day) === s.day));
  }
  paintStatus();
  setInterval(paintStatus, 60000);


  /* ---------- formulário de agendamento -> WhatsApp ---------- */
  const form = $('#form-agendamento');
  if (form) {
    const f = {
      nome: $('#ag-nome'), whats: $('#ag-whats'), email: $('#ag-email'),
      servico: $('#ag-servico'), veiculo: $('#ag-veiculo'), data: $('#ag-data')
    };
    const btn = $('#ag-finalizar');
    const preview = $('[data-wa-preview]');
    const touched = new Set();

    // data mínima = hoje (fuso de João Pessoa)
    try {
      const today = new Intl.DateTimeFormat('en-CA', { timeZone: CONFIG.timezone }).format(new Date());
      f.data.min = today;
    } catch (e) {}

    // máscara: (83) 9 9102-4975 (celular) ou (83) 3222-0000 (fixo)
    f.whats.addEventListener('input', () => {
      const d = f.whats.value.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '').slice(0, 11);
      const ddd = d.slice(0, 2), rest = d.slice(2);
      let out = d.length ? '(' + ddd : '';
      if (d.length > 2) {
        out += ') ';
        if (d.length === 11) out += rest.slice(0, 1) + ' ' + rest.slice(1, 5) + '-' + rest.slice(5);
        else out += rest.length > 4 ? rest.slice(0, 4) + '-' + rest.slice(4) : rest;
      }
      f.whats.value = out;
    });

    const digits = () => f.whats.value.replace(/\D/g, '');
    const fmtDate = v => { if (!v) return ''; const [y, m, d] = v.split('-'); const wd = new Date(+y, +m - 1, +d).getDay(); return `${d}/${m}/${y} (${DAYS[wd]})`; };

    const rules = {
      nome: () => f.nome.value.trim().length >= 3 ? '' : 'Informe seu nome.',
      whats: () => /^\d{10,11}$/.test(digits()) ? '' : 'Informe um WhatsApp com DDD, ex.: (83) 9 9102-4975.',
      email: () => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim()) ? '' : 'Informe um e-mail válido.',
      servico: () => f.servico.value ? '' : 'Escolha o tipo de serviço.',
      data: () => {
        if (!f.data.value) return '';
        const [y, m, d] = f.data.value.split('-');
        if (new Date(+y, +m - 1, +d).getDay() === 0) return 'Domingo estamos fechados. Escolha outro dia.';
        if (f.data.min && f.data.value < f.data.min) return 'Escolha uma data a partir de hoje.';
        return '';
      }
    };
    const errEl = { nome: '#ag-nome-err', whats: '#ag-whats-err', email: '#ag-email-err', servico: '#ag-servico-err', data: '#ag-data-err' };

    function check(key, show) {
      const msg = rules[key]();
      const field = f[key].closest('.field');
      if (show) {
        $(errEl[key]).textContent = msg;
        field.classList.toggle('is-invalid', !!msg);
        field.classList.toggle('is-valid', !msg && !!f[key].value);
        f[key].setAttribute('aria-invalid', msg ? 'true' : 'false');
        if (msg) f[key].setAttribute('aria-describedby', errEl[key].slice(1)); else f[key].removeAttribute('aria-describedby');
      }
      return !msg;
    }

    function message() {
      const lines = [
        'Olá, Galdino\'s! Gostaria de agendar um atendimento.',
        '',
        `*Nome:* ${f.nome.value.trim()}`,
        `*WhatsApp:* ${f.whats.value.trim()}`,
        `*E-mail:* ${f.email.value.trim()}`,
        `*Serviço:* ${f.servico.value}`
      ];
      if (f.veiculo.value.trim()) lines.push(`*Veículo:* ${f.veiculo.value.trim()}`);
      if (f.data.value) lines.push(`*Dia de preferência:* ${fmtDate(f.data.value)}`);
      lines.push('', 'Aguardo a confirmação do horário. Obrigado!');
      return lines.join('\n');
    }

    function refresh() {
      const ok = Object.keys(rules).every(k => check(k, false));
      const msg = message();
      if (ok) {
        btn.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
        btn.dataset.ready = 'true';
        preview.textContent = msg;
      } else {
        btn.dataset.ready = 'false';
        const any = f.nome.value || f.whats.value || f.email.value || f.servico.value;
        preview.textContent = any ? msg : 'Preencha os campos para ver a mensagem.';
      }
      return ok;
    }

    Object.keys(f).forEach(k => {
      const el = f[k];
      el.addEventListener('input', () => { if (touched.has(k) && rules[k]) check(k, true); refresh(); });
      el.addEventListener('change', () => { if (rules[k]) { touched.add(k); check(k, true); } refresh(); });
      el.addEventListener('blur', () => { if (rules[k] && el.value) { touched.add(k); check(k, true); } });
    });

    btn.addEventListener('click', e => {
      const keys = Object.keys(rules);
      keys.forEach(k => { touched.add(k); check(k, true); });
      if (!refresh()) {
        e.preventDefault();
        const first = keys.find(k => !check(k, false));
        if (first) f[first].focus();
        btn.classList.remove('is-shake'); void btn.offsetWidth; btn.classList.add('is-shake');
      }
    });
    form.addEventListener('submit', e => { e.preventDefault(); btn.click(); });

    // o botão flutuante sai de cena enquanto o formulário está visível
    if (hasIO && fab) {
      new IntersectionObserver(en => fab.classList.toggle('is-muted', en[0].isIntersecting), { threshold: 0.15 }).observe(form);
    }
    refresh();
  }

  /* ---------- mapa Google (no site publicado) ---------- */
  const map = $('[data-map]');
  if (map && !window.__STATIC_MAP__) {
    const live = $('[data-map-live]', map);
    const mount = () => {
      const { lat, lng, zoom } = CONFIG.map;
      const f = document.createElement('iframe');
      f.title = "Mapa: Galdino's Estetic Car, Av. Juarez Távora, 1477, Torre, João Pessoa";
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.src = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&hl=pt-BR&output=embed`;
      f.addEventListener('load', () => live.classList.add('is-ready'));
      live.classList.add('is-locked');
      live.appendChild(f);
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'map__unlock'; btn.textContent = 'Mover o mapa';
      btn.addEventListener('click', () => {
        const on = map.classList.toggle('is-interactive');
        live.classList.toggle('is-locked', !on);
        btn.textContent = on ? 'Travar o mapa' : 'Mover o mapa';
      });
      map.appendChild(btn);
    };
    if (hasIO) {
      const mio = new IntersectionObserver(en => { if (en[0].isIntersecting) { mount(); mio.disconnect(); } }, { rootMargin: '400px' });
      mio.observe(map);
    } else mount();
  }
})();
