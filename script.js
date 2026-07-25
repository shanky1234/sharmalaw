const navigation = document.querySelector('.main-nav');
let menuButton = document.querySelector('.menu-toggle');

const themeVersion = 'slate-copper-beige-2';
['theme.css', 'footer.css'].forEach((href) => {
  const versionedHref = `${href}?v=${themeVersion}`;
  if (document.querySelector(`link[href="${href}"]`)) return;
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = versionedHref;
  document.head.append(stylesheet);
});

if (navigation && !menuButton) {
  menuButton = document.createElement('button');
  menuButton.className = 'menu-toggle';
  menuButton.setAttribute('aria-label', 'Open navigation');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.innerHTML = '<span></span><span></span><span></span>';
  navigation.before(menuButton);
}

menuButton?.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.main-nav a').forEach((link) => link.addEventListener('click', () => {
  navigation.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

const form = document.querySelector('#consultation-form');
const message = document.querySelector('.form-message');
form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  const fields = Object.fromEntries(new FormData(form).entries());
  message.textContent = 'Sending your request...';
  submitButton.disabled = true;

  try {
    const response = await fetch('/api/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Unable to save your request.');

    message.textContent = 'Thank you. Your consultation request has been received.';
    form.reset();
  } catch (error) {
    message.textContent = error.message || 'Unable to save your request. Please try again.';
  } finally {
    submitButton.disabled = false;
  }
});

document.querySelectorAll('#year').forEach((year) => {
  year.textContent = new Date().getFullYear();
});

document.querySelectorAll('footer').forEach((footer) => {
  if (footer.querySelector('.footer-address')) return;

  const address = document.createElement('address');
  address.className = 'footer-address';
  address.innerHTML = '<span>Visit the chamber</span><a class="footer-location" href="https://www.google.com/maps/search/?api=1&amp;query=72%2F1%20Topsia%20Road%20South%2C%20Kolkata%20700046" target="_blank" rel="noopener">72/1 Topsia Road South<br>Kolkata - 700046</a><a class="footer-phone" href="tel:+918272989587">Mobile: 8272989587</a>';
  footer.children[0]?.after(address);

  const copyright = footer.querySelector('p');
  const backLink = footer.querySelector(':scope > a:last-child');
  if (copyright && backLink) {
    const meta = document.createElement('div');
    meta.className = 'footer-meta';
    copyright.before(meta);
    meta.append(copyright, backLink);
  }
});

async function updateVisitorCounter() {
  if (document.body.classList.contains('admin-page')) return;

  try {
    const response = await fetch('/api/site-visits', { method: 'POST' });
    if (!response.ok) return;
    const stats = await response.json();

    document.querySelectorAll('.footer-meta').forEach((meta) => {
      let counter = meta.querySelector('.visitor-count');
      if (!counter) {
        counter = document.createElement('p');
        counter.className = 'visitor-count';
        meta.prepend(counter);
      }
      counter.textContent = `Page visits: ${Number(stats.page_views).toLocaleString('en-IN')}`;
    });
  } catch (_) {
    // The public site remains fully usable when a hosted counter API is unavailable.
  }
}

updateVisitorCounter();
