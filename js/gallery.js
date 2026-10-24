(() => {
'use strict';
const { element } = window.Experience;
const previews = [...document.querySelectorAll('#gallery-grid .gallery-preview')];
const dialog = document.getElementById('gallery-modal');
const image = document.getElementById('modal-image');
const caption = document.getElementById('modal-caption');
const results = document.getElementById('gallery-results');
let current = 0;
let opener = null;
previews.forEach((button) => { button.disabled = false; });
const galleryStatus = element('p', 'mt-3', `${previews.length} club photographs. Select one to preview, then use Previous or Next.`);
galleryStatus.setAttribute('role', 'status');
results.append(galleryStatus);
function showPhoto(index) {
  current = (index + previews.length) % previews.length;
  const button = previews[current];
  const thumbnail = button.querySelector('img');
  image.src = button.dataset.image;
  image.alt = thumbnail.alt;
  caption.textContent = `${button.closest('article').querySelector('h3').textContent} · ${current + 1} of ${previews.length}`;
  galleryStatus.textContent = `Viewing photograph ${current + 1} of ${previews.length}.`;
}
previews.forEach((button, index) => {
  button.addEventListener('click', () => {
    opener = button;
    showPhoto(index);
    dialog.showModal();
  });
});
document.getElementById('previous-image-btn').addEventListener('click', () => showPhoto(current - 1));
document.getElementById('next-image-btn').addEventListener('click', () => showPhoto(current + 1));
dialog.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(current - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(current + 1); }
});
dialog.addEventListener('close', () => { if (opener) opener.focus(); });

})();
