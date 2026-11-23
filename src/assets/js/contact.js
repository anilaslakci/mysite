(() => {
  const en = document.documentElement.lang === 'en';
  const copy = en ? {
    required: 'Please complete this field.', email: 'Enter a valid email address.',
    read: 'Please confirm that you read the disclosure.', pending: 'Sending…',
    success: 'Thanks for your message. I’ll get back to you as soon as I can.',
    unavailable: 'The form is not active yet. You can reach me by email.',
    failed: 'Your message could not be sent. Please try again or contact me by email.'
  } : {
    required: 'Lütfen bu alanı doldurun.', email: 'Geçerli bir e-posta adresi girin.',
    read: 'Lütfen aydınlatma metnini okuduğunuzu belirtin.', pending: 'Gönderiliyor…',
    success: 'Mesajın için teşekkürler. En kısa sürede sana döneceğim.',
    unavailable: 'Form henüz etkin değil. Bana e-posta ile ulaşabilirsiniz.',
    failed: 'Mesaj gönderilemedi. Tekrar deneyebilir veya bana e-posta yazabilirsiniz.'
  };
  for (const form of document.querySelectorAll('[data-contact-form]')) {
    const submit = form.querySelector('[type="submit"]');
    const status = form.querySelector('.contact-status');
    const fallback = form.querySelector('.contact-fallback');
    const fields = [...form.querySelectorAll('[required]')];
    const endpoint = form.dataset.formEndpoint;
    const configured = /^https:\/\/formspree\.io\/f\/[a-z0-9]+$/.test(endpoint);
    submit.disabled = false;
    if (!configured) {
      status.textContent = copy.unavailable;
      fallback.hidden = false;
    }
    function showError(field, message) {
      const error = document.getElementById(field.id + '-error');
      error.textContent = message;
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', error.id);
      } else {
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
      }
    }
    for (const field of fields) {
      field.addEventListener('input', () => showError(field, ''));
      field.addEventListener('change', () => showError(field, ''));
    }
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (submit.disabled || form.elements._gotcha.value) return;
      let firstError;
      for (const field of fields) {
        const message = field.type === 'checkbox' && !field.checked ? copy.read
          : !field.value.trim() ? copy.required
          : field.validity.typeMismatch ? copy.email : '';
        showError(field, message);
        if (message) firstError ??= field;
      }
      if (firstError) {
        firstError.focus();
        return;
      }
      if (!configured) return;
      submit.disabled = true;
      fallback.hidden = true;
      status.textContent = copy.pending;
      form.setAttribute('aria-busy', 'true');
      try {
        const response = await fetch(endpoint, {
          method: 'POST', body: new FormData(form), headers: {Accept:'application/json'},
          signal: AbortSignal.timeout(15000)
        });
        if (!response.ok) throw new Error('Submission failed');
        form.reset();
        status.textContent = copy.success;
        window.gtag?.('event', 'contact_form_submit');
      } catch {
        status.textContent = copy.failed;
        fallback.hidden = false;
      } finally {
        form.removeAttribute('aria-busy');
        submit.disabled = false;
      }
    });
  }
})();
