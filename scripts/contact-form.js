document.addEventListener('DOMContentLoaded', () => {
  // CONFIGURACIÓN: Cambia este email por el tuyo para recibir los mensajes
  const EMAIL_DESTINO = "r774music@gmail.com"; 

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
      
      submitBtn.classList.add('loading');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;
      
      const formData = new FormData(contactForm);
      
      // 1. Obtener y formatear datos
      const countrySelect = document.getElementById('country-code');
      const countryText = countrySelect.options[countrySelect.selectedIndex].text; // Ej: "🇪🇸 +34"
      const countryValue = formData.get('country-code');
      const phoneNumber = formData.get('telefono');
      
      // 2. Crear un nuevo objeto con los campos ordenados y en mayúsculas
      // Usamos un nuevo FormData o un objeto simple si lo enviáramos como JSON,
      // pero como formsubmit espera FormData, reconstruimos uno limpio.
      const cleanData = new FormData();
      
      // Configuración de FormSubmit (campos ocultos primero)
      cleanData.append('_subject', 'Nuevo contacto desde Web Euphony');
      cleanData.append('_template', 'table');
      cleanData.append('_captcha', 'false');

      // Campos visibles (En Mayúsculas)
      cleanData.append('NOMBRE', formData.get('nombre'));
      cleanData.append('EMAIL', formData.get('email'));
      
      // País/Código (Reemplazando country-code)
      cleanData.append('PAÍS/CÓDIGO', countryText);

      // Teléfono formateado
      const fullPhone = countryValue === 'otro' ? phoneNumber : `${countryValue} ${phoneNumber}`;
      cleanData.append('TELÉFONO', fullPhone);
      
      cleanData.append('MENSAJE', formData.get('servicio'));

      fetch(`https://formsubmit.co/ajax/${EMAIL_DESTINO}`, {
        method: "POST",
        body: cleanData
      })
      .then(response => response.json())
      .then(data => {
        // Ocultar formulario y mostrar mensaje de agradecimiento
        contactForm.style.display = 'none';
        
        if (thankYouMessage) {
            thankYouMessage.style.display = 'block';
            gsap.fromTo(thankYouMessage, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        submitBtn.textContent = 'Error';
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }, 3000);
        alert('Hubo un problema al enviar el formulario. Por favor, verifica tu conexión o inténtalo más tarde.');
      });
    });
  }
});
