(() => {
  const existing = document.querySelector('.back-to-index');
  if (existing) return;

  const link = document.createElement('a');
  link.className = 'back-to-index';
  link.href = '../index.html';
  link.setAttribute('aria-label', 'Back to index');
  link.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  `;

  const target = document.body || document.documentElement;
  target.appendChild(link);
})();
