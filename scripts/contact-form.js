document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactFormElement');
  const submitBtn = contactForm ? contactForm.querySelector('.submit-btn') : null;
  const thankYouMessage = document.getElementById('thankYouMessage');
  const formHeader = document.querySelector('.form-header');

  if (contactForm && submitBtn) {
    const updateSubmitState = () => {
      submitBtn.disabled = !contactForm.checkValidity();
    };

    contactForm.addEventListener('input', updateSubmitState);
    contactForm.addEventListener('change', updateSubmitState);
    
    // Initial check
    updateSubmitState();

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Simulate submission
      submitBtn.classList.add('loading');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;
      
      setTimeout(() => {
        contactForm.style.display = 'none';
        
        if (thankYouMessage) {
            thankYouMessage.style.display = 'block';
            gsap.fromTo(thankYouMessage, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' });
        }
      }, 1500);
    });
  }
});
