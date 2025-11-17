document.addEventListener('DOMContentLoaded', () => {
  const videoContainer = document.getElementById('video-container');
  const video = document.getElementById('bg-video');
  const videoSpacer = document.querySelector('.video-spacer');
  const logo = document.querySelector('.logo');

  // Animación de loader SVG (trazo en 1s)
  gsap.registerPlugin(ScrollTrigger);
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
      const target = document.querySelector('.text-content');
      if (!target) return;
      const absoluteTop = target.getBoundingClientRect().top + window.pageYOffset;
      const y = Math.max(0, absoluteTop - window.innerHeight * 0.80);
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

  // Desplazamiento del enfoque dentro del marco al hacer scroll
  const frameImages = document.querySelectorAll('.image-container .focus-frame img');
  frameImages.forEach((img) => {
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

  // Desplazamiento del enfoque dentro del marco al hacer scroll
  // frameImages already declared above; reuse existing NodeList
  frameImages.forEach((img) => {
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

  const footerContactBtn = document.getElementById('footerContactBtn');
  const footerFormContainer = document.getElementById('footerFormContainer');
  const contactToggle = document.getElementById('contactToggle');
  const menuToggle = document.getElementById('menuToggle');
  const sideMenu = document.getElementById('sideMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuContactLink = document.getElementById('menuContactLink');
  const menuHomeLink = document.getElementById('menuHomeLink');
  const contactForm = document.getElementById('contactFormElement');
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
    const pageFadeOverlay = document.getElementById('pageFadeOverlay');
    const tl = gsap.timeline();
    tl.to(pageFadeOverlay, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      .to(discoverPrompt, { autoAlpha: 0, duration: 0.25, ease: 'power2.out' }, '<')
      .add(() => {
        footerFormContainer.classList.add('active');
        gsap.set(footerFormContainer, { opacity: 0, visibility: 'hidden' });
        const itemsPre = footerFormContainer.querySelectorAll('.contact-form .form-header, .contact-form .form-group, .contact-form .submit-btn');
        gsap.killTweensOf(itemsPre);
        gsap.set(itemsPre, { opacity: 0, x: -60 });
        document.documentElement.style.scrollBehavior = 'auto';
        const headerEl = footerFormContainer.querySelector('.contact-form .form-header') || footerFormContainer;
        const absoluteTop = headerEl.getBoundingClientRect().top + window.pageYOffset;
        const nav = document.querySelector('.navbar');
        const navH = nav ? nav.offsetHeight : 0;
        const y = Math.max(0, absoluteTop - navH - 8);
        window.scrollTo({ top: y, behavior: 'auto' });
      })
      .to(pageFadeOverlay, { opacity: 0, duration: 0.3, ease: 'power2.out' })
      .add(() => {
        document.documentElement.style.scrollBehavior = restoreBehavior || '';
        gsap.set(footerFormContainer, { visibility: 'visible', opacity: 1 });
        if (discoverPrompt) gsap.set(discoverPrompt, { autoAlpha: 0 });
        const items = footerFormContainer.querySelectorAll('.contact-form .form-header, .contact-form .form-group, .contact-form .submit-btn');
        gsap.killTweensOf(items);
        gsap.to(items, { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out', stagger: 0.12 });
        updateSubmitState();
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
      document.body.style.overflow = '';
      if (contactToggle) {
        contactToggle.classList.remove('hidden');
        updateContactToggleVisibility();
      }
    }});
  }

  // ScrollTrigger para cerrar el formulario al hacer scroll hacia arriba
  ScrollTrigger.create({
    trigger: footerFormContainer,
    start: 'top bottom',
    end: 'bottom top',
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