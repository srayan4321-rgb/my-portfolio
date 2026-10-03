/* Contact form: no backend needed. Opens the visitor's email app with the
   message pre-filled and addressed to the email set in the form's data-email. */
document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const form = document.querySelector('.contact-form');
  if (!form) return;
  const note = form.querySelector('.form-note');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('.field').forEach((f) => {
      const input = f.querySelector('input, textarea');
      const valid = input.value.trim() && input.checkValidity();
      f.classList.toggle('has-error', !valid);
      if (!valid) ok = false;
    });
    note.classList.toggle('is-error', !ok);
    if (!ok) { note.textContent = 'Please fill in all fields with a valid email.'; return; }

    const data = new FormData(form);
    const subject = 'Portfolio enquiry from ' + data.get('name').trim();
    const body = data.get('message').trim() + '\n\n— ' + data.get('name').trim() + '\n' + data.get('email').trim();
    window.location.href = 'mailto:' + form.dataset.email +
      '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    note.textContent = 'Opening your email app… if nothing opens, email me directly at ' + form.dataset.email + '.';
  });

  form.addEventListener('input', (e) => {
    const f = e.target.closest('.field');
    if (f) f.classList.remove('has-error');
  });
});
