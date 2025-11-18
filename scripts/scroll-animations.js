document.addEventListener('DOMContentLoaded', () => {
  const videoContainer = document.getElementById('video-container');
  const video = document.getElementById('bg-video');
  const videoSpacer = document.querySelector('.video-spacer');
  const logo = document.querySelector('.logo');

  // Animación de loader SVG (trazo en 1s)
  gsap.registerPlugin(ScrollTrigger);
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.ticker.fps(30);
  }
  const allImgsInit = () => {
    const firstMainImg = document.querySelector('.image-container .focus-frame > img');
    const imgs = document.querySelectorAll('img');
    imgs.forEach((img) => {
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    });
    if (firstMainImg) {
      firstMainImg.setAttribute('loading', 'eager');
      firstMainImg.setAttribute('fetchpriority', 'high');
      if (firstMainImg.decode) {
        firstMainImg.decode().catch(() => {});
      }
    }
    imgs.forEach((img) => {
      if (img !== firstMainImg) {
        if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
        if (!img.hasAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'low');
      }
    });
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(allImgsInit);
  } else {
    setTimeout(allImgsInit, 0);
  }
  const loader = document.getElementById('loader');
  const paths = document.querySelectorAll('#logoStroke path');
  paths.forEach(p => {
    const length = p.getTotalLength();
    p.style.strokeDasharray = length;
    p.style.strokeDashoffset = length;
  });
  // Timeline de GSAP para la animación de carga
  const tl = gsap.timeline();

  tl.to('#logoStroke path', { strokeDashoffset: 0, duration: 1.5, stagger: 0 })
    .to('#logoColor', { opacity: 1, duration: 0.8 }, "-=0.5") // Solapar para una transición más suave
    // Revela el logo desde el lado (izquierdo) con máscara sobredimensionada para evitar bordes visibles
    .fromTo(
      '.logo',
      {
        clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)'
      },
      {
        clipPath: 'polygon(-20% 0%, 120% 0%, 120% 100%, -20% 100%)',
        duration: 1.5,
        ease: 'power2.inOut'
      },
      "+=0.2"
    ) // Iniciar poco después de que el color aparezca
    .to('.loader', { 
        opacity: 0, 
        duration: 1, 
        onComplete: () => {
          if (document.querySelector('.loader')) {
            document.querySelector('.loader').style.display = 'none';
          }
        }
    }, "<") // Iniciar al mismo tiempo que la animación del clip-path
    // Mostrar y desvanecer el video de fondo tras el loader
    .set('#video-container', { display: 'block' })
    .fromTo('#video-container', { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' })
    .to('#bg-video', { scale: 1.02, duration: 6, ease: 'power1.inOut' }, "<")
    // Mostrar el prompt de "Descubrir más" bajo el logo
    .fromTo('#discoverPrompt', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, "<");

  // Ocultar el prompt "Descubrir más" en cuanto se inicia el primer scroll; reaparece solo al volver al top
  const discoverPrompt = document.getElementById('discoverPrompt');
  if (discoverPrompt) {
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

  // Animate the video to fade to black on scroll
  gsap.to(video, {
    opacity: 0,
    scrollTrigger: {
      trigger: videoSpacer,
      start: 'top top',
      end: '+=200',
      scrub: true,
      pin: true,
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

  gsap.to(logo, {
    autoAlpha: 0,
    scrollTrigger: {
      trigger: videoSpacer,
      start: 'top top',
      end: '+=200',
      scrub: true
    }
  });

  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
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
  const logoRoot = document.querySelector('.logo');
  if (logoLink && logoRoot) {
    const onMove = (e) => {
      const rect = logoLink.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      logoRoot.style.setProperty('--mx', x + 'px');
      logoRoot.style.setProperty('--my', y + 'px');
    };
    const onEnter = () => {
      logoRoot.style.setProperty('--r', '100px');
    };
    const onLeave = () => {
      logoRoot.style.setProperty('--r', '0px');
    };
    logoLink.addEventListener('mousemove', onMove);
    logoLink.addEventListener('mouseenter', onEnter);
    logoLink.addEventListener('mouseleave', onLeave);
  }

  


  // Fade-in difuminado solo del texto (h2 y p) entre imágenes al hacer scroll
  const textBlocks = document.querySelectorAll('.text-content');
  textBlocks.forEach((container) => {
    const items = container.querySelectorAll('h2, p');
    gsap.to(items, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: container,
        start: 'top 80%', // aparece antes al entrar el bloque
        end: 'top 60%',   // completa pronto para reducir espera
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Separadores: fade-in con blur antes de cada imagen
  const separators = document.querySelectorAll('.separator');
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

  const directImages = document.querySelectorAll('.image-container .focus-frame > img');
  directImages.forEach((img) => {
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

  const collageImgs = document.querySelectorAll('.focus-frame .collage-item img');
  collageImgs.forEach((img) => {
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
  const placeholderGif = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  const directManaged = Array.from(document.querySelectorAll('.image-container .focus-frame > img'));
  const directUnloadTimers = new Map();
  const prepareDirect = (imgs) => {
    imgs.forEach((img) => {
      if (!img.dataset.src) img.dataset.src = img.getAttribute('src');
      if (img.dataset.src) {
        img.removeAttribute('src');
        img.src = placeholderGif;
      }
      img.setAttribute('decoding', 'async');
      img.setAttribute('fetchpriority', 'low');
      img.setAttribute('loading', 'lazy');
      img.dataset.loaded = 'false';
      img.dataset.loading = 'false';
      img.style.visibility = 'hidden';
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
    img.style.visibility = 'visible';
    gsap.fromTo(img, { opacity: 0, filter: 'blur(16px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power2.out' });
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
  const unloadDirect = (img) => {
    if (!img || img.dataset.loaded !== 'true') return;
    gsap.to(img, { opacity: 0, filter: 'blur(16px)', duration: 0.4, ease: 'power2.in', onComplete: () => {
      img.src = placeholderGif;
      img.dataset.loaded = 'false';
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
      });
    }, { rootMargin: '600px 0px 600px 0px', threshold: 0 });
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
      img.removeAttribute('src');
      img.setAttribute('decoding', 'async');
      img.setAttribute('fetchpriority', 'low');
      img.setAttribute('loading', 'lazy');
      img.src = placeholderGif;
    });
  };
  prepareImgs([...collageTop, ...collageBot]);
  const preloadSrc = (src) => new Promise((resolve) => {
    const pre = new Image();
    pre.decoding = 'async';
    pre.loading = 'eager';
    pre.setAttribute('fetchpriority', 'low');
    pre.src = src;
    const done = () => resolve();
    if (pre.decode) {
      pre.decode().then(done).catch(() => { pre.onload = done; });
    } else {
      pre.onload = done;
    }
  });
  const runCollageSequence = async () => {
    const seq = [];
    const max = Math.max(collageTop.length, collageBot.length);
    for (let i = 0; i < max; i++) {
      if (collageTop[i]) seq.push(collageTop[i]);
      if (collageBot[i]) seq.push(collageBot[i]);
    }
    for (const img of seq) {
      const src = img.dataset.src;
      if (!src) continue;
      await preloadSrc(src);
      img.src = src;
      gsap.fromTo(img, { opacity: 0, filter: 'blur(16px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' });
    }
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
            [...collageTop, ...collageBot].forEach((img) => {
              gsap.to(img, { opacity: 0, filter: 'blur(16px)', duration: 0.4, ease: 'power2.in', onComplete: () => {
                img.src = placeholderGif;
                img.dataset.loaded = 'false';
              }});
            });
            started = false;
          }
        });
      }, { rootMargin: '400px 0px 400px 0px', threshold: 0 });
      io2.observe(collageWrap);
    } else {
      runCollageSequence();
    }
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

  footerContactBtn.addEventListener('click', openFooter);

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

  // ScrollTrigger para cerrar el formulario al hacer scroll hacia arriba
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

  function updateContactToggleVisibility() {
    if (!contactToggle) return;
    if (footerFormContainer.classList.contains('active')) {
      contactToggle.classList.add('hidden');
      contactToggle.style.opacity = '0';
    } else {
      contactToggle.classList.remove('hidden');
      contactToggle.style.opacity = '1';
    }
  }

  // Vincular el botón flotante para desplazar hacia el footer
  if (contactToggle) {
    contactToggle.addEventListener('click', openFooter);
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
      openFooter();
    });
  }

  if (menuHomeLink) {
    menuHomeLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeMenu();
      const restoreBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.documentElement.style.scrollBehavior = restoreBehavior || '';
      gsap.to(document.body, { opacity: 0, duration: 0.3, ease: 'power2.out', onComplete: () => location.reload() });
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