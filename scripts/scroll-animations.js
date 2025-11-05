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
    // Inicia la animación del segundo logo y el desvanecimiento del primero simultáneamente
    .to('.logo', { 
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', 
        duration: 1.5, 
        ease: 'power2.inOut' 
    }, "+=0.2") // Iniciar poco después de que el color aparezca
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

  // Animate the video to fade to black on scroll
  gsap.to(video, {
    opacity: 0,
    scrollTrigger: {
      trigger: videoSpacer,
      start: 'top top',
      end: '+=300', // completar el desvanecimiento más rápido
      scrub: true,
      ease: 'power1.out',
    },
  });

  // Animate the logo on scroll
  gsap.to(logo, {
    top: '10%', // Fijar más abajo del borde superior
    left: '50%',
    transform: 'translate(-50%, -50%)',
    scale: 0.33, // Más pequeño al finalizar
    scrollTrigger: {
      trigger: videoSpacer,
      start: 'top top',
      end: '+=300', // encoger en pocos scrolls
      scrub: true,
      ease: 'power2.out',
    },
  });

  // Ocultar el logo cuando entra el contenido principal; mostrar al subir
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    ScrollTrigger.create({
      trigger: mainContent,
      start: 'top top',
      onEnter: () => gsap.to(logo, { autoAlpha: 0, duration: 0.2 }),
      onLeaveBack: () => gsap.to(logo, { autoAlpha: 1, duration: 0.2 })
    });
  }

  // Difuminar y desaparecer el logo justo antes de la primera foto
  const firstImageContainer = document.querySelector('.image-container');
  if (firstImageContainer) {
    gsap.to(logo, {
      autoAlpha: 0,
      scrollTrigger: {
        trigger: firstImageContainer,
        start: 'top 85%', // empieza a desvanecer antes de que la imagen entre
        end: 'top 65%', // termina de desaparecer antes de verla completa
        scrub: true,
        ease: 'power1.out'
      }
    });
  }
});