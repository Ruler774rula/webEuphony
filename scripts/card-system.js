/**
 * Sistema de Cards Superpuestas con Detección de Scroll
 * Maneja la navegación entre secciones tipo "card" con transiciones suaves.
 * Optimizado para Safari, iOS y dispositivos móviles.
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('card-scroll-container');
  if (!container) return;

  // --- Viewport height fix para iOS Safari (barra de dirección dinámica) ---
  // 100vh en iOS Safari incluye el chrome del navegador; --vh usa window.innerHeight real.
  const setVH = () => {
    document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
  };
  setVH();
  window.addEventListener('resize', setVH, { passive: true });
  // orientationchange dispara antes de que el navegador recalcule innerHeight en iOS
  window.addEventListener('orientationchange', () => setTimeout(setVH, 100), { passive: true });

  const cards = Array.from(document.querySelectorAll('.card-section'));
  const indicators = document.querySelectorAll('.scroll-indicators .indicator');
  const totalCards = cards.length;
  let currentIndex = 0;
  let isAnimating = false;
  let lastScrollTime = 0;
  const animationDuration = 1000; // ms (coincide con la transición CSS)
  const scrollCooldown = 1200;    // ms entre cambios de card

  /**
   * Promesa que resuelve cuando termina la transición `transform` de un elemento,
   * con timeout de seguridad por si transitionend no dispara (Safari older, display:none, etc.)
   */
  function onceTransitionEnd(el) {
    return new Promise(resolve => {
      let resolved = false;
      const finish = () => {
        if (resolved) return;
        resolved = true;
        el.removeEventListener('transitionend', onEnd);
        resolve();
      };
      const onEnd = (e) => {
        if (e.target === el && e.propertyName === 'transform') finish();
      };
      el.addEventListener('transitionend', onEnd);
      // Fallback: si transitionend no llega (bug en Safari/FF en ciertos casos)
      setTimeout(finish, animationDuration + 200);
    });
  }

  // Inicializar estado de las cards
  function init() {
    cards.forEach((card, index) => {
      card.style.transition = 'none';
      if (index === 0) {
        card.classList.add('active');
        card.style.transform = 'translateY(0)';
        card.style.zIndex = 10;
      } else {
        card.classList.remove('active');
        card.style.transform = 'translateY(100%)';
        card.style.zIndex = 10 + index;
      }
    });
    updateIndicators();
    triggerCardAnimations(0);
  }

  // Estado para controlar si el formulario debe mostrarse por defecto
  let isContactFormActive = false;

  // Ir a una card específica
  function goToCard(index, immediateForm = false) {
    if (index < 0 || index >= totalCards || index === currentIndex || isAnimating) return;

    isAnimating = true;
    const direction = index > currentIndex ? 'down' : 'up';
    const prevIndex = currentIndex;
    currentIndex = index;

    if (index === 3 && immediateForm) {
      isContactFormActive = true;
    }

    updateIndicators();
    checkNavbarContrast();

    // Posicionar cards intermedias sin animación (fuera del campo visual)
    const updateIntermediates = () => {
      cards.forEach((card, i) => {
        if (i !== currentIndex && i !== prevIndex) {
          card.style.transition = 'none';
          // Forzar reflow para que transition:none se aplique ANTES de cambiar transform
          void card.offsetWidth;
          if (i < currentIndex) {
            card.style.transform = 'translateY(0)';
            card.classList.add('active');
          } else {
            card.style.transform = 'translateY(100%)';
            card.classList.remove('active');
          }
        }
      });
    };

    // Al subir: las intermedias se posicionan ANTES para que queden visibles bajo la card superior
    if (direction === 'up') {
      updateIntermediates();
    }

    const easing = 'cubic-bezier(0.65, 0, 0.35, 1)';
    const transitionStr = `transform ${animationDuration / 1000}s ${easing}`;

    if (direction === 'down') {
      const nextCard = cards[currentIndex];
      nextCard.style.transition = transitionStr;
      nextCard.classList.add('active');

      // Doble requestAnimationFrame: garantiza que el navegador ha pintado el estado inicial
      // antes de iniciar la transición. Más fiable que void offsetWidth en Safari/WebKit.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          nextCard.style.transform = 'translateY(0)';
        });
      });

      onceTransitionEnd(nextCard).then(() => {
        // Las intermedias se posicionan AHORA (ya tapadas por la card nueva)
        updateIntermediates();
        isAnimating = false;
        triggerCardAnimations(currentIndex);
      });

    } else {
      const prevCard = cards[prevIndex];
      prevCard.style.transition = transitionStr;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          prevCard.style.transform = 'translateY(100%)';
          prevCard.classList.remove('active');
        });
      });

      onceTransitionEnd(prevCard).then(() => {
        isAnimating = false;
        triggerCardAnimations(currentIndex);
      });
    }
  }

  // Trigger animaciones específicas por card
  function triggerCardAnimations(index) {
    const safeGsap = typeof gsap !== 'undefined' ? gsap : null;

    // Card 1: Video & Logo
    const video = document.getElementById('bg-video');
    if (index === 0) {
      const prompt = document.getElementById('discoverPrompt');
      if (prompt && safeGsap) {
        safeGsap.to(prompt, { autoAlpha: 1, delay: 0.5 });
      } else if (prompt) {
        prompt.style.opacity = '1';
        prompt.style.visibility = 'visible';
      }
      if (video) {
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    } else {
      const prompt = document.getElementById('discoverPrompt');
      if (prompt && safeGsap) {
        safeGsap.to(prompt, { autoAlpha: 0 });
      } else if (prompt) {
        prompt.style.opacity = '0';
      }
      if (video) video.pause();
    }

    // Card 2: Paneles — resetear estado al salir
    if (index !== 1) {
      const panelsSection = document.querySelector('.two-panels-section');
      if (panelsSection) {
        panelsSection.classList.remove('panel-bodas-expanded', 'panel-eventos-expanded');
        panelsSection.classList.remove('is-hover-bodas', 'is-hover-eventos');
        document.querySelectorAll('.panel-text').forEach(t => {
          t.classList.remove('visible');
          t.setAttribute('aria-hidden', 'true');
        });
        document.querySelectorAll('.panel').forEach(p => p.setAttribute('aria-expanded', 'false'));
      }
    }

    // Card 3: Collage — asegurar que la animación corre
    if (index === 2) {
      document.querySelectorAll('.collage-row').forEach(row => {
        row.style.animationPlayState = 'running';
      });
    }

    // Card 4: Contacto — mostrar intro o formulario según estado
    if (index === 3) {
      const intro = document.getElementById('contactIntro');
      const form = document.getElementById('contactFormContainer');
      if (intro && form) {
        intro.classList.remove('active', 'hidden');
        form.classList.remove('active', 'hidden');

        if (isContactFormActive) {
          form.classList.add('active');
          intro.classList.add('hidden');
        } else {
          intro.classList.add('active');
          form.classList.add('hidden');
        }
      }
    }
  }

  function checkNavbarContrast() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    navbar.classList.toggle('solid-bg', currentIndex > 0);
  }

  function updateIndicators() {
    indicators.forEach((ind, i) => {
      ind.classList.toggle('active', i === currentIndex);
    });
  }

  // ─── Event Listeners ───────────────────────────────────────────────────────

  // Wheel (desktop)
  window.addEventListener('wheel', (e) => {
    if (document.body.classList.contains('no-scroll') ||
        document.querySelector('.menu-overlay.open') ||
        e.target.closest('.contact-form')) return;

    const now = Date.now();
    if (now - lastScrollTime < scrollCooldown) return;

    if (Math.abs(e.deltaY) > 20) {
      goToCard(e.deltaY > 0 ? currentIndex + 1 : currentIndex - 1);
      lastScrollTime = now;
    }
  }, { passive: true });

  // Touch (móvil / tablet)
  let touchStartY = 0;
  let touchStartX = 0;
  let touchMoved = false;

  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    touchMoved = false;
  }, { passive: true });

  window.addEventListener('touchmove', () => {
    touchMoved = true;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    // Ignorar taps (sin movimiento) y gestos en contextos especiales
    if (!touchMoved) return;
    if (document.body.classList.contains('no-scroll') ||
        document.querySelector('.menu-overlay.open') ||
        e.target.closest('.contact-form')) return;

    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const diffY = touchStartY - touchEndY;
    const diffX = Math.abs(touchStartX - touchEndX);

    // Si el swipe es principalmente horizontal (collage, carruseles, etc.) no navegar
    if (diffX > Math.abs(diffY)) return;

    const now = Date.now();
    if (now - lastScrollTime < scrollCooldown) return;

    if (Math.abs(diffY) > 50) {
      goToCard(diffY > 0 ? currentIndex + 1 : currentIndex - 1);
      lastScrollTime = now;
    }
  }, { passive: true });

  // touchcancel: resetear estado para evitar swipes fantasma
  window.addEventListener('touchcancel', () => {
    touchMoved = false;
  }, { passive: true });

  // Teclado
  window.addEventListener('keydown', (e) => {
    if (document.body.classList.contains('no-scroll')) return;
    const now = Date.now();
    if (now - lastScrollTime < 300) return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      goToCard(currentIndex + 1);
      lastScrollTime = now;
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      goToCard(currentIndex - 1);
      lastScrollTime = now;
    }
  });

  // Click en indicadores de scroll
  indicators.forEach(ind => {
    ind.addEventListener('click', () => {
      goToCard(parseInt(ind.dataset.index, 10));
    });
  });

  // Botón "Descubrir más"
  const discoverBtn = document.getElementById('discoverPrompt');
  if (discoverBtn) {
    discoverBtn.addEventListener('click', () => goToCard(1));
  }

  // Botón Contacta (Navbar y menú lateral) → última card
  document.querySelectorAll('.contact-toggle, #menuContactLink').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const closeMenuBtn = document.getElementById('closeMenuButton');
      if (closeMenuBtn && document.getElementById('sideMenu').classList.contains('open')) {
        closeMenuBtn.click();
      }
      goToCard(totalCards - 1, true);
    });
  });

  // Botón Inicio (Menú lateral) → primera card
  const homeLink = document.getElementById('menuHomeLink');
  if (homeLink) {
    homeLink.addEventListener('click', (e) => {
      e.preventDefault();
      const closeMenuBtn = document.getElementById('closeMenuButton');
      if (closeMenuBtn && document.getElementById('sideMenu').classList.contains('open')) {
        closeMenuBtn.click();
      }
      goToCard(0);
    });
  }

  // ─── Lógica interna de la sección Contacto (Intro ↔ Formulario) ───────────

  const showFormBtn = document.getElementById('showContactFormBtn');
  const closeFormBtn = document.getElementById('closeContactFormBtn');
  const contactIntro = document.getElementById('contactIntro');
  const contactFormContainer = document.getElementById('contactFormContainer');

  if (showFormBtn && contactIntro && contactFormContainer) {
    showFormBtn.addEventListener('click', () => {
      isContactFormActive = true;
      contactIntro.classList.remove('active');
      setTimeout(() => {
        contactFormContainer.classList.remove('hidden');
        contactFormContainer.classList.add('active');
      }, 300);
    });
  }

  if (closeFormBtn && contactIntro && contactFormContainer) {
    closeFormBtn.addEventListener('click', () => {
      isContactFormActive = false;
      contactFormContainer.classList.remove('active');
      setTimeout(() => {
        contactIntro.classList.remove('hidden');
        contactIntro.classList.add('active');
      }, 300);
    });
  }

  // Inicializar
  init();
});
