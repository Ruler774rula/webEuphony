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
      sep.style.opacity = '1';
      sep.style.filter = 'none';
    });
  }

  const parallaxImgs = Array.from(document.querySelectorAll('.image-container .focus-frame > img'));
  const updateParallax = () => {
    const vh = window.innerHeight || 0;
    parallaxImgs.forEach((img) => {
      const container = img.closest('.image-container');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const total = rect.height + vh;
      if (total <= 0) return;
      const t = (rect.top + rect.height) / total;
      const y = -35 + (70 * t);
      img.style.setProperty('--py', y + '%');
    });
  };
  let rafId = null;
  const onScrollParallax = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      updateParallax();
    });
  };
  window.addEventListener('scroll', onScrollParallax, { passive: true });
  window.addEventListener('resize', onScrollParallax);
  updateParallax();
  // const placeholderGif = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  const markLoaded = (img) => {
    if (!img) return;
    if (img.complete && img.naturalWidth > 0) {
      img.dataset.loaded = 'true';
    } else {
      img.addEventListener('load', () => { img.dataset.loaded = 'true'; }, { once: true });
    }
  };
  parallaxImgs.forEach(markLoaded);
  const collageRows = document.querySelectorAll('.collage-row');
  const collageImgs = document.querySelectorAll('.focus-frame .collage-item img');
  collageImgs.forEach(markLoaded);
  const collageWrap = document.querySelector('.focus-frame .collage-track');
  if (collageWrap) {
    if ('IntersectionObserver' in window) {
      const io2 = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          collageImgs.forEach((img) => { if (img.complete && img.naturalWidth > 0) img.dataset.loaded = 'true'; });
        });
      }, { rootMargin: '500px 0px 500px 0px', threshold: 0 });
      io2.observe(collageWrap);
    }
  }
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
