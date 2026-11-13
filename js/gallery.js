(() => {
  'use strict';
  const previews = Array.from(document.querySelectorAll('#gallery-grid .gallery-preview'));
  const dialog = document.getElementById('gallery-modal');
  const image = document.getElementById('modal-image');
  const caption = document.getElementById('modal-caption');
  const status = document.createElement('p');
  status.className = 'mt-3';
  status.setAttribute('role', 'status');
  status.textContent = `${previews.length} club photographs. Select one to preview, then use Previous or Next.`;
  document.getElementById('gallery-results').append(status);
  let current = 0;
  let opener = null;

  function showPhoto(index) {
    if (!previews.length) return;
    current = (index + previews.length) % previews.length;
    const button = previews[current];
    image.src = button.dataset.image;
    image.alt = button.querySelector('img').alt;
    caption.textContent = `${button.closest('article').querySelector('h3').textContent} · ${current + 1} of ${previews.length}`;
    status.textContent = `Viewing photograph ${current + 1} of ${previews.length}.`;
  }

  previews.forEach((button, index) => {
    button.disabled = false;
    button.addEventListener('click', () => {
      opener = button;
      showPhoto(index);
      dialog.showModal();
    });
  });
  if (!previews.length) status.textContent = 'No club photographs are available yet.';
  document.getElementById('previous-image-btn').addEventListener('click', () => showPhoto(current - 1));
  document.getElementById('next-image-btn').addEventListener('click', () => showPhoto(current + 1));
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(current + 1); }
    if (event.key === 'Home') { event.preventDefault(); showPhoto(0); }
    if (event.key === 'End') { event.preventDefault(); showPhoto(previews.length - 1); }
  });
  dialog.addEventListener('close', () => { if (opener) opener.focus(); });
})();
