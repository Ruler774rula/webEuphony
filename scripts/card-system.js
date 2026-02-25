/**
 * Sistema de Cards Superpuestas con Detección de Scroll
 * Maneja la navegación entre secciones tipo "card" con transiciones suaves.
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('card-scroll-container');
  if (!container) return; // Si no estamos en la página principal, salir.

  const cards = Array.from(document.querySelectorAll('.card-section'));
  const indicators = document.querySelectorAll('.scroll-indicators .indicator');
  const totalCards = cards.length;
  let currentIndex = 0;
  let isAnimating = false;
  let lastScrollTime = 0;
  const animationDuration = 1000; // ms (coincide con CSS transition)
  const scrollCooldown = 1200; // ms

  // Inicializar estado
  function init() {
    // Asegurar que la primera card sea visible
    cards.forEach((card, index) => {
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
    
    // Iniciar animaciones de entrada para la primera card si es necesario
    triggerCardAnimations(0);
  }

  // Ir a una card específica
  function goToCard(index, immediateForm = false) {
    if (index < 0 || index >= totalCards || index === currentIndex || isAnimating) return;

    isAnimating = true;
    const direction = index > currentIndex ? 'down' : 'up';
    const prevIndex = currentIndex;
    currentIndex = index;

    updateIndicators();
    // Ajustar clases de navbar INMEDIATAMENTE al empezar la transición
    checkNavbarContrast();

    // Función auxiliar para actualizar cards intermedias sin animación
    const updateIntermediates = () => {
      cards.forEach((card, i) => {
        // No tocar la card actual ni la previa en este bucle, ellas tienen su propia animación
        if (i !== currentIndex && i !== prevIndex) {
          card.style.transition = 'none';
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

    if (direction === 'up') {
      // Si subimos (volvemos atrás), escondemos las intermedias ANTES para que al quitar la superior se vea la destino
      updateIntermediates();
    }

    if (direction === 'down') {
      // Nueva card desliza hacia arriba (cubriendo la actual)
      const nextCard = cards[currentIndex];
      nextCard.style.transition = `transform ${animationDuration/1000}s cubic-bezier(0.65, 0, 0.35, 1)`;
      nextCard.classList.add('active');
      
      // Forzar reflow
      void nextCard.offsetWidth; 
      
      nextCard.style.transform = 'translateY(0)';
      
    } else {
      // Card actual desliza hacia abajo (revelando la anterior)
      const currentCard = cards[prevIndex];
      currentCard.style.transition = `transform ${animationDuration/1000}s cubic-bezier(0.65, 0, 0.35, 1)`;
      currentCard.style.transform = 'translateY(100%)';
      currentCard.classList.remove('active');
    }

    // Gestionar eventos al terminar la transición
    setTimeout(() => {
      if (direction === 'down') {
        // Si bajamos (avanzamos), actualizamos las intermedias AHORA (que ya están tapadas)
        updateIntermediates();
      }
      isAnimating = false;
      triggerCardAnimations(currentIndex, immediateForm);
    }, animationDuration);
  }

  // Trigger animaciones específicas por card
  function triggerCardAnimations(index, immediateForm = false) {
    // Resetear animaciones de otras cards si es necesario
    
    // Card 1: Video & Logo
    const video = document.getElementById('bg-video');
    if (index === 0) {
      const prompt = document.getElementById('discoverPrompt');
      if (prompt) gsap.to(prompt, { autoAlpha: 1, delay: 0.5 });
      if (video) video.play().catch(() => {});
    } else {
      const prompt = document.getElementById('discoverPrompt');
      if (prompt) gsap.to(prompt, { autoAlpha: 0 });
      if (video) video.pause();
    }

    // Card 2: Paneles
    // Si NO estamos en la card de paneles (índice 1), reseteamos su estado
    if (index !== 1) {
      const panelsSection = document.querySelector('.two-panels-section');
      if (panelsSection) {
        panelsSection.classList.remove('panel-bodas-expanded', 'panel-eventos-expanded');
        panelsSection.classList.remove('is-hover-bodas', 'is-hover-eventos');
        // Ocultar textos
        const texts = document.querySelectorAll('.panel-text');
        texts.forEach(t => {
          t.classList.remove('visible');
          t.setAttribute('aria-hidden', 'true');
        });
        // Resetear aria
        const panels = document.querySelectorAll('.panel');
        panels.forEach(p => p.setAttribute('aria-expanded', 'false'));
      }
    }

    // Card 3: Collage
    if (index === 2) {
      // Asegurar que marquee corre
      const rows = document.querySelectorAll('.collage-row');
      rows.forEach(row => row.style.animationPlayState = 'running');
    }

    // Card 4: Contacto
    if (index === 3) {
      const intro = document.getElementById('contactIntro');
      const form = document.getElementById('contactFormContainer');
      if (intro && form) {
        // Remover clases de transición previas para evitar conflictos
        intro.classList.remove('active', 'hidden');
        form.classList.remove('active', 'hidden');

        if (immediateForm) {
          // Mostrar formulario directamente
          form.classList.add('active');
          intro.classList.add('hidden'); // Asegurar que intro esté oculta
        } else {
          // Mostrar intro por defecto (navegación scroll)
          intro.classList.add('active');
          form.classList.add('hidden'); // Asegurar que form esté oculto
        }
      }
    }
  }

  function checkNavbarContrast() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    if (currentIndex > 0) {
      navbar.classList.add('solid-bg');
    } else {
      navbar.classList.remove('solid-bg');
    }
  }

  function updateIndicators() {
    indicators.forEach((ind, i) => {
      if (i === currentIndex) {
        ind.classList.add('active');
      } else {
        ind.classList.remove('active');
      }
    });
  }

  // --- LOGICA DE CONTACTO ---
  // Se ha simplificado: el formulario siempre es visible en la última card.

  // Event Listeners
  
  // Wheel
  window.addEventListener('wheel', (e) => {
    // Si hay un modal abierto (menú), no scrollear cards.
    // Si el formulario está abierto, permitimos scroll SOLO si no es dentro del formulario mismo (para evitar conflicto con scroll interno del form)
    if (document.body.classList.contains('no-scroll') || 
        document.querySelector('.menu-overlay.open') ||
        e.target.closest('.contact-form')) return;

    const now = Date.now();
    if (now - lastScrollTime < scrollCooldown) return;

    if (Math.abs(e.deltaY) > 20) {
      if (e.deltaY > 0) {
        goToCard(currentIndex + 1);
      } else {
        goToCard(currentIndex - 1);
      }
      lastScrollTime = now;
    }
  }, { passive: true });

  // Touch
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    // Si hay un modal abierto (menú), no scrollear cards
    // Lo mismo para el formulario: si el toque fue dentro del form, no cambiamos de card
    if (document.body.classList.contains('no-scroll') || 
        document.querySelector('.menu-overlay.open') ||
        e.target.closest('.contact-form')) return;

    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    
    const now = Date.now();
    if (now - lastScrollTime < scrollCooldown) return;

    if (Math.abs(diff) > 50) {
      if (diff > 0) { // Swipe Up -> Scroll Down
        goToCard(currentIndex + 1);
      } else { // Swipe Down -> Scroll Up
        goToCard(currentIndex - 1);
      }
      lastScrollTime = now;
    }
  }, { passive: true });

  // Keyboard
  window.addEventListener('keydown', (e) => {
    if (document.body.classList.contains('no-scroll')) return;
    
    const now = Date.now();
    if (now - lastScrollTime < 300) return; // Menor cooldown para teclado

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      goToCard(currentIndex + 1);
      lastScrollTime = now;
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      goToCard(currentIndex - 1);
      lastScrollTime = now;
    }
  });

  // Click en indicadores
  indicators.forEach(ind => {
    ind.addEventListener('click', () => {
      const index = parseInt(ind.dataset.index);
      goToCard(index);
    });
  });

  // Botón Discover
  const discoverBtn = document.getElementById('discoverPrompt');
  if (discoverBtn) {
    discoverBtn.addEventListener('click', () => goToCard(1));
  }
  
  // Botón Contacta (Navbar) - Ir a última card
  const contactBtns = document.querySelectorAll('.contact-toggle, #menuContactLink');
  contactBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Cerrar menú si está abierto
      const closeMenuBtn = document.getElementById('closeMenuButton');
      if (closeMenuBtn && document.getElementById('sideMenu').classList.contains('open')) {
        closeMenuBtn.click();
      }
      
      goToCard(totalCards - 1, true); // true para mostrar formulario directamente
    });
  });
  
  // Botón Inicio (Menú)
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

  // Lógica interna de la sección Contacto (Intro <-> Form)
  const showFormBtn = document.getElementById('showContactFormBtn');
  const closeFormBtn = document.getElementById('closeContactFormBtn');
  const contactIntro = document.getElementById('contactIntro');
  const contactFormContainer = document.getElementById('contactFormContainer');

  if (showFormBtn && contactIntro && contactFormContainer) {
    showFormBtn.addEventListener('click', () => {
      // 1. Iniciar salida de la intro
      contactIntro.classList.remove('active');
      
      // 2. Esperar un poco antes de activar el formulario para que se note la transición
      setTimeout(() => {
        contactFormContainer.classList.remove('hidden'); // Asegurar que no tenga hidden
        contactFormContainer.classList.add('active');
      }, 300); 
    });
  }

  if (closeFormBtn && contactIntro && contactFormContainer) {
    closeFormBtn.addEventListener('click', () => {
      contactFormContainer.classList.remove('active');
      setTimeout(() => {
        contactIntro.classList.remove('hidden'); // Asegurar que no tenga hidden
        contactIntro.classList.add('active');
      }, 300);
    });
  }

  // Inicializar
  init();
});
