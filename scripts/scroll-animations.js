document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('bg-video');
  const videoSpacer = document.querySelector('.video-spacer');
  const logo = document.querySelector('.logo');

  // Animación de loader SVG (trazo en 1s)
  gsap.registerPlugin(ScrollTrigger);
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.ticker.fps(30);
  }
  const isSmall = window.matchMedia('(max-width: 768px)').matches;
  const fadeSpan = isSmall ? 120 : 200;
  const isContact = document.body.classList.contains('contact-page');
  if (!isContact) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const qs = new URLSearchParams(location.search);
    const needTop = qs.get('top') === '1' || location.hash === '#top';
    if (needTop) {
      const restoreBehavior = document.documentElement.style.scrollBehavior;
      const forceTop = () => {
        document.documentElement.style.scrollBehavior = 'auto';
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo({ top: 0, behavior: 'auto' });
        document.documentElement.style.scrollBehavior = restoreBehavior || '';
      };
      forceTop();
      setTimeout(forceTop, 0);
      setTimeout(forceTop, 80);
      window.addEventListener('load', forceTop, { once: true });
      window.addEventListener('pageshow', forceTop, { once: true });
    }
  }
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) && !/CriOS|FxiOS/i.test(navigator.userAgent);
  if (isIOS) {
    document.querySelectorAll('.image-container, .collage-row').forEach((el) => {
      el.style.contentVisibility = 'visible';
    });
  }
  const isAndroidChrome = /Android/i.test(navigator.userAgent) && /Chrome/i.test(navigator.userAgent);
  if (isAndroidChrome) {
    document.querySelectorAll('.image-container, .collage-row').forEach((el) => {
      el.style.contentVisibility = 'visible';
    });
  }
  const allImgsInit = () => {
    const mainImgs = Array.from(document.querySelectorAll('.image-container .focus-frame > img'));
    const firstThreeMain = mainImgs.slice(0, 3);
    const imgs = document.querySelectorAll('img');
    imgs.forEach((img) => {
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
      if (firstThreeMain.includes(img)) {
        img.setAttribute('loading', 'eager');
        img.setAttribute('fetchpriority', 'high');
      } else {
        if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
        if (!img.hasAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'low');
      }
      img.onerror = () => {
        console.error(`Error loading image: ${img.src}`);
        img.classList.add('errored-image'); // Add a class to style errored images
        // Optionally, replace with a placeholder or retry loading
        // img.src = './placeholder.jpg'; 
      };
    });
    firstThreeMain.forEach((im) => {
      if (im && im.decode) {
        im.decode().catch(() => {});
      }
    });
  };
  allImgsInit();
  if (!isContact) {
    const paths = document.querySelectorAll('#logoStroke path');
    paths.forEach(p => {
      const length = p.getTotalLength();
      p.style.strokeDasharray = length;
      p.style.strokeDashoffset = length;
    });
    const tl = gsap.timeline();
    tl.to('#logoStroke path', { strokeDashoffset: 0, duration: 1.5, stagger: 0 })
      .to('#logoColor', { opacity: 1, duration: 0.8 }, "-=0.5")
      .fromTo(
        '.logo',
        { clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' },
        { clipPath: 'polygon(-20% 0%, 120% 0%, 120% 100%, -20% 100%)', duration: 1.5, ease: 'power2.inOut' },
        "+=0.2"
      )
      .to('.loader', { 
          opacity: 0, 
          duration: 1, 
          onComplete: () => {
            if (document.querySelector('.loader')) {
              document.querySelector('.loader').style.display = 'none';
            }
          }
      }, "<")
      .set('#video-container', { display: 'block' })
      .fromTo('#video-container', { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' })
      .to('#bg-video', { scale: 1.02, duration: 6, ease: 'power1.inOut' }, "<")
      .fromTo('#discoverPrompt', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, "<");
  } else {
    const container = document.getElementById('footerFormContainer');
    const itemsPre = container ? container.querySelectorAll('.contact-form .form-header, .contact-form .form-group, .contact-form .submit-btn') : [];
    if (container) {
      gsap.killTweensOf(container);
      gsap.set(container, { opacity: 0, visibility: 'hidden' });
    }
    if (itemsPre && itemsPre.length) {
      gsap.killTweensOf(itemsPre);
      gsap.set(itemsPre, { opacity: 0, x: -60, visibility: 'hidden' });
    }
    const restoreBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.documentElement.style.scrollBehavior = restoreBehavior || '';
    const tlc = gsap.timeline();
    tlc.to(document.body, { opacity: 1, duration: 0.35, ease: 'power2.out' })
      .add(() => {
        if (container) gsap.set(container, { visibility: 'visible', opacity: 1 });
      })
      .to(itemsPre, { opacity: 1, x: 0, autoAlpha: 1, duration: 1.1, ease: 'power3.out', stagger: 0.12 });
  }

  // Ocultar el prompt "Descubrir más" en cuanto se inicia el primer scroll; reaparece solo al volver al top
  const discoverPrompt = document.getElementById('discoverPrompt');
  if (!isContact && discoverPrompt) {
    // Si la página no está en el tope al cargar, mantener oculto
    if (window.scrollY > 0) {
      gsap.set(discoverPrompt, { autoAlpha: 0 });
    }

    let hidden = window.scrollY > 0;
    const onScroll = () => {
      const atTop = window.scrollY <= 0;
      if (!atTop && !hidden) {
        hidden = true;
        gsap.to(discoverPrompt, { autoAlpha: 0, duration: 0.3, ease: 'power2.out' });
      } else if (atTop && hidden) {
        hidden = false;
        gsap.to(discoverPrompt, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    discoverPrompt.addEventListener('click', () => {
      const frame = document.querySelector('.image-container .focus-frame');
      if (!frame) return;
      const nav = document.querySelector('.navbar');
      const navH = nav ? nav.offsetHeight : 0;
      const rect = frame.getBoundingClientRect();
      const frameTopAbs = rect.top + window.pageYOffset;
      const frameH = rect.height;
      const vh = window.innerHeight;
      const y = Math.max(0, frameTopAbs - ((vh - frameH) / 2) - (navH / 2));
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  }

  if (!isContact && videoSpacer && video) {
    gsap.to(video, {
      opacity: 0,
      scrollTrigger: {
        trigger: videoSpacer,
        start: 'top top',
        end: '+=' + fadeSpan,
        scrub: true,
        pin: !isSmall,
        ease: 'power1.out',
        onLeave: () => {
          const srcEl = video ? video.querySelector('source') : null;
          if (video) {
            video.pause();
            if (srcEl) {
              if (!srcEl.dataset.src) srcEl.dataset.src = srcEl.src;
              srcEl.removeAttribute('src');
              video.load();
            }
          }
        },
        onEnterBack: () => {
          const srcEl = video ? video.querySelector('source') : null;
          if (video && srcEl && srcEl.dataset.src) {
            srcEl.src = srcEl.dataset.src;
            video.load();
            const p = video.play();
            if (p && p.catch) p.catch(() => {});
          }
        }
      },
    });
  }

  if (!isContact && videoSpacer && logo) {
    gsap.to(logo, {
      autoAlpha: 0,
      scrollTrigger: {
        trigger: videoSpacer,
        start: 'top top',
        end: '+=' + fadeSpan,
        scrub: true
      }
    });
  }

  const mainContent = document.querySelector('.main-content');
  if (!isContact && mainContent && videoSpacer) {
    gsap.set(mainContent, { autoAlpha: 0 });
    ScrollTrigger.create({
      trigger: videoSpacer,
      start: 'top top',
      end: '+=200',
      onLeave: () => gsap.to(mainContent, { autoAlpha: 1, duration: 0.2 }),
      onEnterBack: () => gsap.set(mainContent, { autoAlpha: 0 })
    });
  }

  const logoLink = document.querySelector('.logo-link');
  if (logoLink && logo) {
    const onMove = (e) => {
      const rect = logoLink.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      logo.style.setProperty('--mx', x + 'px');
      logo.style.setProperty('--my', y + 'px');
    };
    const onEnter = () => {
      logo.style.setProperty('--r', '100px');
    };
    const onLeave = () => {
      logo.style.setProperty('--r', '0px');
    };
    logoLink.addEventListener('mousemove', onMove);
    logoLink.addEventListener('mouseenter', onEnter);
    logoLink.addEventListener('mouseleave', onLeave);
  }

  


  
  // const textBlocks = document.querySelectorAll('.text-content');

  // Separadores: fade-in con blur antes de cada imagen
  const separators = document.querySelectorAll('.separator');
  if (!isSmall) {
    separators.forEach((sep) => {
      gsap.to(sep, {
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sep,
          start: 'top 85%',
          end: 'top 75%',
          toggleActions: 'play none none reverse'
        }
      });
    });
  }

  const setupParallax = (nodeList) => {
    nodeList.forEach((img) => {
      const container = img.closest('.image-container');
      if (!container) return;
      gsap.fromTo(img, { yPercent: -35 }, {
        yPercent: 35,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  };

  if (!isSmall) {
    setupParallax(document.querySelectorAll('.image-container .focus-frame > img'));
    setupParallax(document.querySelectorAll('.focus-frame .collage-item img'));
  }
  // const placeholderGif = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  const directManaged = Array.from(document.querySelectorAll('.image-container .focus-frame > img'));
  const directUnloadTimers = new Map();
  const prepareDirect = (imgs) => {
    imgs.forEach((img) => {
      if (!img.dataset.src) img.dataset.src = img.getAttribute('src');
      if (img.dataset.src) {
        if (!isSmall) {
          img.removeAttribute('src');
          img.style.display = 'none';
        } else {
          img.src = img.dataset.src;
        }
      }
      img.setAttribute('decoding', 'async');
      img.setAttribute('fetchpriority', 'low');
      img.setAttribute('loading', 'lazy');
      if (isSmall && img.complete && img.naturalWidth > 0) {
        img.dataset.loaded = 'true';
      } else {
        img.dataset.loaded = 'false';
      }
      img.dataset.loading = 'false';
      img.style.visibility = isSmall ? 'visible' : 'hidden';
    });
  };
  prepareDirect(directManaged);
  const preloadImg = (src) => new Promise((resolve) => {
    const pre = new Image();
    pre.decoding = 'async';
    pre.loading = 'eager';
    pre.setAttribute('fetchpriority', 'high');
    pre.src = src;
    const done = () => resolve();
    if (pre.decode) {
      pre.decode().then(done).catch(() => { pre.onload = done; });
    } else {
      pre.onload = done;
    }
    pre.onerror = done;
  });
  const directQueue = [];
  let directLoading = false;
  const processDirectQueue = async () => {
    if (directLoading || directQueue.length === 0) return;
    directLoading = true;
    const img = directQueue.shift();
    if (!img || img.dataset.loading === 'true' || img.dataset.loaded === 'true') {
      directLoading = false;
      processDirectQueue();
      return;
    }
    const src = img.dataset.src;
    if (!src) {
      directLoading = false;
      processDirectQueue();
      return;
    }
    img.dataset.loading = 'true';
    await preloadImg(src);
    img.src = src;
    img.style.display = '';
    img.style.visibility = 'visible';
    gsap.fromTo(img, { opacity: 0, filter: 'blur(16px)' }, { opacity: 1, filter: 'blur(0px)', duration: 1.0, ease: 'power2.out' });
    img.dataset.loaded = 'true';
    img.dataset.loading = 'false';
    directLoading = false;
    processDirectQueue();
  };
  const enqueueDirect = (img) => {
    if (!img || img.dataset.loaded === 'true' || img.dataset.loading === 'true') return;
    directQueue.push(img);
    processDirectQueue();
  };
  // Persistir y cargar siempre las primeras 3 imágenes principales
  const directPersist = directManaged.slice(0, 3);
  directPersist.forEach((img) => {
    img.dataset.persist = 'true';
    img.setAttribute('loading', 'eager');
    img.setAttribute('fetchpriority', 'high');
    enqueueDirect(img);
  });
  const forceLoadPersist = async (imgs) => {
    for (const img of imgs) {
      if (!img) continue;
      let src = img.dataset.src || img.getAttribute('src');
      if (!src) continue;
      img.dataset.loading = 'true';
      img.src = src;
      img.style.display = '';
      img.style.visibility = 'visible';
      try { if (img.decode) { await img.decode(); } } catch {}
      if (!(img.complete && img.naturalWidth > 0)) {
        const bust = src + (src.includes('?') ? '&' : '?') + 'v=' + Date.now();
        src = bust;
        img.src = bust;
        try { if (img.decode) { await img.decode(); } } catch {}
      }
      gsap.to(img, { opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' });
      img.dataset.loaded = 'true';
      img.dataset.loading = 'false';
    }
  };
  forceLoadPersist(directPersist);
  const unloadDirect = (img) => {
    if (!img || img.dataset.loaded !== 'true') return;
    if (img.dataset.persist === 'true') return;
    if (isSmall) return;
    gsap.to(img, { opacity: 0, filter: 'blur(16px)', duration: 0.4, ease: 'power2.in', onComplete: () => {
      img.removeAttribute('src');
      img.dataset.loaded = 'false';
      img.style.display = 'none';
      img.style.visibility = 'hidden';
    }});
  };
  if ('IntersectionObserver' in window) {
    const ioD = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const img = e.target;
        if (e.isIntersecting) {
          const t = directUnloadTimers.get(img);
          if (t) { clearTimeout(t); directUnloadTimers.delete(img); }
          enqueueDirect(img);
        } else {
          if (img.dataset.persist === 'true') {
            enqueueDirect(img);
          } else {
            const h = setTimeout(() => {
              const rect = img.getBoundingClientRect();
              const margin = 300;
              const offscreen = (rect.bottom < -margin) || (rect.top > (window.innerHeight + margin));
              if (offscreen) {
                unloadDirect(img);
              } else {
                enqueueDirect(img);
              }
            }, 1500);
            directUnloadTimers.set(img, h);
          }
        }
      });
    }, { rootMargin: '800px 0px 800px 0px', threshold: 0 });
    directManaged.forEach((img) => ioD.observe(img));
  } else {
    directManaged.forEach((img) => enqueueDirect(img));
  }
  const collageTop = Array.from(document.querySelectorAll('.collage-row.row-top .collage-item img'));
  const collageBot = Array.from(document.querySelectorAll('.collage-row.row-bot .collage-item img'));
  const prepareImgs = (imgs) => {
    imgs.forEach((img) => {
      const src = img.getAttribute('src');
      if (src && !img.dataset.src) {
        img.dataset.src = src;
      }
      if (isSmall) {
        if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
        img.setAttribute('fetchpriority', 'low');
        img.style.display = '';
        img.dataset.loaded = (img.complete && img.naturalWidth > 0) ? 'true' : 'false';
      } else {
        img.removeAttribute('src');
        img.setAttribute('decoding', 'async');
        img.setAttribute('fetchpriority', 'low');
        img.setAttribute('loading', 'lazy');
        img.style.display = 'none';
        img.dataset.loaded = 'false';
      }
    });
  };
  prepareImgs([...collageTop, ...collageBot]);
  const preloadSrc = (src, priority = 'low') => new Promise((resolve) => {
    const pre = new Image();
    pre.decoding = 'async';
    pre.loading = 'eager';
    pre.setAttribute('fetchpriority', priority);
    pre.src = src;
    const done = () => resolve();
    if (pre.decode) {
      pre.decode().then(done).catch(() => { pre.onload = done; });
    } else {
      pre.onload = done;
    }
    pre.onerror = done;
  });
  const waitForLoad = (img) => new Promise((resolve, reject) => {
    if (img.complete && img.naturalWidth > 0) { resolve(); return; }
    const onload = () => resolve();
    const onerror = () => reject();
    img.addEventListener('load', onload, { once: true });
    img.addEventListener('error', onerror, { once: true });
  });
  const runCollageSequence = async () => {
    const all = [...collageTop, ...collageBot].filter(Boolean);
    let concurrency = Math.min(3, all.length);
    const conn = navigator.connection;
    if (conn) {
      const t = conn.effectiveType || '4g';
      const dl = typeof conn.downlink === 'number' ? conn.downlink : 0;
      if (t === '4g') {
        concurrency = Math.min(dl >= 15 ? 6 : 5, all.length);
      } else if (t === '3g') {
        concurrency = Math.min(4, all.length);
      } else {
        concurrency = Math.min(2, all.length);
      }
    }
    const priorityCount = Math.min(6, all.length);
    for (let i = 0; i < priorityCount; i++) {
      const img = all[i];
      const src = img && img.dataset ? img.dataset.src : null;
      if (src) {
        await preloadSrc(src, 'high');
      }
    }
    let index = 0;
    const worker = async () => {
      while (index < all.length) {
        const img = all[index++];
        if (!img || img.dataset.loaded === 'true') continue;
        const src = img.dataset.src;
        if (!src) continue;
        img.style.visibility = 'hidden';
        let ok = false;
        for (let attempt = 0; attempt < 3 && !ok; attempt++) {
          await preloadSrc(src);
          img.src = src;
          img.style.display = '';
          try {
            if (img.decode) { await img.decode(); } else { await waitForLoad(img); }
          } catch {}
          if (img.complete && img.naturalWidth > 0) { ok = true; break; }
          img.removeAttribute('src');
          img.style.display = 'none';
          await new Promise((r) => setTimeout(r, 250));
        }
        if (!ok) {
          const bust = src + (src.includes('?') ? '&' : '?') + 'v=' + Date.now();
          await preloadSrc(bust);
          img.src = bust;
          img.style.display = '';
          try { if (img.decode) { await img.decode(); } else { await waitForLoad(img); } } catch {}
          if (!(img.complete && img.naturalWidth > 0)) { continue; }
        }
        if (!ok) { continue; }
        img.style.visibility = 'visible';
        img.style.display = '';
        gsap.fromTo(img, { opacity: 0, filter: 'blur(16px)' }, { opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power2.out', onComplete: () => { img.dataset.loaded = 'true'; } });
      }
    };
    const tasks = [];
    for (let i = 0; i < concurrency; i++) tasks.push(worker());
    await Promise.all(tasks);
  };
  const reloadCollageImage = async (img) => {
    if (!img) return;
    if (img.dataset.reloading === 'true') return;
    const src = img.dataset.src || img.getAttribute('src');
    if (!src) return;
    img.dataset.reloading = 'true';
    await new Promise((resolve) => {
      gsap.to(img, { opacity: 0, filter: 'blur(16px)', duration: 0.25, ease: 'power2.in', onComplete: resolve });
    });
    img.dataset.loaded = 'false';
    img.style.visibility = 'hidden';
    img.removeAttribute('src');
    img.style.display = 'none';
    let ok = false;
    for (let attempt = 0; attempt < 3 && !ok; attempt++) {
      await preloadSrc(src);
      img.src = src;
      img.style.display = '';
      try {
        if (img.decode) { await img.decode(); } else { await waitForLoad(img); }
      } catch {}
      if (img.complete && img.naturalWidth > 0) { ok = true; break; }
      img.removeAttribute('src');
      img.style.display = 'none';
      await new Promise((r) => setTimeout(r, 250));
    }
    if (!ok) {
      const bust = src + (src.includes('?') ? '&' : '?') + 'v=' + Date.now();
      await preloadSrc(bust);
      img.src = bust;
      img.style.display = '';
      try { if (img.decode) { await img.decode(); } else { await waitForLoad(img); } } catch {}
      if (!(img.complete && img.naturalWidth > 0)) { img.dataset.reloading = 'false'; return; }
      ok = true;
    }
    if (!ok) { img.dataset.reloading = 'false'; return; }
    img.style.visibility = 'visible';
    gsap.fromTo(img, { opacity: 0, filter: 'blur(16px)' }, { opacity: 1, filter: 'blur(0px)', duration: 1.0, ease: 'power2.out', onComplete: () => { img.dataset.loaded = 'true'; img.dataset.reloading = 'false'; } });
  };
  const collageWrap = document.querySelector('.focus-frame .collage-track');
  if (collageWrap) {
    if ('IntersectionObserver' in window) {
      let started = false;
      const io2 = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started) {
            started = true;
            runCollageSequence();
          } else if (!e.isIntersecting && started) {
            const allImgs = [...collageTop, ...collageBot].filter(Boolean);
            allImgs.sort(() => Math.random() - 0.5);
            const count = Math.ceil(allImgs.length * 0.5);
            for (let i = 0; i < count; i++) {
              const img = allImgs[i];
              if (!img) continue;
              gsap.to(img, { opacity: 0, filter: 'blur(16px)', duration: 0.4, ease: 'power2.in', onComplete: () => {
                img.removeAttribute('src');
                img.dataset.loaded = 'false';
                img.style.display = 'none';
              }});
            }
            started = false;
          }
        });
      }, { rootMargin: '1000px 0px 1000px 0px', threshold: 0 });
      io2.observe(collageWrap);
      if (isSmall && !started) { started = true; runCollageSequence(); }
    } else {
      runCollageSequence();
    }
  }
  const collageItems = document.querySelectorAll('.focus-frame .collage-item');
  if (collageItems.length) {
    collageItems.forEach((item) => {
      item.addEventListener('mouseenter', () => {
        const img = item.querySelector('img');
        if (!img) return;
        reloadCollageImage(img);
      });
    });
  }
  const collageRows = document.querySelectorAll('.collage-row');
  if (collageRows.length) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
        });
      }, { threshold: 0.01 });
      collageRows.forEach((row) => {
        row.style.animationPlayState = 'paused';
        io.observe(row);
      });
    } else {
      collageRows.forEach((row) => {
        row.style.animationPlayState = 'running';
      });
    }
  }

  const footerContactBtn = document.getElementById('footerContactBtn');
  const footerFormContainer = document.getElementById('footerFormContainer');
  const footerEl = document.getElementById('footer');
  const contactToggle = document.getElementById('contactToggle');
  const menuToggle = document.getElementById('menuToggle');
  const sideMenu = document.getElementById('sideMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuContactLink = document.getElementById('menuContactLink');
  const menuHomeLink = document.getElementById('menuHomeLink');
  const contactForm = document.getElementById('contactFormElement');
  const pageFadeOverlay = document.getElementById('pageFadeOverlay');
  let overlayActive = false;
  const submitBtnEl = contactForm ? contactForm.querySelector('.submit-btn') : null;
  const updateSubmitState = () => {
    if (!contactForm || !submitBtnEl) return;
    submitBtnEl.disabled = !contactForm.checkValidity();
  };
  if (contactForm) {
    contactForm.addEventListener('input', updateSubmitState);
    contactForm.addEventListener('change', updateSubmitState);
    updateSubmitState();
  }

  function openFooter() {
    const restoreBehavior = document.documentElement.style.scrollBehavior;
    gsap.killTweensOf(footerFormContainer);
    const tl = gsap.timeline();
    tl.to(pageFadeOverlay, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      .to(discoverPrompt, { autoAlpha: 0, duration: 0.25, ease: 'power2.out' }, '<')
      .add(() => {
        if (footerEl) footerEl.classList.add('modal-active');
        footerFormContainer.classList.add('active');
        gsap.set(footerFormContainer, { opacity: 0, visibility: 'hidden' });
        const itemsPre = footerFormContainer.querySelectorAll('.contact-form .form-header, .contact-form .form-group, .contact-form .submit-btn');
        gsap.killTweensOf(itemsPre);
        gsap.set(itemsPre, { opacity: 0, x: -60, visibility: 'hidden' });
        document.documentElement.style.scrollBehavior = 'auto';
        const headerEl = footerFormContainer.querySelector('.contact-form .form-header') || footerFormContainer;
        const formEl = footerFormContainer.querySelector('.contact-form') || footerFormContainer;
        const absoluteTop = headerEl.getBoundingClientRect().top + window.pageYOffset;
        const formTop = formEl.getBoundingClientRect().top + window.pageYOffset;
        const formH = formEl.getBoundingClientRect().height;
        const nav = document.querySelector('.navbar');
        const navH = nav ? nav.offsetHeight : 0;
        const vh = window.innerHeight;
        const hasSpace = (vh - navH - 16) >= formH;
        let y;
        if (hasSpace) {
          const centerOffset = ((vh - navH) - formH) / 2;
          y = Math.max(0, formTop - navH - centerOffset);
        } else {
          y = Math.max(0, absoluteTop - navH - 8);
        }
        window.scrollTo({ top: y, behavior: 'auto' });
      })
      .add(() => {
        document.documentElement.style.scrollBehavior = restoreBehavior || '';
        gsap.set(footerFormContainer, { visibility: 'visible', opacity: 1 });
        if (discoverPrompt) gsap.set(discoverPrompt, { autoAlpha: 0 });
        const items = footerFormContainer.querySelectorAll('.contact-form .form-header, .contact-form .form-group, .contact-form .submit-btn');
        gsap.killTweensOf(items);
        gsap.to(items, { opacity: 1, x: 0, autoAlpha: 1, duration: 1.1, ease: 'power3.out', stagger: 0.12, onComplete: updateSubmitState });
        overlayActive = true;
      });
    if (contactToggle) {
      contactToggle.classList.add('hidden');
      contactToggle.style.opacity = '0';
    }
  }

  function navigateWithFade(url) {
    if (pageFadeOverlay) {
      gsap.set(pageFadeOverlay, { opacity: 0 });
      gsap.to(pageFadeOverlay, { opacity: 1, duration: 0.35, ease: 'power2.out', onComplete: () => { location.href = url; } });
    } else {
      gsap.to(document.body, { opacity: 0, duration: 0.35, ease: 'power2.out', onComplete: () => { location.href = url; } });
    }
  }
  if (footerContactBtn) {
    footerContactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (footerFormContainer) {
        openFooter();
      } else {
        navigateWithFade('./contacta.html');
      }
    });
  }

  // Función para cerrar el formulario del footer
  function closeFooter() {
    gsap.to(footerFormContainer, { opacity: 0, y: 100, duration: 0.4, ease: 'power2.in', onComplete: () => {
      footerFormContainer.classList.remove('active');
      gsap.set(footerFormContainer, { clearProps: 'opacity,transform,visibility' });
      if (footerEl) footerEl.classList.remove('modal-active');
      document.body.style.overflow = '';
      if (contactToggle) {
        contactToggle.classList.remove('hidden');
        updateContactToggleVisibility();
      }
    }});
    overlayActive = false;
    if (pageFadeOverlay) gsap.set(pageFadeOverlay, { opacity: 0 });
  }

  if (footerFormContainer && !footerFormContainer.classList.contains('active')) {
    ScrollTrigger.create({
      trigger: footerFormContainer,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        if (overlayActive && self.direction === -1) {
          overlayActive = false;
          if (pageFadeOverlay) gsap.to(pageFadeOverlay, { opacity: 0, duration: 0.3, ease: 'power2.out' });
        }
      },
      onLeaveBack: () => {
        if (footerFormContainer.classList.contains('active')) {
          closeFooter();
        }
      },
    });
  }

  function updateContactToggleVisibility() {
    if (!contactToggle) return;
    if (footerFormContainer && footerFormContainer.classList.contains('active')) {
      contactToggle.classList.add('hidden');
      contactToggle.style.opacity = '0';
    } else {
      contactToggle.classList.remove('hidden');
      contactToggle.style.opacity = '1';
    }
  }

  if (contactToggle) {
    contactToggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (footerFormContainer) {
        openFooter();
      } else {
        navigateWithFade('./contacta.html');
      }
    });
  }

  // Actualizar en scroll y resize
  window.addEventListener('scroll', updateContactToggleVisibility, { passive: true });
  window.addEventListener('resize', updateContactToggleVisibility);
  // Inicial
  updateContactToggleVisibility();

  function openMenu() {
    if (sideMenu) sideMenu.classList.add('open');
    if (menuOverlay) menuOverlay.classList.add('open');
  }

  function closeMenu() {
    if (sideMenu) sideMenu.classList.remove('open');
    if (menuOverlay) menuOverlay.classList.remove('open');
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', openMenu);
  }
  if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMenu);
  }

  const closeMenuButton = document.getElementById('closeMenuButton');
  if (closeMenuButton) {
    closeMenuButton.addEventListener('click', closeMenu);
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
  if (menuContactLink) {
    menuContactLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeMenu();
      if (footerFormContainer && !footerFormContainer.classList.contains('active')) {
        openFooter();
      } else {
        navigateWithFade('./contacta.html');
      }
    });
  }

  if (menuHomeLink) {
    menuHomeLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeMenu();
      navigateWithFade('./index.html?top=1');
    });
  }

  const volverHeaderLink = document.getElementById('volverHeaderLink');
  if (volverHeaderLink) {
    volverHeaderLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigateWithFade('./index.html?top=1');
    });
  }

  const navbar = document.querySelector('.navbar');
  const firstImage = document.querySelector('.image-container');
  if (navbar && firstImage) {
    ScrollTrigger.create({
      trigger: firstImage,
      start: 'top top',
      onEnter: () => navbar.classList.add('dark'),
      onLeaveBack: () => navbar.classList.remove('dark')
    });
  }

});