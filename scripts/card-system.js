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
  function goToCard(index) {
    if (index < 0 || index >= totalCards || index === currentIndex || isAnimating) return;

    isAnimating = true;
    const direction = index > currentIndex ? 'down' : 'up';
    const prevIndex = currentIndex;
    currentIndex = index;

    updateIndicators();

    if (direction === 'down') {
      // Nueva card desliza hacia arriba (cubriendo la actual)
      const nextCard = cards[currentIndex];
      nextCard.style.transition = `transform ${animationDuration/1000}s cubic-bezier(0.65, 0, 0.35, 1)`;
      nextCard.classList.add('active');
      
      // Forzar reflow
      void nextCard.offsetWidth; 
      
      nextCard.style.transform = 'translateY(0)';
      
      // Efecto parallax en la card anterior (opcional)
      const prevCard = cards[prevIndex];
      // prevCard.style.transform = 'scale(0.95)'; // Ejemplo sutil
      
    } else {
      // Card actual desliza hacia abajo (revelando la anterior)
      const currentCard = cards[prevIndex];
      currentCard.style.transition = `transform ${animationDuration/1000}s cubic-bezier(0.65, 0, 0.35, 1)`;
      currentCard.style.transform = 'translateY(100%)';
      currentCard.classList.remove('active');
      
      const prevCard = cards[currentIndex];
      // prevCard.style.transform = 'scale(1)'; // Restaurar escala
    }

    // Gestionar eventos al terminar la transición
    setTimeout(() => {
      isAnimating = false;
      triggerCardAnimations(currentIndex);
      
      // Ajustar clases de navbar si es necesario (ej: dark mode)
      checkNavbarContrast();
    }, animationDuration);
  }

  // Trigger animaciones específicas por card
  function triggerCardAnimations(index) {
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
  }

  function checkNavbarContrast() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    // Card 0 (Video) es oscura, texto blanco (default)
    // Card 1 (Paneles) es oscura, texto blanco
    // Card 2 (Collage) es oscura, texto blanco
    // Card 3 (Footer) es clara o oscura? Fondo negro.
    
    // Si alguna sección tuviera fondo claro, aquí cambiaríamos la clase
    // Por ahora todo es fondo oscuro, así que navbar transparente/blanca está bien.
    // Solo añadimos fondo negro sólido si no estamos en la home
    
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

  // Event Listeners
  
  // Wheel
  window.addEventListener('wheel', (e) => {
    // Si hay un modal abierto (menú, contacto), no scrollear cards
    if (document.body.classList.contains('no-scroll') || 
        document.querySelector('.menu-overlay.open') || 
        document.querySelector('.footer.modal-active')) return;

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
    // Si hay un modal abierto (menú, contacto), no scrollear cards
    if (document.body.classList.contains('no-scroll') || 
        document.querySelector('.menu-overlay.open') || 
        document.querySelector('.footer.modal-active')) return;

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
      goToCard(totalCards - 1);
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

  // Inicializar
  init();
});
