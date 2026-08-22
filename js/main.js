document.addEventListener('DOMContentLoaded', () => {

  /* --- Шапка при скролле --- */
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('is-stuck', scrollY > 60);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });

  /* --- Мобильное меню --- */
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('nav');
  const overlay = document.getElementById('overlay');
  const toggle = (open) => {
    nav.classList.toggle('is-open', open);
    overlay.classList.toggle('is-visible', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => toggle(!nav.classList.contains('is-open')));
  overlay.addEventListener('click', () => toggle(false));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));

  /* --- Появление блоков --- */
  const io = new IntersectionObserver((es) => {
    es.forEach((e, i) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add('is-visible'), i * 55);
      io.unobserve(e.target);
    });
  }, { threshold: .1, rootMargin: '0px 0px -40px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* --- Активный пункт меню --- */
  const links = [...document.querySelectorAll('.nav__link')];
  const spy = new IntersectionObserver((es) => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-30% 0px -60%' });
  document.querySelectorAll('main section[id]').forEach(s => spy.observe(s));

  /* --- Счётчики 250+ / 10+ / 50+ --- */
  document.querySelectorAll('.stats__num').forEach(el => {
    const target = parseInt(el.textContent, 10);
    const suffix = el.querySelector('i')?.outerHTML || '';
    const co = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      co.disconnect();
      let cur = 0;
      const step = Math.max(1, Math.round(target / 45));
      const t = setInterval(() => {
        cur = Math.min(target, cur + step);
        el.innerHTML = cur + suffix;
        if (cur >= target) clearInterval(t);
      }, 28);
    }, { threshold: .6 });
    co.observe(el);
  });

  /* --- Лайтбокс галереи --- */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbVideo = document.getElementById('lightboxVideo');
  const items = [...document.querySelectorAll('#galleryGrid .gcard')];
  let idx = 0;

  const show = i => {
    idx = (i + items.length) % items.length;
    const card = items[idx];
    const img = card.querySelector('img');
    const video = card.querySelector('video');

    if (video) {
      if (lbImg) lbImg.style.display = 'none';
      if (lbVideo) {
        lbVideo.style.display = 'block';
        const fullSrc = video.dataset.fullsrc || video.currentSrc || video.src;
        lbVideo.src = fullSrc;
        lbVideo.currentTime = 0;
        lbVideo.muted = false;
        lbVideo.play().catch(() => {});
      }
    } else if (img) {
      if (lbVideo) {
        lbVideo.pause();
        lbVideo.currentTime = 0;
        lbVideo.src = '';
        lbVideo.style.display = 'none';
      }
      if (lbImg) {
        lbImg.style.display = 'block';
        lbImg.src = img.src;
        lbImg.alt = img.alt || '';
      }
    }
  };

  const close = () => {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lbVideo) {
      lbVideo.pause();
      lbVideo.currentTime = 0;
      lbVideo.src = '';
      lbVideo.style.display = 'none';
    }
  };

  items.forEach((item, i) => item.addEventListener('click', () => {
    show(i);
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }));
  lb.querySelector('.lightbox__close')?.addEventListener('click', close);
  lb.querySelector('.lightbox__nav--prev')?.addEventListener('click', () => show(idx - 1));
  lb.querySelector('.lightbox__nav--next')?.addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  /* --- Маска телефона --- */
  document.querySelector('input[name="phone"]')?.addEventListener('input', e => {
    let d = e.target.value.replace(/\D/g, '');
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (!d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    let o = '+7';
    if (d.length > 1) o += ' (' + d.slice(1, 4);
    if (d.length >= 5) o += ') ' + d.slice(4, 7);
    if (d.length >= 8) o += '-' + d.slice(7, 9);
    if (d.length >= 10) o += '-' + d.slice(9, 11);
    e.target.value = o;
  });

  /* --- Форма --- */
  const form = document.getElementById('requestForm');
  const status = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');
  const consentChecks = form ? form.querySelectorAll('.form__check-input[required]') : [];

  const updateSubmitState = () => {
    if (!submitBtn) return;
    const allChecked = [...consentChecks].every(cb => cb.checked);
    submitBtn.disabled = !allChecked;
    submitBtn.classList.toggle('is-disabled', !allChecked);
  };

  consentChecks.forEach(cb => {
    cb.addEventListener('change', () => {
      const parent = cb.closest('.form__check');
      if (cb.checked) {
        parent?.classList.remove('has-error');
      }
      updateSubmitState();
    });
  });

  // Highlight checkboxes in red when clicking on locked button
  form?.addEventListener('click', (e) => {
    if (e.target.closest('#submitBtn') && submitBtn && submitBtn.disabled) {
      e.preventDefault();
      consentChecks.forEach(cb => {
        if (!cb.checked) {
          const parent = cb.closest('.form__check');
          parent?.classList.remove('has-error');
          void parent?.offsetWidth;
          parent?.classList.add('has-error');
        }
      });
      status.textContent = 'Для отправки необходимо подтвердить согласие с документами.';
    }
  });

  updateSubmitState();

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach(inp => {
      const f = inp.closest('.form__field-box') || inp.closest('.form__check') || inp.closest('.field');
      const valid = inp.type === 'checkbox' ? inp.checked
        : inp.name === 'phone' ? inp.value.replace(/\D/g, '').length === 11
        : inp.value.trim().length > 1;
      f?.classList.toggle('has-error', !valid);
      if (!valid) ok = false;
    });
    if (!ok) {
      status.textContent = 'Проверьте заполнение полей и согласий.';
      return;
    }
    status.textContent = 'Отправляем…';
    try {
      const payload = {
        'Имя': form.querySelector('[name="name"]')?.value || '',
        'Телефон': form.querySelector('[name="phone"]')?.value || '',
        'Тип объекта': form.querySelector('[name="type"]')?.value || 'Не указан',
        'Что необходимо оформить': form.querySelector('[name="message"]')?.value || 'Не указано',
        '_subject': 'Новая заявка с сайта АРТНЕО ЛАБОРАТОРИЯ',
        '_captcha': 'false'
      };

      let res = await fetch('send.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('https://formsubmit.co/ajax/aliancekd@yandex.ru', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res && res.ok) {
        form.reset();
        updateSubmitState();
        status.textContent = 'Спасибо! Свяжемся с вами в ближайшее время.';
      } else {
        throw new Error('Submit failed');
      }
    } catch {
      status.textContent = 'Не удалось отправить. Позвоните нам по телефону +7 (925) 535-30-08.';
    }
  });

  /* --- Cookie Banner --- */
  const cookieBanner = document.getElementById('cookieBanner');
  const cookieAccept = document.getElementById('cookieAccept');
  if (cookieBanner && !localStorage.getItem('artneolab_cookie_accepted')) {
    setTimeout(() => {
      cookieBanner.classList.add('is-visible');
    }, 1000);
  }
  cookieAccept?.addEventListener('click', () => {
    localStorage.setItem('artneolab_cookie_accepted', 'true');
    cookieBanner.classList.remove('is-visible');
  });

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
